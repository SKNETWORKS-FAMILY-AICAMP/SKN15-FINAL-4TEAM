# 한샘 인테리어 AI 프로젝트 - 백엔드

Django REST Framework 기반의 AI 인테리어 디자인 플랫폼 백엔드

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone <repository-url>
cd Final_project_B
```

### 2. 환경 변수 설정 (중요!)
```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env

# .env 파일을 열어서 실제 값으로 수정
nano .env
```

**⚠️ 주의: .env 파일은 절대 Git에 커밋하지 마세요!**

필수 환경 변수:
- `DJANGO_SECRET_KEY`: Django 시크릿 키
- `POSTGRES_*`: PostgreSQL 데이터베이스 연결 정보
- `AWS_*`: AWS S3 이미지 스토리지 설정
- `OPENAI_TEAM_API_KEY`: OpenAI API 키 (빈 방 생성용)
- `GEMINI_API_KEY`: Google Gemini API 키 (가구 배치용)

### 3. 의존성 설치

#### 로컬 개발 (Python 가상환경)
```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. 데이터베이스 마이그레이션
```bash
python manage.py migrate
```

### 5. 서버 실행

#### 로컬 개발 서버
```bash
python manage.py runserver 0.0.0.0:9000
```

#### Docker로 실행 (권장)
```bash
docker-compose build
docker-compose up -d
```

## 📁 프로젝트 구조
```
Final_project_B/
├── interior/              # 메인 Django 프로젝트
│   ├── services/          # AI 이미지 생성 파이프라인
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── project_app/           # 프로젝트 관리 앱
│   ├── models.py          # DB 모델 (User, Project, AiMakeImage 등)
│   ├── views.py           # API 엔드포인트
│   ├── urls.py
│   └── serializers.py
├── myproject/             # 관리자 앱
├── manage.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example           # 환경 변수 예제
```

## 🔌 주요 API 엔드포인트

### 인증
- `POST /api/register/` - 회원가입 (승인 대기)
- `POST /api/login/` - 로그인

### 프로젝트
- `GET /api/projects/<user_id>/` - 사용자 프로젝트 목록
- `POST /api/projects/create/` - 프로젝트 생성 (AI 이미지 생성 포함)
- `GET /api/projects/<project_id>/ai-images/` - AI 생성 이미지 조회
- `POST /api/projects/<project_id>/ai-images/<image_id>/refine/` - 이미지 부분 수정
- `PATCH /api/projects/<project_id>/status/` - 프로젝트 상태 변경

### 관리자
- `GET /api/admin/pending-users/` - 가입 대기자 목록
- `PATCH /api/admin/pending-users/<id>/approve/` - 가입 승인
- `PATCH /api/admin/pending-users/<id>/reject/` - 가입 거절
- `GET /api/admin/users/` - 사용자 목록
- `DELETE /api/admin/users/<user_id>/` - 사용자 삭제

## 🎨 AI 이미지 생성 파이프라인

1. **빈 방 생성** (OpenAI DALL-E)
   - 사용자가 업로드한 이미지에서 가구 제거
   - 벽, 창문, 바닥 등 구조만 유지

2. **가구 배치** (Google Gemini)
   - 한샘 가구 데이터베이스에서 적합한 가구 선택
   - 빈 방에 가구를 자연스럽게 배치
   - 9가지 다양한 스타일 변형 생성

3. **부분 수정** (OpenAI DALL-E)
   - 사용자 피드백에 따라 특정 부분만 수정

## 🔒 보안 기능

### 프로젝트 접근 권한 검증
모든 프로젝트 관련 API는 요청자의 권한을 검증합니다:
- 사용자는 본인의 프로젝트만 조회/수정 가능
- 관리자(ADMIN)는 모든 프로젝트 접근 가능
- 권한 없는 접근 시 403 Forbidden 응답

API 요청 시 `X-User-ID` 헤더에 사용자 ID 포함:
```javascript
headers: {
  'X-User-ID': userId,
  'Content-Type': 'application/json'
}
```

## 🐳 Docker 배포

### 빌드 및 실행
```bash
docker-compose build --no-cache
docker-compose up -d
```

### 로그 확인
```bash
docker-compose logs -f hanssem-backend
```

### 컨테이너 재시작
```bash
docker-compose restart
```

### 중지 및 제거
```bash
docker-compose down
```

## 🤝 협업 가이드

### 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 버그 수정

### 커밋 메시지 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (로직 변경 없음)
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정, 패키지 매니저 등
security: 보안 관련 수정
```

### Pull Request 절차
1. 최신 develop 브랜치에서 feature 브랜치 생성
2. 작업 완료 후 commit & push
3. GitHub에서 Pull Request 생성 (develop 브랜치로)
4. 코드 리뷰 후 merge
5. develop에서 충분히 테스트 후 main으로 merge

### 로컬 개발 시 주의사항
1. **.env 파일 절대 커밋 금지!**
   - API 키, 데이터베이스 비밀번호 등 민감 정보 포함
   - 실수로 커밋한 경우 즉시 팀에 알리고 키 재발급

2. **마이그레이션 관리**
   ```bash
   # 모델 변경 후 마이그레이션 생성
   python manage.py makemigrations

   # 마이그레이션 적용
   python manage.py migrate

   # 마이그레이션 파일은 Git에 커밋
   ```

3. **의존성 관리**
   ```bash
   # 새 패키지 설치 후 requirements.txt 업데이트
   pip freeze > requirements.txt
   ```

4. **데이터베이스**
   - 팀 공용 PostgreSQL 서버 사용
   - 테스트용 데이터 추가 시 팀원에게 공유

## ⚙️ 개발 환경

- Python 3.11+
- Django 4.2+
- Django REST Framework
- PostgreSQL 13+
- OpenAI API (DALL-E 3)
- Google Gemini API
- AWS S3 (이미지 스토리지)
- Docker & Docker Compose

## 🧪 테스트

```bash
# 전체 테스트 실행
python manage.py test

# 특정 앱 테스트
python manage.py test project_app
```

## 📊 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보
- **project**: 프로젝트 정보
- **customize_req**: 프로젝트 요구사항 (주거 형태, 공간, 예산, 스타일 등)
- **ai_make_image**: AI 생성 이미지
- **pending_users**: 가입 대기자

## 📝 참고사항

- API 포트: 9000
- 프론트엔드는 같은 호스트의 8888 포트에서 실행
- AI 이미지 생성은 최대 10분 소요 (9개 이미지)
- 타임아웃 설정: 600초
- 이미지는 AWS S3에 WebP 형식으로 저장

## 🐛 문제 해결

### 데이터베이스 연결 오류
```bash
# .env 파일의 POSTGRES_* 값 확인
# PostgreSQL 서버 접근 가능 여부 확인
```

### API 키 오류
```bash
# .env 파일의 API 키 확인
# 키 유효성 및 사용 한도 확인
```

### Docker 이미지 빌드 실패
```bash
# 캐시 없이 다시 빌드
docker-compose build --no-cache
```
