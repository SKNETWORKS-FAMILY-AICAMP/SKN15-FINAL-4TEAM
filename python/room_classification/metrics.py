import torch
import numpy as np
from pathlib import Path
from PIL import Image
from tqdm import tqdm
import json
import matplotlib.pyplot as plt

from model import EmptyRoomModel
from dataset_loader import create_dataloaders
from metrics import EvaluationMetrics, print_metrics


class Tester:
    def __init__(self, 
                 model: EmptyRoomModel,
                 test_loader,
                 test_dataset,
                 save_dir: str = "test_results"):
        self.model = model
        self.test_loader = test_loader
        self.test_dataset = test_dataset
        self.device = model.device
        
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        
        # 평가 지표 초기화
        self.evaluator = EvaluationMetrics(device=self.device)
    
    def test_model(self, num_inference_steps: int = 50):
        """
        테스트 데이터셋 전체에 대해 평가
        """
        self.model.eval()
        
        all_metrics = {
            'ssim': [],
            'psnr': [],
            'lpips': [],
            'clip_score': []
        }
        
        print("=" * 60)
        print("모델 테스트 시작")
        print("=" * 60)
        
        for idx in tqdm(range(len(self.test_dataset)), desc="Testing"):
            # 원본 이미지 로드
            furnished_pil, target_pil, caption = self.test_dataset.get_raw_images(idx)
            
            # 전처리
            furnished_tensor = self.test_dataset.transform(furnished_pil).unsqueeze(0).to(self.device)
            target_tensor = self.test_dataset.transform(target_pil).unsqueeze(0).to(self.device)
            
            # 이미지 생성
            generated_tensor = self.model.generate(
                furnished_tensor,
                caption,
                num_inference_steps=num_inference_steps
            )
            
            # Tensor를 PIL로 변환
            generated_pil = self._tensor_to_pil(generated_tensor)
            
            # 평가
            metrics = self.evaluator.evaluate_pair(
                generated_tensor,
                target_tensor,
                generated_pil,
                caption
            )
            
            # 메트릭 저장
            for key in all_metrics:
                all_metrics[key].append(metrics[key])
            
            # 시각화 (처음 10개만)
            if idx < 10:
                self._save_comparison(
                    idx,
                    furnished_pil,
                    target_pil,
                    generated_pil,
                    caption,
                    metrics
                )
        
        # 평균 계산
        avg_metrics = {
            key: np.mean(values) for key, values in all_metrics.items()
        }
        
        # 결과 출력
        print("\n" + "=" * 60)
        print("테스트 결과 (평균)")
        print("=" * 60)
        print_metrics(avg_metrics)
        
        # 결과 저장
        self._save_results(all_metrics, avg_metrics)
        
        return avg_metrics
    
    def _tensor_to_pil(self, tensor: torch.Tensor) -> Image.Image:
        """Tensor를 PIL Image로 변환"""
        img = tensor.squeeze(0).permute(1, 2, 0).cpu().numpy()
        img = ((img + 1) / 2 * 255).clip(0, 255).astype(np.uint8)
        return Image.fromarray(img)
    
    def _save_comparison(self, 
                        idx: int,
                        furnished: Image.Image,
                        target: Image.Image,
                        generated: Image.Image,
                        caption: str,
                        metrics: dict):
        """비교 이미지 저장"""
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        
        axes[0].imshow(furnished)
        axes[0].set_title("Input (Furnished)")
        axes[0].axis('off')
        
        axes[1].imshow(target)
        axes[1].set_title("Target (Empty)")
        axes[1].axis('off')
        
        axes[2].imshow(generated)
        axes[2].set_title("Generated (Empty)")
        axes[2].axis('off')
        
        # 메트릭 정보 추가
        metric_text = (f"SSIM: {metrics['ssim']:.3f} | "
                      f"PSNR: {metrics['psnr']:.2f} | "
                      f"LPIPS: {metrics['lpips']:.3f} | "
                      f"CLIP: {metrics['clip_score']:.1f}")
        
        plt.suptitle(f"Test Sample {idx}\nCaption: {caption[:60]}...\n{metric_text}", 
                    fontsize=10)
        plt.tight_layout()
        
        save_path = self.save_dir / f"comparison_{idx}.png"
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()
    
    def _save_results(self, all_metrics: dict, avg_metrics: dict):
        """결과를 JSON으로 저장"""
        results = {
            'average': avg_metrics,
            'std': {
                key: float(np.std(values)) for key, values in all_metrics.items()
            },
            'individual': {
                idx: {key: all_metrics[key][idx] for key in all_metrics}
                for idx in range(len(all_metrics['ssim']))
            }
        }
        
        results_file = self.save_dir / "test_results.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n결과 저장 완료: {results_file}")


