#!/bin/bash
set -e

echo "🚀 Goodfellow dev 브랜치 배포 시작..."

cd /home/ubuntu/goodfellow

# 1. 최신 코드 갱신
git fetch origin dev
git checkout dev
git reset --hard origin/dev

# 2. Docker 재배포
echo "🧹 기존 컨테이너 중지 중..."
docker-compose down

echo "🧱 새 이미지 빌드 중..."
docker-compose build --no-cache

echo "🚀 컨테이너 재시작..."
docker-compose up -d

# 3. 정리
echo "🧽 불필요한 이미지 정리..."
docker system prune -f

echo "✅ Goodfellow dev 브랜치 배포 완료!"
