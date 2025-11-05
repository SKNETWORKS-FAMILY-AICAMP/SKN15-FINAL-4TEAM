import os
import torch
from torch.utils.data import Dataset, DataLoader, random_split
from PIL import Image
from torchvision import transforms
import json
from pathlib import Path


class EmptyRoomDataset(Dataset):
    """가구 있는 방 -> 빈 방 변환 데이터셋"""
    
    def __init__(self, dataset_path, transform=None, image_size=512):
        self.dataset_path = Path(dataset_path)
        self.transform = transform
        self.image_size = image_size
        self.data_pairs = self._load_data_pairs()
        
        if len(self.data_pairs) == 0:
            raise ValueError(f"데이터를 찾을 수 없습니다: {dataset_path}")
        
        print(f"✓ 데이터셋 로드 완료: {len(self.data_pairs)}개 샘플")
    
    def _load_data_pairs(self):
        """데이터 쌍 로드 (단일폴더 구조 대응)"""
        data_pairs = []
    
        for split in ['train', 'val', 'test']:
            split_path = self.dataset_path / split
            if not split_path.exists():
                continue
    
            # furnished_x.jpg, empty_x.jpg, caption_x.txt 패턴 감지
            furnished_imgs = list(split_path.glob("furnished_*.jpg"))
            empty_imgs = list(split_path.glob("empty_*.jpg"))
            caption_files = list(split_path.glob("caption_*.txt"))
    
            # id 추출 (숫자만)
            furnished_ids = [p.stem.replace("furnished_", "") for p in furnished_imgs]
            empty_ids = [p.stem.replace("empty_", "") for p in empty_imgs]
    
            common_ids = set(furnished_ids) & set(empty_ids)
    
            for cid in sorted(common_ids):
                f_path = split_path / f"furnished_{cid}.jpg"
                e_path = split_path / f"empty_{cid}.jpg"
                c_path = split_path / f"caption_{cid}.txt"
    
                if f_path.exists() and e_path.exists() and c_path.exists():
                    with open(c_path, 'r', encoding='utf-8') as f:
                        caption = f.read().strip()
                    data_pairs.append({
                        'furnished': str(f_path),
                        'empty': str(e_path),
                        'caption': caption,
                        'split': split
                    })

        return data_pairs
    
    def __len__(self):
        return len(self.data_pairs)
    
    def __getitem__(self, idx):
        data = self.data_pairs[idx]
        
        try:
            furnished_img = Image.open(data['furnished']).convert('RGB')
            empty_img = Image.open(data['empty']).convert('RGB')
            caption = data['caption']
            
            if self.transform:
                furnished_img = self.transform(furnished_img)
                empty_img = self.transform(empty_img)
            
            return furnished_img, empty_img, caption
        except Exception as e:
            print(f"Error loading {data['furnished']}: {e}")
            # 첫 번째 샘플 반환
            return self.__getitem__(0)


def get_transforms(image_size=512):
    """이미지 변환"""
    return transforms.Compose([
        transforms.Resize((image_size, image_size), interpolation=transforms.InterpolationMode.BILINEAR),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])


def create_dataloaders(dataset_path, batch_size=4, num_workers=2, image_size=512):
    """데이터로더 생성"""
    
    transform = get_transforms(image_size)
    dataset_path = Path(dataset_path)
    
    # 폴더 구조 확인
    has_splits = (dataset_path / 'train').exists()
    
    if has_splits:
        print("✓ train/val/test 폴더 구조 감지")
        
        full_dataset = EmptyRoomDataset(dataset_path, transform, image_size)
        train_data = [d for d in full_dataset.data_pairs if d['split'] == 'train']
        val_data = [d for d in full_dataset.data_pairs if d['split'] == 'val']
        test_data = [d for d in full_dataset.data_pairs if d['split'] == 'test']
        
        train_dataset = EmptyRoomDataset(dataset_path, transform, image_size)
        train_dataset.data_pairs = train_data
        val_dataset = EmptyRoomDataset(dataset_path, transform, image_size)
        val_dataset.data_pairs = val_data
        test_dataset = EmptyRoomDataset(dataset_path, transform, image_size)
        test_dataset.data_pairs = test_data
        
        print(f"  - Train: {len(train_dataset)} 샘플")
        print(f"  - Val: {len(val_dataset)} 샘플")
        print(f"  - Test: {len(test_dataset)} 샘플")
        
    else:
        print("✓ 단일 폴더 구조 - 자동 split")
        
        full_dataset = EmptyRoomDataset(dataset_path, transform, image_size)
        total_size = len(full_dataset)
        train_size = int(total_size * 0.7)
        val_size = int(total_size * 0.15)
        test_size = total_size - train_size - val_size
        
        train_dataset, val_dataset, test_dataset = random_split(
            full_dataset, 
            [train_size, val_size, test_size],
            generator=torch.Generator().manual_seed(42)
        )
        
        print(f"  - Train: {train_size} 샘플")
        print(f"  - Val: {val_size} 샘플")
        print(f"  - Test: {test_size} 샘플")
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
        persistent_workers=True if num_workers > 0 else False
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
        persistent_workers=True if num_workers > 0 else False
    )
    
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
        persistent_workers=True if num_workers > 0 else False
    )
    
    return train_loader, val_loader, test_loader, train_dataset, val_dataset, test_dataset