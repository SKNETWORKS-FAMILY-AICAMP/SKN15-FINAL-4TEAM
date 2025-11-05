import torch
import torch.optim as optim
from torch.utils.tensorboard import SummaryWriter
from pathlib import Path
from tqdm import tqdm
import time
from datetime import datetime
import os

from model import EmptyRoomModel
from dataset_loader import create_dataloaders


class Trainer:
    def __init__(self, model, train_loader, val_loader, 
                 learning_rate=1e-5, num_epochs=50, 
                 save_dir="checkpoints", log_dir="logs"):
        
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.num_epochs = num_epochs
        self.device = model.device
        
        # Optimizer
        self.optimizer = optim.AdamW(
            model.unet.parameters(),
            lr=learning_rate,
            weight_decay=0.01
        )
        
        # Scheduler
        self.scheduler = optim.lr_scheduler.CosineAnnealingLR(
            self.optimizer,
            T_max=num_epochs
        )
        
        # Save directory
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        
        # TensorBoard
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.writer = SummaryWriter(f"{log_dir}/run_{timestamp}")
        
        # Best model tracking
        self.best_val_loss = float('inf')
        self.global_step = 0
        
    def train_epoch(self, epoch):
        """1 epoch 학습"""
        self.model.train()
        total_loss = 0
        
        pbar = tqdm(self.train_loader, desc=f"Epoch {epoch+1}/{self.num_epochs}")
        
        for batch_idx, (furnished, empty, captions) in enumerate(pbar):
            furnished = furnished.to(self.device)
            empty = empty.to(self.device)
            
            # Forward
            loss = self.model(furnished, empty, captions)
            
            # Backward
            self.optimizer.zero_grad()
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(self.model.unet.parameters(), 1.0)
            
            self.optimizer.step()
            
            # Logging
            total_loss += loss.item()
            self.global_step += 1
            
            if batch_idx % 10 == 0:
                self.writer.add_scalar('Train/Loss', loss.item(), self.global_step)
                self.writer.add_scalar('Train/LR', self.optimizer.param_groups[0]['lr'], self.global_step)
            
            pbar.set_postfix({'loss': f'{loss.item():.4f}'})
        
        avg_loss = total_loss / len(self.train_loader)
        return avg_loss
    
    def validate(self, epoch):
        """검증"""
        self.model.eval()
        total_loss = 0
        
        with torch.no_grad():
            for furnished, empty, captions in tqdm(self.val_loader, desc="Validation"):
                furnished = furnished.to(self.device)
                empty = empty.to(self.device)
                
                loss = self.model(furnished, empty, captions)
                total_loss += loss.item()
        
        avg_loss = total_loss / len(self.val_loader)
        self.writer.add_scalar('Val/Loss', avg_loss, epoch)
        
        return avg_loss
    
    def save_checkpoint(self, epoch, val_loss, is_best=False):
        """체크포인트 저장"""
        checkpoint_path = self.save_dir / f"checkpoint_epoch_{epoch+1}.pt"
        self.model.save_model(str(checkpoint_path))
        
        if is_best:
            best_path = self.save_dir / "best_model.pt"
            self.model.save_model(str(best_path))
            print(f"✓ Best model saved! (Val Loss: {val_loss:.4f})")
    
    def train(self):
        """전체 학습"""
        print("=" * 60)
        print("학습 시작")
        print("=" * 60)
        print(f"Epochs: {self.num_epochs}")
        print(f"Train batches: {len(self.train_loader)}")
        print(f"Val batches: {len(self.val_loader)}")
        print(f"Device: {self.device}")
        print("=" * 60)
        
        start_time = time.time()
        
        for epoch in range(self.num_epochs):
            print(f"\nEpoch {epoch+1}/{self.num_epochs}")
            print("-" * 60)
            
            # Train
            train_loss = self.train_epoch(epoch)
            print(f"Train Loss: {train_loss:.4f}")
            
            # Validate
            val_loss = self.validate(epoch)
            print(f"Val Loss: {val_loss:.4f}")
            
            # LR scheduling
            self.scheduler.step()
            
            # Save model
            is_best = val_loss < self.best_val_loss
            if is_best:
                self.best_val_loss = val_loss
            
            if (epoch + 1) % 5 == 0 or is_best:
                self.save_checkpoint(epoch, val_loss, is_best)
        
        total_time = time.time() - start_time
        print("\n" + "=" * 60)
        print("학습 완료!")
        print(f"총 소요 시간: {total_time/3600:.2f} 시간")
        print(f"Best Val Loss: {self.best_val_loss:.4f}")
        print("=" * 60)
        
        self.writer.close()


def main():
    # 설정
    BASE_PATH = os.getcwd()
    DATASET_PATH = os.path.join(BASE_PATH, "dataset")
    BATCH_SIZE = 2
    NUM_EPOCHS = 50
    LEARNING_RATE = 1e-5
    IMAGE_SIZE = 512
    NUM_WORKERS = 2
    
    print(f"작업 디렉토리: {BASE_PATH}")
    print(f"데이터셋 경로: {DATASET_PATH}")
    
    # 데이터셋 존재 확인
    if not os.path.exists(DATASET_PATH):
        print(f"❌ 데이터셋을 찾을 수 없습니다: {DATASET_PATH}")
        print("dataset 폴더를 생성하고 데이터를 넣어주세요.")
        return
    
    print("\n데이터로더 생성 중...")
    try:
        train_loader, val_loader, test_loader, _, _, _ = create_dataloaders(
            dataset_path=DATASET_PATH,
            batch_size=BATCH_SIZE,
            num_workers=NUM_WORKERS,
            image_size=IMAGE_SIZE
        )
    except Exception as e:
        print(f"❌ 데이터로더 생성 실패: {e}")
        return
    
    print("\n모델 초기화 중...")
    try:
        model = EmptyRoomModel()
    except Exception as e:
        print(f"❌ 모델 초기화 실패: {e}")
        return
    
    print("\nTrainer 초기화 중...")
    trainer = Trainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        learning_rate=LEARNING_RATE,
        num_epochs=NUM_EPOCHS,
        save_dir=os.path.join(BASE_PATH, "checkpoints"),
        log_dir=os.path.join(BASE_PATH, "logs")
    )
    
    # 학습 시작
    print("\n" + "=" * 60)
    print("학습을 시작합니다!")
    print("=" * 60)
    trainer.train()


if __name__ == "__main__":
    main()