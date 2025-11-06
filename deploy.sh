#!/bin/bash
echo "🚀 Goodfellow dev 브랜치 배포 시작..."

cd /home/ubuntu/goodfellow
git fetch origin dev
git checkout dev
git reset --hard origin/dev

# 나머지는 동일
cd backend
source goodfellow/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
deactivate

cd ../frontend
npm install
npm run build

sudo systemctl restart nginx
echo "✅ Goodfellow dev 브랜치 배포 완료!"
