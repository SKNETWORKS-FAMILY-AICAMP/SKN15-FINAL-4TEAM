# 한샘 인테리어 AI 프로젝트 - 프론트엔드

React 기반의 AI 인테리어 디자인 플랫폼 프론트엔드

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone <repository-url>
cd Final_project
```

### 2. 의존성 설치
```bash
cd ui
npm install
```

### 3. 환경 변수 설정
프론트엔드는 별도의 환경 변수가 필요하지 않습니다.
백엔드 서버 URL은 자동으로 현재 호스트의 9000 포트를 사용합니다.

### 4. 개발 서버 실행
```bash
npm start
```
브라우저에서 http://localhost:3000 으로 접속

### 5. 프로덕션 빌드
```bash
npm run build
```

## 📁 프로젝트 구조
```
Final_project/
├── ui/
│   ├── public/           # 정적 파일 (CSV 데이터 등)
│   ├── src/
│   │   ├── api/          # API 통신 레이어
│   │   ├── components/   # React 컴포넌트
│   │   ├── App.js        # 메인 앱 컴포넌트
│   │   └── index.js      # 진입점
│   ├── build/            # 빌드 결과물 (Git 제외)
│   └── package.json
└── docker-deployment/    # Docker 배포 설정
    ├── Dockerfile
    ├── docker-compose.yml
    └── nginx.conf
```

## 🐳 Docker 배포

### 빌드 및 실행
```bash
cd docker-deployment
docker-compose build --no-cache
docker-compose up -d
```

### 로그 확인
```bash
docker-compose logs -f hanssem-ui
```

### 중지
```bash
docker-compose down
```

## 🔧 주요 기능

- **프로젝트 대시보드**: 프로젝트 목록, 통계, 상태 관리
- **AI 디자인 생성**: 사용자가 업로드한 이미지를 기반으로 AI 인테리어 디자인 생성
- **디자인 갤러리**: 생성된 디자인 시안 확인 및 상세 수정
- **관리자 페이지**: 사용자 승인 및 관리
- **라이브러리**: 인테리어 자료 및 연구 논문 검색

## 🤝 협업 가이드

### 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치

### 커밋 메시지 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 등
```

### Pull Request 절차
1. 최신 develop 브랜치에서 feature 브랜치 생성
2. 작업 완료 후 commit & push
3. GitHub에서 Pull Request 생성
4. 코드 리뷰 후 merge

## ⚙️ 개발 환경

- Node.js 16+
- React 18
- React Router 6
- Axios
- Framer Motion (애니메이션)

## 📝 참고사항

- 백엔드 API는 포트 9000에서 실행되어야 합니다
- Docker 배포 시 포트 8888로 서비스됩니다
- 프로덕션 빌드는 Nginx로 서빙됩니다
