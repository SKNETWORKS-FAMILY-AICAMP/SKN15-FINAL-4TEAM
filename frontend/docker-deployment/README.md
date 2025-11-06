# 🐳 한샘 인테리어 플랫폼 Docker 배포 가이드

## 📋 목차
- [개요](#개요)
- [프로젝트 구조](#프로젝트-구조)
- [사전 요구사항](#사전-요구사항)
- [빠른 시작](#빠른-시작)
- [상세 가이드](#상세-가이드)
- [Docker 명령어](#docker-명령어)
- [문제 해결](#문제-해결)
- [향후 확장](#향후-확장)

---

## 🎯 개요

이 폴더는 한샘 인테리어 플랫폼을 Docker 컨테이너로 배포하기 위한 설정 파일들을 포함합니다.

### 주요 특징
- **Multi-stage Build**: 빌드와 실행 환경 분리로 이미지 크기 최적화
- **Nginx 기반**: 정적 파일 서빙 및 React Router 지원
- **Production Ready**: Gzip 압축, 캐싱, 보안 헤더 설정
- **확장 가능**: 백엔드 서비스 추가 준비 완료

---

## 📁 프로젝트 구조

```
Final_project/
├── ui/                          # React 앱 소스 코드
│   ├── src/
│   ├── public/
│   │   ├── 20251020_가구종합.csv
│   │   ├── hanssem_contents.csv
│   │   └── riss_FIN2.csv
│   └── package.json
│
└── docker-deployment/           # Docker 설정 폴더 (이 폴더)
    ├── Dockerfile               # React 앱 빌드 및 배포 설정
    ├── docker-compose.yml       # 컨테이너 오케스트레이션
    ├── nginx.conf               # Nginx 웹서버 설정
    ├── .dockerignore            # Docker 빌드 제외 파일
    └── README.md                # 이 문서
```

---

## 🔧 사전 요구사항

### 필수 설치
- **Docker Desktop** (Windows/Mac) 또는 Docker Engine (Linux)
  - Windows: https://www.docker.com/products/docker-desktop
  - 버전: Docker 20.10 이상, Docker Compose 2.0 이상

### 설치 확인
```bash
docker --version
# Docker version 24.0.0 이상

docker-compose --version
# Docker Compose version v2.0.0 이상
```

---

## 🚀 빠른 시작

### 1. 이 폴더로 이동
```bash
cd \Final_project\docker-deployment
```

### 2. Docker 이미지 빌드 및 실행
```bash
docker-compose up --build
```

### 3. 브라우저에서 접속
```
http://localhost:3000
```

### 4. 중지하기
```bash
# Ctrl + C 로 중지
# 또는 백그라운드 실행 중단
docker-compose down
```

---

## 📚 상세 가이드

### Dockerfile 설명

#### Stage 1: Builder (빌드 단계)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY ../ui/package*.json ./
RUN npm ci --only=production
COPY ../ui/ ./
RUN npm run build
```
- Node.js 18 Alpine (경량 이미지)
- `npm ci`: 빠르고 안정적인 의존성 설치
- React 앱 빌드 → `/app/build` 폴더 생성

#### Stage 2: Production (실행 단계)
```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/public/*.csv /usr/share/nginx/html/
EXPOSE 80
```
- Nginx Alpine (초경량 웹서버)
- 빌드된 React 앱 + CSV 데이터 복사
- 포트 80 오픈

**이미지 크기 비교:**
- Builder 단계 (Node.js): ~500MB
- 최종 이미지 (Nginx): ~50MB ✅

---

### docker-compose.yml 설명

```yaml
services:
  hanssem-ui:
    build:
      context: ../ui
      dockerfile: ../docker-deployment/Dockerfile
    ports:
      - "3000:80"  # 호스트:컨테이너
    volumes:
      - ../ui/public:/usr/share/nginx/html:ro
    networks:
      - hanssem-network
    restart: unless-stopped
```

**주요 설정:**
- `ports`: 로컬 3000 포트를 컨테이너 80 포트로 매핑
- `volumes`: CSV 파일 실시간 반영 (ro = read-only)
- `restart`: 실패 시 자동 재시작
- `healthcheck`: 30초마다 상태 확인

---

### nginx.conf 설명

#### 1. Gzip 압축
```nginx
gzip on;
gzip_types text/plain text/css application/javascript;
```
→ JS/CSS 파일 전송 크기 70% 감소

#### 2. CSV 파일 처리
```nginx
location ~* \.csv$ {
    add_header Content-Type "text/csv; charset=utf-8";
    add_header Access-Control-Allow-Origin "*";
}
```
→ CSV 파일 올바른 MIME 타입 및 CORS 허용

#### 3. React Router 지원
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
→ SPA 라우팅 지원 (`/resources`, `/library` 등)

#### 4. 캐싱 전략
```nginx
location ~* \.(jpg|jpeg|png|gif|css|js)$ {
    expires 1y;
}
```
→ 정적 파일 1년 캐싱

---

## 🛠 Docker 명령어

### 기본 명령어

#### 빌드 및 실행
```bash
# 백그라운드 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 실행 중인 컨테이너 확인
docker-compose ps
```

#### 중지 및 삭제
```bash
# 컨테이너 중지
docker-compose stop

# 컨테이너 삭제 (볼륨 유지)
docker-compose down

# 컨테이너 + 볼륨 + 이미지 모두 삭제
docker-compose down -v --rmi all
```

#### 재시작
```bash
# 전체 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart hanssem-ui
```

---

### 디버깅 명령어

#### 컨테이너 내부 접속
```bash
docker exec -it hanssem-interior-ui sh
```

#### 로그 실시간 확인
```bash
docker-compose logs -f hanssem-ui
```

#### 리소스 사용량 확인
```bash
docker stats hanssem-interior-ui
```

#### 네트워크 확인
```bash
docker network ls
docker network inspect docker-deployment_hanssem-network
```

---

## 🔍 문제 해결

### 1. 포트 이미 사용 중
```
Error: bind: address already in use
```

**해결 방법:**
```bash
# 사용 중인 프로세스 확인 (Windows)
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <PID번호> /F

# 또는 docker-compose.yml에서 포트 변경
ports:
  - "3001:80"  # 3001로 변경
```

---

### 2. CSV 파일이 로드되지 않음
```
Failed to fetch CSV
```

**해결 방법:**
```bash
# 1. CSV 파일 경로 확인
ls ../ui/public/*.csv

# 2. 컨테이너 내부 확인
docker exec hanssem-interior-ui ls /usr/share/nginx/html/*.csv

# 3. 볼륨 마운트 확인
docker inspect hanssem-interior-ui | grep -A 10 Mounts
```

---

### 3. 빌드 실패
```
ERROR [builder X/Y] ...
```

**해결 방법:**
```bash
# 캐시 없이 처음부터 빌드
docker-compose build --no-cache

# Docker 빌드 컨텍스트 확인
cd ../ui
ls package.json  # 존재해야 함
```

---

### 4. React 앱이 흰 화면만 표시
**원인:** React Router의 basename 설정 문제

**해결 방법:**
```javascript
// src/App.js
<BrowserRouter basename="/">  // "/" 확인
  {/* ... */}
</BrowserRouter>
```

---

### 5. 메모리 부족
```
Docker Desktop stopped - Out of memory
```

**해결 방법:**
```bash
# Docker Desktop → Settings → Resources
# Memory: 4GB 이상 할당 (권장: 8GB)
```

---

## 📊 성능 최적화

### 1. 이미지 크기 최적화
```bash
# 이미지 크기 확인
docker images | grep hanssem

# 최적화 전: ~500MB
# 최적화 후: ~50MB ✅
```

### 2. 빌드 속도 향상
```dockerfile
# package.json 먼저 복사 → 의존성 캐싱
COPY package*.json ./
RUN npm ci
COPY . .  # 소스 코드는 나중에
```

### 3. Nginx 캐싱
- 정적 파일: 1년 캐싱
- CSV 파일: 1시간 캐싱
- HTML: 캐싱 안 함 (최신 버전 유지)

---

## 🚀 프로덕션 배포

### AWS EC2 배포 예시
```bash
# 1. EC2 인스턴스 접속
ssh -i key.pem ubuntu@your-ec2-ip

# 2. Docker 설치
sudo apt update
sudo apt install docker.io docker-compose -y

# 3. 프로젝트 클론
git clone <your-repo>
cd Final_project/docker-deployment

# 4. 실행
docker-compose up -d

# 5. 포트 80으로 변경 (nginx.conf)
ports:
  - "80:80"
```

---

## 🌐 향후 확장

### 백엔드 서비스 추가
`docker-compose.yml`에 이미 템플릿이 준비되어 있습니다:

```yaml
# 주석 해제하고 설정
services:
  hanssem-backend:
    build: ../backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://...
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

### 추가 가능한 서비스
- **Redis**: 캐싱 서버
- **Elasticsearch**: 가구 검색 엔진
- **MinIO**: 이미지 스토리지
- **Traefik/Nginx Proxy**: 리버스 프록시

---

## 📝 체크리스트

배포 전 확인사항:
- [ ] Docker Desktop 실행 중
- [ ] `../ui/package.json` 파일 존재 확인
- [ ] CSV 파일들이 `../ui/public/`에 존재
- [ ] 포트 3000이 사용 가능한지 확인
- [ ] 방화벽에서 포트 허용 설정

---

## 🔒 보안 체크리스트

프로덕션 배포 시:
- [ ] 관리자 기본 비밀번호 변경 (admin/admin123)
- [ ] HTTPS 적용 (Let's Encrypt)
- [ ] 환경 변수로 민감 정보 관리
- [ ] Nginx rate limiting 설정
- [ ] CORS 정책 제한
- [ ] Docker 이미지 취약점 스캔

---

## 📞 문의 및 지원

문제가 발생하면:
1. `docker-compose logs -f` 로그 확인
2. GitHub Issues 등록
3. Docker 공식 문서 참조: https://docs.docker.com

---

## 🎓 학습 리소스

- Docker 공식 튜토리얼: https://docs.docker.com/get-started/
- Docker Compose 문서: https://docs.docker.com/compose/
- Nginx 설정 가이드: https://nginx.org/en/docs/

---

**✨ 이제 Docker로 한샘 인테리어 플랫폼을 실행할 준비가 완료되었습니다!**

```bash
docker-compose up -d
# 🚀 http://localhost:3000 접속!
```
