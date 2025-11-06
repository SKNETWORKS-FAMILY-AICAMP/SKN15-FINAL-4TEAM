# 환경별 설정 가이드

## 📋 개요
이 문서는 서버(프로덕션) 환경과 로컬(개발) 환경의 차이점과 설정 방법을 설명합니다.

---

## 🖥️ 서버 환경 (프로덕션)

### 현재 서버 정보
- **IP**: 54.180.21.106
- **프론트엔드**: http://54.180.21.106:8888
- **백엔드 API**: http://54.180.21.106:9000

### 디렉토리 구조
```
/home/ubuntu/
├── Final_project/           # 프론트엔드
│   ├── ui/
│   │   ├── src/
│   │   ├── public/
│   │   └── build/           # 빌드 결과물
│   └── docker-deployment/
│       ├── Dockerfile
│       ├── docker-compose.yml
│       └── nginx.conf
│
└── Final_project_B/         # 백엔드
    ├── interior/
    ├── project_app/
    ├── .env                 # 환경 변수 (민감 정보!)
    ├── Dockerfile
    └── docker-compose.yml
```

### 서버 접속
```bash
ssh ubuntu@54.180.21.106
```

### Docker 컨테이너 관리

#### 백엔드
```bash
cd /home/ubuntu/Final_project_B

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 재시작
docker-compose restart

# 중지 및 재시작
docker-compose down
docker-compose up -d

# 빌드 후 재시작
docker-compose build --no-cache
docker-compose up -d
```

#### 프론트엔드
```bash
cd /home/ubuntu/Final_project/docker-deployment

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f hanssem-ui

# 재시작 (빌드 변경사항 있을 때)
docker stop hanssem-interior-ui
docker rm hanssem-interior-ui
docker-compose build --no-cache hanssem-ui
docker-compose up -d hanssem-ui
```

### 프로덕션 배포 절차

#### 백엔드 배포
```bash
# 1. 서버 접속
ssh ubuntu@54.180.21.106

# 2. 최신 코드 가져오기
cd /home/ubuntu/Final_project_B
git pull origin main

# 3. 환경 변수 확인 (.env 파일이 있는지, 값이 올바른지)
cat .env

# 4. 의존성 업데이트 (requirements.txt 변경 시)
docker-compose build --no-cache

# 5. 마이그레이션 (모델 변경 시)
docker-compose exec hanssem-backend python manage.py migrate

# 6. 재시작
docker-compose restart

# 7. 로그 확인
docker-compose logs -f
```

#### 프론트엔드 배포
```bash
# 1. 서버 접속
ssh ubuntu@54.180.21.106

# 2. 최신 코드 가져오기
cd /home/ubuntu/Final_project
git pull origin main

# 3. 빌드
cd ui
npm run build

# 4. Docker 재시작
cd ../docker-deployment
docker stop hanssem-interior-ui
docker rm hanssem-interior-ui
docker-compose up -d hanssem-ui

# 5. 로그 확인
docker-compose logs -f hanssem-ui
```

---

## 💻 로컬 환경 (개발)

### 시스템 요구사항
- **Node.js**: 16.x 이상
- **Python**: 3.11 이상
- **PostgreSQL**: 13.x 이상 (선택사항 - 서버 DB 사용 가능)
- **Git**: 최신 버전

### 초기 설정

#### 1. 저장소 클론
```bash
# 모노레포인 경우
git clone https://github.com/your-team/hanssem-interior-ai.git
cd hanssem-interior-ai

# 분리된 저장소인 경우
git clone https://github.com/your-team/hanssem-frontend.git
git clone https://github.com/your-team/hanssem-backend.git
```

#### 2. 백엔드 설정

##### Python 가상환경 생성
```bash
cd backend  # 또는 hanssem-backend 또는 Final_project_B

# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화
# Mac/Linux:
source venv/bin/activate

# Windows (CMD):
venv\Scripts\activate.bat

# Windows (PowerShell):
venv\Scripts\Activate.ps1
```