def generate_from_gemini_image(model: EmptyRoomModel, 
                               image_path: str,
                               caption: str = "A modern empty room",
                               save_path: str = "gemini_test_result.png"):
    """
    Gemini로 생성한 인테리어 이미지에서 가구 제거 테스트
    
    Args:
        model: 학습된 모델
        image_path: Gemini로 생성한 인테리어 이미지 경로
        caption: 방 설명
        save_path: 결과 저장 경로
    """
    print("\n" + "=" * 60)
    print("Gemini 이미지 테스트")
    print("=" * 60)
    
    # 이미지 로드
    image = Image.open(image_path).convert('RGB')
    
    # 전처리
    from torchvision import transforms
    transform = transforms.Compose([
        transforms.Resize((512, 512)),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.5])
    ])
    
    image_tensor = transform(image).unsqueeze(0).to(model.device)
    
    # 생성
    print(f"이미지 생성 중... (Caption: {caption})")
    with torch.no_grad():
        generated_tensor = model.generate(image_tensor, caption)
    
    # 결과 저장
    generated_img = model.decode_latents(generated_tensor)
    generated_pil = transforms.ToPILImage()(
        (generated_img.squeeze(0).cpu() + 1) / 2
    )
    
    # 비교 이미지 생성
    fig, axes = plt.subplots(1, 2, figsize=(12, 6))
    
    axes[0].imshow(image)
    axes[0].set_title("Input (Furnished Room)")
    axes[0].axis('off')
    
    axes[1].imshow(generated_pil)
    axes[1].set_title("Generated (Empty Room)")
    axes[1].axis('off')
    
    plt.suptitle(f"Gemini Image Test\nCaption: {caption}")
    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    print(f"결과 저장 완료: {save_path}")
    
    return generated_pil


def main():
    BASE_PATH = os.getcwd()  # 현재 디렉토리
    DATASET_PATH = os.path.join(BASE_PATH, "dataset")
    MODEL_PATH = os.path.join(BASE_PATH, "checkpoints", "best_model.pt")
    RESULTS_PATH = os.path.join(BASE_PATH, "test_results")
    
    # 데이터로더 생성
    print("데이터로더 생성 중...")
    _, _, test_loader, _, _, test_dataset = create_dataloaders(
        dataset_path=DATASET_PATH,
        batch_size=1,
        num_workers=2
    )
    
    # 모델 로드
    print("\n모델 로드 중...")
    model = EmptyRoomModel()
    model.load_model(MODEL_PATH)
    model.eval()
    
    # 테스트 실행
    tester = Tester(
        model=model,
        test_loader=test_loader,
        test_dataset=test_dataset,
        save_dir=RESULTS_PATH
    )
    
    avg_metrics = tester.test_model(num_inference_steps=50)
    
    # Gemini 이미지 테스트 (이미지가 있는 경우)
    gemini_image_path = os.path.join(BASE_PATH, "gemini_test_image.jpg")
    if Path(gemini_image_path).exists():
        print("\nGemini 생성 이미지 테스트...")
        generate_from_gemini_image(
            model=model,
            image_path=gemini_image_path,
            caption="A modern empty room with clean walls",
            save_path=os.path.join(RESULTS_PATH, "gemini_test_result.png")
        )
    else:
        print(f"\nGemini 테스트 이미지를 찾을 수 없습니다: {gemini_image_path}")
        print("Gemini로 인테리어 이미지를 생성하여 해당 경로에 저장하세요.")


if __name__ == "__main__":
    main()
