import torch
import torch.nn as nn
import os
from diffusers import AutoencoderKL, UNet2DConditionModel, DDPMScheduler
from transformers import CLIPTextModel, CLIPTokenizer
from typing import Optional

os.environ['HF_HUB_ENABLE_HF_TRANSFER'] = '0'


class EmptyRoomModel(nn.Module):
    """가구 제거 빈방 생성 모델"""

    def __init__(
        self,
        pretrained_model_name: str = "runwayml/stable-diffusion-v1-5",
        device: str = "cuda" if torch.cuda.is_available() else "cpu",
    ):
        super().__init__()

        self.device = device

        print(f"모델 로딩... (디바이스: {device})")

        # VAE
        print("VAE 로딩...")
        self.vae = AutoencoderKL.from_pretrained(
            pretrained_model_name,
            subfolder="vae",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        ).to(device)

        # UNet
        print("UNet 로딩...")
        self.unet = UNet2DConditionModel.from_pretrained(
            pretrained_model_name,
            subfolder="unet",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        ).to(device)

        # Text Encoder
        print("Text Encoder 로딩...")
        self.text_encoder = CLIPTextModel.from_pretrained(
            pretrained_model_name,
            subfolder="text_encoder",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        ).to(device)

        # Tokenizer
        print("Tokenizer 로딩...")
        try:
            self.tokenizer = CLIPTokenizer.from_pretrained(
                pretrained_model_name, subfolder="tokenizer"
            )
        except Exception:
            print("  -> 대체 tokenizer 사용")
            self.tokenizer = CLIPTokenizer.from_pretrained(
                "openai/clip-vit-large-patch14"
            )

        # Scheduler
        print("Scheduler 로딩...")
        self.noise_scheduler = DDPMScheduler.from_pretrained(
            pretrained_model_name, subfolder="scheduler"
        )

        self.vae_scale_factor = 2 ** (len(self.vae.config.block_out_channels) - 1)

        # Freeze VAE and Text Encoder (UNet만 학습)
        self.vae.requires_grad_(False)
        self.text_encoder.requires_grad_(False)

        print("모델 로딩 완료!")

    # ----------------------------
    # Encoders / Decoders
    # ----------------------------
    def encode_text(self, prompts):
        """텍스트 임베딩"""
        text_inputs = self.tokenizer(
            prompts,
            padding="max_length",
            max_length=self.tokenizer.model_max_length,
            truncation=True,
            return_tensors="pt",
        )
        text_input_ids = text_inputs.input_ids.to(self.device)

        with torch.no_grad():
            text_embeddings = self.text_encoder(text_input_ids)[0]
        # UNet dtype과 맞추기
        return text_embeddings.to(self.unet.dtype)

    def encode_image(self, images):
        """이미지 -> latent"""
        with torch.no_grad():
            # 이미지 타입을 VAE dtype에 맞추기
            images = images.to(self.vae.dtype)
            latents = self.vae.encode(images).latent_dist.sample()
            latents = latents * self.vae.config.scaling_factor
        # UNet dtype과 맞추기
        return latents.to(self.unet.dtype)

    def decode_latents(self, latents):
        """latent -> 이미지"""
        latents = latents / self.vae.config.scaling_factor
        with torch.no_grad():
            images = self.vae.decode(latents).sample
        return images

    # ----------------------------
    # Training forward
    # ----------------------------
    def forward(self, furnished_images, empty_images, captions):
        """
        학습 시: 표준 노이즈 예측 학습
        - target: empty 이미지 latent에 노이즈 추가 → noise 예측
        - 입력: noisy(empty_latents)  (UNet은 항상 4채널 입력)
        - furnished_latents는 학습 입력에 concat하지 않음 (채널 mismatch 방지)
        """
        batch_size = furnished_images.shape[0]

        # 텍스트 임베딩
        text_embeddings = self.encode_text(captions)  # [B, 77, 768] 등

        # 이미지 -> latent
        furnished_latents = self.encode_image(furnished_images)  # [B, 4, 64, 64]
        empty_latents = self.encode_image(empty_images)          # [B, 4, 64, 64]

        # 노이즈 샘플링 및 타임스텝
        noise = torch.randn_like(empty_latents)
        timesteps = torch.randint(
            0,
            self.noise_scheduler.config.num_train_timesteps,
            (batch_size,),
            device=self.device,
        ).long()

        # target(empty) latent에 노이즈 추가
        noisy_latents = self.noise_scheduler.add_noise(empty_latents, noise, timesteps)

        # ✅ UNet 입력은 4채널(latents)만! (채널 concat 금지)
        noise_pred = self.unet(
            sample=noisy_latents,
            timestep=timesteps,
            encoder_hidden_states=text_embeddings,
        ).sample

        # 표준 MSE 노이즈 예측 손실
        loss = nn.functional.mse_loss(noise_pred, noise)
        return loss

    # ----------------------------
    # Inference (img2img-style)
    # ----------------------------
    @torch.no_grad()
    def generate(
        self,
        furnished_image,
        caption,
        num_inference_steps: int = 50,
        guidance_scale: float = 7.5,
        strength: float = 0.6,
    ):
        """
        추론: furnished 이미지를 img2img 초기값으로 사용
        - strength: 0~1, 클수록 입력 보존 ↓, 생성 변화 ↑
        """
        self.eval()

        # 텍스트 임베딩 (CFG용 uncond 포함)
        text_emb = self.encode_text([caption])
        uncond_emb = self.encode_text([""])
        text_embeddings = torch.cat([uncond_emb, text_emb], dim=0)  # [2B, ...]

        # 입력 이미지 latent
        furnished_latents = self.encode_image(furnished_image)  # [B, 4, 64, 64]

        # 스케줄러 설정
        self.noise_scheduler.set_timesteps(num_inference_steps, device=self.device)

        # strength에 따른 시작 지점 설정
        #  - timesteps는 큰 값 → 작은 값으로 진행됨
        #  - init_t_index가 클수록 더 많은 노이즈 주입(입력 보존 적음)
        init_t_index = int(strength * (len(self.noise_scheduler.timesteps) - 1))
        t_start = self.noise_scheduler.timesteps[init_t_index]

        # 초기 latent: furnished_latents에 t_start 수준 노이즈 주입
        noise = torch.randn_like(furnished_latents)
        latents = self.noise_scheduler.add_noise(furnished_latents, noise, t_start)
        latents = latents.to(self.unet.dtype)

        # 디노이징 루프
        for t in self.noise_scheduler.timesteps[init_t_index:]:
            # CFG: 배치 복제 (채널이 아니라 배치 차원으로 2배)
            latent_model_input = torch.cat([latents, latents], dim=0)

            noise_pred = self.unet(
                sample=latent_model_input,
                timestep=t,
                encoder_hidden_states=text_embeddings,
            ).sample

            # CFG 적용
            noise_pred_uncond, noise_pred_text = noise_pred.chunk(2, dim=0)
            noise_pred = noise_pred_uncond + guidance_scale * (
                noise_pred_text - noise_pred_uncond
            )

            # 스케줄러 스텝
            latents = self.noise_scheduler.step(noise_pred, t, latents).prev_sample

        # 디코딩
        generated_image = self.decode_latents(latents)
        return generated_image

    # ----------------------------
    # Save / Load
    # ----------------------------
    def save_model(self, save_path):
        """모델 저장 (UNet만 저장)"""
        torch.save(
            {
                "unet_state_dict": self.unet.state_dict(),
            },
            save_path,
        )
        print(f"모델 저장: {save_path}")

    def load_model(self, load_path):
        """모델 로드"""
        checkpoint = torch.load(load_path, map_location=self.device)
        self.unet.load_state_dict(checkpoint["unet_state_dict"])
        print(f"모델 로드: {load_path}")