##### 의존성 설치
```bash
pip install -r requirements.txt
```

##### 환경 변수 설정
```bash
# .env.example 복사
cp .env.example .env

# .env 파일 수정 (텍스트 에디터로 열기)
code .env  # VS Code
# 또는
nano .env  # Nano
# 또는
vim .env   # Vim
```

**로컬 개발용 .env 예시:**
```env
# Django settings
DJANGO_SECRET_KEY=로컬개발용시크릿키
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database settings (팀 공용 서버 사용)
POSTGRES_DB=mydb
POSTGRES_USER=팀리더에게받은유저명
POSTGRES_PASSWORD=팀리더에게받은비밀번호
POSTGRES_HOST=52.78.28.164
POSTGRES_PORT=5432

# AWS S3 settings (팀 공용)
AWS_ACCESS_KEY_ID=팀리더에게받은키
AWS_SECRET_ACCESS_KEY=팀리더에게받은시크릿
AWS_STORAGE_BUCKET_NAME=hanssem-dataset
AWS_S3_REGION_NAME=ap-northeast-2
AWS_LOCATION=project-images
MEDIA_URL=https://hanssem-dataset.s3.ap-northeast-2.amazonaws.com/project-images/

# API Keys (팀 공용)
OPENAI_TEAM_API_KEY=팀리더에게받은키
GEMINI_API_KEY=팀리더에게받은키
```

##### 데이터베이스 마이그레이션
```bash
# 마이그레이션 실행
python manage.py migrate

# 슈퍼유저 생성 (선택사항)
python manage.py createsuperuser
```

##### 개발 서버 실행
```bash
# 기본 포트 (8000)
python manage.py runserver

# 특정 포트 (프로덕션과 동일하게 9000)
python manage.py runserver 0.0.0.0:9000
```

#### 3. 프론트엔드 설정

```bash
cd frontend/ui  # 또는 hanssem-frontend/ui 또는 Final_project/ui

# 의존성 설치
npm install

# 개발 서버 실행 (포트 3000)
npm start
```

**프론트엔드 환경 변수 (선택사항):**
```bash
# ui/.env 파일 생성 (필요 시)
REACT_APP_API_BASE=http://localhost:9000/api
```

기본적으로 프론트엔드는 `window.location.hostname:9000`을 사용하므로 별도 설정 불필요

---

## 🔄 환경별 차이점

### 백엔드

| 항목 | 로컬 개발 | 프로덕션 서버 |
|------|----------|--------------|
| **실행 방법** | `python manage.py runserver` | Docker (Gunicorn) |
| **포트** | 8000 또는 9000 | 9000 |
| **DEBUG** | True | False (권장) |
| **ALLOWED_HOSTS** | localhost, 127.0.0.1 | *, 54.180.21.106 |
| **데이터베이스** | 팀 공용 PostgreSQL | 팀 공용 PostgreSQL |
| **정적 파일** | Django 자동 서빙 | Nginx 또는 S3 |
| **로그** | 콘솔 출력 | 파일 + 콘솔 |

### 프론트엔드

| 항목 | 로컬 개발 | 프로덕션 서버 |
|------|----------|--------------|
| **실행 방법** | `npm start` | Docker (Nginx) |
| **포트** | 3000 | 8888 |
| **빌드** | 필요 없음 (개발 서버) | `npm run build` 필요 |
| **Hot Reload** | 있음 | 없음 |
| **API 호스트** | localhost:9000 | 54.180.21.106:9000 |
| **최적화** | 없음 | 압축, 난독화 |

---

## 🐛 문제 해결

### 로컬 백엔드 문제

#### 1. ModuleNotFoundError
```bash
# 가상환경이 활성화되어 있는지 확인
which python  # 가상환경 경로가 나와야 함

# 가상환경 재활성화
source venv/bin/activate

# 의존성 재설치
pip install -r requirements.txt
```

#### 2. 데이터베이스 연결 오류
```bash
# .env 파일 확인
cat .env | grep POSTGRES

# PostgreSQL 서버 연결 테스트
python manage.py check --database default

# 마이그레이션 상태 확인
python manage.py showmigrations
```

#### 3. 포트 이미 사용 중
```bash
# Mac/Linux
lsof -i :9000
kill -9 <PID>

# Windows
netstat -ano | findstr :9000
taskkill /PID <PID> /F
```

### 로컬 프론트엔드 문제

#### 1. 의존성 설치 오류
```bash
# 캐시 삭제
rm -rf node_modules package-lock.json
npm cache clean --force

# 재설치
npm install
```

#### 2. 포트 3000 이미 사용 중
```bash
# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 또는 다른 포트 사용
PORT=3001 npm start  # Mac/Linux
set PORT=3001 && npm start  # Windows CMD
$env:PORT=3001; npm start  # Windows PowerShell
```

#### 3. 백엔드 API 연결 안 됨
```bash
# 백엔드 서버가 실행 중인지 확인
curl http://localhost:9000/api/

# CORS 에러 확인 (브라우저 개발자 도구 콘솔)
# Django settings.py에서 CORS 설정 확인
```

### 서버(프로덕션) 문제

#### 1. Docker 컨테이너가 계속 재시작
```bash
# 로그 확인
docker-compose logs -f

# 일반적인 원인:
# - .env 파일 누락
# - 환경 변수 값 오류
# - 포트 충돌
# - 메모리 부족
```

#### 2. 502 Bad Gateway
```bash
# 백엔드 컨테이너 상태 확인
docker-compose ps

# 백엔드 로그 확인
docker-compose logs hanssem-backend

# 컨테이너 재시작
docker-compose restart hanssem-backend
```

#### 3. 변경사항이 반영되지 않음
```bash
# 프론트엔드
cd /home/ubuntu/Final_project/ui
npm run build
cd ../docker-deployment
docker-compose build --no-cache hanssem-ui
docker-compose up -d hanssem-ui

# 백엔드
cd /home/ubuntu/Final_project_B
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 성능 모니터링

### 서버 리소스 확인
```bash
# CPU, 메모리 사용량
top
# 또는
htop

# 디스크 사용량
df -h

# Docker 컨테이너 리소스
docker stats
```

### 로그 모니터링
```bash
# 실시간 로그
docker-compose logs -f

# 최근 100줄
docker-compose logs --tail=100

# 특정 컨테이너만
docker-compose logs -f hanssem-backend
```

---

## 🔐 보안 체크리스트

### 로컬 개발 환경
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] API 키를 코드에 하드코딩하지 않았는지 확인
- [ ] DEBUG=True로 개발 중인지 확인

### 프로덕션 환경
- [ ] `.env` 파일 권한이 적절한지 확인 (`chmod 600 .env`)
- [ ] DEBUG=False로 설정되어 있는지 확인
- [ ] ALLOWED_HOSTS가 올바르게 설정되어 있는지 확인
- [ ] SECRET_KEY가 강력하고 노출되지 않았는지 확인
- [ ] HTTPS 사용 여부 확인 (필요 시)

---

## 🚀 빠른 참조

### 로컬 개발 시작
```bash
# 터미널 1: 백엔드
cd backend
source venv/bin/activate
python manage.py runserver 9000

# 터미널 2: 프론트엔드
cd frontend/ui
npm start
```

### 서버 배포
```bash
# SSH 접속
ssh ubuntu@54.180.21.106

# 백엔드 업데이트
cd /home/ubuntu/Final_project_B
git pull origin main
docker-compose restart

# 프론트엔드 업데이트
cd /home/ubuntu/Final_project/ui
git pull origin main
npm run build
cd ../docker-deployment
docker-compose restart hanssem-ui
```

### 긴급 롤백
```bash
# 이전 커밋으로 되돌리기
git log --oneline  # 커밋 해시 확인
git checkout <커밋해시>

# 또는 이전 버전으로 reset (주의!)
git reset --hard HEAD~1
```
