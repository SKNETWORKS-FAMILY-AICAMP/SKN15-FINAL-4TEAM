# 팀 협업 가이드 - 한샘 인테리어 AI 프로젝트

## 📋 목차
1. [초기 설정](#초기-설정)
2. [Git 저장소 생성](#git-저장소-생성)
3. [로컬 개발 환경 구축](#로컬-개발-환경-구축)
4. [개발 워크플로우](#개발-워크플로우)
5. [배포](#배포)
6. [문제 해결](#문제-해결)

---

## 초기 설정

### 1. GitHub 저장소 생성 (팀 리더가 수행)

#### 옵션 1: 하나의 모노레포 (권장)
```bash
# 서버에서 실행
cd /home/ubuntu
mkdir hanssem-interior-ai
cd hanssem-interior-ai

# 프론트엔드와 백엔드를 하위 디렉토리로 이동
mv /home/ubuntu/Final_project ./frontend
mv /home/ubuntu/Final_project_B ./backend

# Git 초기화
git init
git add .
git commit -m "Initial commit: 프론트엔드 및 백엔드 초기 설정"

# GitHub 저장소 생성 후 연결
git remote add origin https://github.com/your-team/hanssem-interior-ai.git
git branch -M main
git push -u origin main
```

**프로젝트 구조:**
```
hanssem-interior-ai/
├── frontend/          # React 프론트엔드 (기존 Final_project)
├── backend/           # Django 백엔드 (기존 Final_project_B)
├── .gitignore
└── README.md
```

#### 옵션 2: 분리된 두 개의 저장소
```bash
# 프론트엔드 저장소
cd /home/ubuntu/Final_project
git init
git add .
git commit -m "Initial commit: React 프론트엔드"
git remote add origin https://github.com/your-team/hanssem-frontend.git
git branch -M main
git push -u origin main

# 백엔드 저장소
cd /home/ubuntu/Final_project_B
git init
git add .
git commit -m "Initial commit: Django 백엔드"
git remote add origin https://github.com/your-team/hanssem-backend.git
git branch -M main
git push -u origin main
```

### 2. 브랜치 전략 설정

```bash
# develop 브랜치 생성
git checkout -b develop
git push -u origin develop
```

**브랜치 구조:**
- `main` - 프로덕션 배포용 (안정 버전)
- `develop` - 개발 통합 브랜치
- `feature/*` - 새로운 기능 개발
- `bugfix/*` - 버그 수정
- `hotfix/*` - 긴급 버그 수정 (main에서 분기)

---

## Git 저장소 생성

### GitHub에서 저장소 생성
1. GitHub 로그인
2. New Repository 클릭
3. Repository 이름 입력: `hanssem-interior-ai`
4. Private 선택 (프로젝트 보안을 위해)
5. README.md 체크 해제 (이미 로컬에 있음)
6. Create repository

### 팀원 초대
1. 저장소 Settings → Collaborators
2. Add people → 팀원 GitHub 계정 입력
3. 팀원은 이메일로 초대 수락

---

## 로컬 개발 환경 구축

### 팀원 로컬 설정

#### 1. 저장소 클론
```bash
# 모노레포의 경우
git clone https://github.com/your-team/hanssem-interior-ai.git
cd hanssem-interior-ai

# 분리된 저장소의 경우
git clone https://github.com/your-team/hanssem-frontend.git
git clone https://github.com/your-team/hanssem-backend.git
```

#### 2. 백엔드 설정
```bash
cd backend  # 또는 hanssem-backend

# 환경 변수 설정 (중요!)
cp .env.example .env

# .env 파일을 열어서 팀 리더에게 받은 실제 값으로 수정
# 텍스트 에디터로 열기 (VS Code, Nano, Vim 등)
code .env  # VS Code
# 또는
nano .env  # Nano

# Python 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python manage.py migrate

# 개발 서버 실행
python manage.py runserver 0.0.0.0:9000
```

**⚠️ 환경 변수 공유 방법:**
- 팀 리더가 `.env` 파일의 실제 값을 안전한 방법으로 공유
  - Slack/Discord DM
  - 비밀번호 관리 도구 (1Password, LastPass 등)
  - 절대 Git에 커밋하지 않기!

#### 3. 프론트엔드 설정
```bash
cd frontend/ui  # 또는 hanssem-frontend/ui

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

브라우저에서 http://localhost:3000 접속

#### 4. 개발 확인
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:9000/api/
- 프론트엔드가 백엔드 API를 호출하는지 확인

---

## 개발 워크플로우

### 1. 작업 시작 전

```bash
# 최신 변경사항 가져오기
git checkout develop
git pull origin develop

# 새 기능 브랜치 생성
git checkout -b feature/프로젝트-필터링
# 또는
git checkout -b bugfix/로그인-버그-수정
```

### 2. 코드 작업

```bash
# 파일 수정...

# 변경 사항 확인
git status
git diff

# 스테이징
git add .
# 또는 특정 파일만
git add src/components/Dashboard.js

# 커밋
git commit -m "feat: 프로젝트 상태별 필터링 기능 추가"
```

**커밋 메시지 컨벤션:**
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (로직 변경 없음)
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정, 패키지 업데이트 등
security: 보안 관련 수정

예시:
feat: 대시보드에 프로젝트 필터링 기능 추가
fix: 로그인 시 토큰 저장 오류 수정
docs: README에 로컬 개발 환경 설정 가이드 추가
```

### 3. 원격 저장소에 푸시

```bash
# 브랜치를 원격에 푸시
git push origin feature/프로젝트-필터링
```

### 4. Pull Request 생성

1. GitHub 저장소 페이지 이동
2. "Pull requests" 탭 클릭
3. "New pull request" 클릭
4. base: `develop` ← compare: `feature/프로젝트-필터링`
5. 제목과 설명 작성:
   ```
   제목: [FEAT] 프로젝트 상태별 필터링 기능 추가

   설명:
   ## 변경 사항
   - 대시보드 상단 통계 카드 클릭 시 필터링 기능 추가
   - 진행중/완료 프로젝트만 표시 가능
   - 실제 AI 이미지 개수 표시

   ## 스크린샷
   (필요 시 첨부)

   ## 테스트
   - [x] 로컬에서 테스트 완료
   - [x] 필터링 동작 확인
   - [x] 통계 계산 정확성 확인
   ```
6. Reviewers에 팀원 지정
7. "Create pull request" 클릭

### 5. 코드 리뷰 및 병합

**리뷰어:**
- 코드 검토 후 코멘트 또는 승인
- 문제가 있으면 "Request changes"
- 문제 없으면 "Approve"

**작성자:**
- 리뷰 코멘트 반영
- 추가 커밋 푸시 (자동으로 PR에 반영됨)

**병합:**
- 모든 리뷰 승인 후 "Merge pull request"
- "Squash and merge" 또는 "Merge commit" 선택
- 병합 후 브랜치 삭제

### 6. 작업 후 정리

```bash
# develop 브랜치로 이동
git checkout develop

# 최신 변경사항 가져오기
git pull origin develop

# 병합된 브랜치 삭제 (선택사항)
git branch -d feature/프로젝트-필터링
```

---

## 충돌 해결

### 같은 파일을 여러 명이 수정한 경우

```bash
# 최신 develop 가져오기
git checkout develop
git pull origin develop

# 내 브랜치로 돌아가서 병합 시도
git checkout feature/내-기능
git merge develop

# 충돌 발생 시
# Git이 충돌 파일 표시:
# <<<<<<< HEAD
# 내 변경사항
# =======
# 다른 사람 변경사항
# >>>>>>> develop

# 충돌 파일을 열어서 수동으로 수정
# VS Code 사용 시 충돌 해결 도구 제공

# 충돌 해결 후
git add .
git commit -m "Merge develop into feature/내-기능"
git push origin feature/내-기능
```

---

## 배포

### 서버 배포 (프로덕션)

#### 백엔드 배포
```bash
# 서버 SSH 접속
ssh ubuntu@54.180.21.106

# 최신 코드 가져오기
cd /home/ubuntu/Final_project_B  # 또는 backend
git pull origin main

# Docker 재시작
docker-compose restart
```

#### 프론트엔드 배포
```bash
# 서버에서
cd /home/ubuntu/Final_project/ui  # 또는 frontend/ui

# 최신 코드 가져오기
git pull origin main

# 빌드
npm run build

# Docker 재시작
cd ../docker-deployment
docker-compose down
docker-compose build --no-cache hanssem-ui
docker-compose up -d hanssem-ui
```

### 자동 배포 (선택사항 - GitHub Actions)

`.github/workflows/deploy.yml` 파일을 생성하면 main 브랜치에 push 시 자동 배포 가능

---

## 문제 해결

### 1. Git 관련

**실수로 .env 파일을 커밋한 경우:**
```bash
# 파일을 Git에서 제거 (로컬 파일은 유지)
git rm --cached .env

# .gitignore에 추가 (이미 있으면 생략)
echo ".env" >> .gitignore

# 커밋 및 푸시
git add .gitignore
git commit -m "security: .env 파일 제거"
git push

# ⚠️ 중요: 노출된 API 키는 즉시 재발급!
```

**잘못된 브랜치에 커밋한 경우:**
```bash
# 아직 푸시하지 않았다면
git reset --soft HEAD~1  # 마지막 커밋 취소 (변경사항 유지)

# 올바른 브랜치로 이동
git checkout correct-branch
git add .
git commit -m "커밋 메시지"
```

### 2. 병합 충돌이 복잡한 경우

```bash
# 병합 중단
git merge --abort

# 팀원과 상의 후 진행
```

### 3. 로컬 환경 문제

**백엔드가 실행되지 않는 경우:**
```bash
# 가상환경 활성화 확인
source venv/bin/activate

# 의존성 재설치
pip install -r requirements.txt

# .env 파일 확인
cat .env

# 데이터베이스 연결 확인
python manage.py check
```

**프론트엔드가 실행되지 않는 경우:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 삭제
npm cache clean --force
```

---

## 🔐 보안 주의사항

### 절대 Git에 커밋하면 안 되는 것들:
- ❌ `.env` 파일
- ❌ API 키 (OpenAI, Gemini, AWS)
- ❌ 데이터베이스 비밀번호
- ❌ AWS 액세스 키
- ❌ Django SECRET_KEY

### Git에 커밋해야 하는 것들:
- ✅ `.env.example` (실제 값 없이 템플릿만)
- ✅ `.gitignore`
- ✅ `requirements.txt` / `package.json`
- ✅ 소스 코드
- ✅ 마이그레이션 파일
- ✅ README.md

---

## 📞 팀 커뮤니케이션

### 코드 리뷰 시
- 존중하는 태도로 피드백
- 구체적인 개선 방안 제시
- 긍정적인 부분도 언급

### 질문할 때
- 어떤 문제인지 명확히 설명
- 에러 메시지 전체 공유
- 이미 시도한 해결 방법 공유

### 일일 스탠드업 (권장)
- 어제 한 일
- 오늘 할 일
- 막힌 부분 / 도움 필요한 부분

---

## 🎯 체크리스트

### 작업 시작 전
- [ ] develop 브랜치에서 최신 코드 pull
- [ ] 새 feature 브랜치 생성
- [ ] 작업 내용 팀원에게 공유

### 커밋 전
- [ ] 불필요한 콘솔 로그 제거
- [ ] 코드 포맷팅 확인
- [ ] 로컬에서 테스트
- [ ] .env 파일이 포함되지 않았는지 확인

### Pull Request 전
- [ ] develop 브랜치 최신 변경사항 병합
- [ ] 충돌 해결
- [ ] 최종 테스트
- [ ] 의미 있는 커밋 메시지

### 코드 리뷰 시
- [ ] 코드 로직 이해
- [ ] 보안 이슈 확인
- [ ] 성능 문제 확인
- [ ] 코드 스타일 일관성

---

## 🚀 빠른 참조

### 자주 사용하는 Git 명령어
```bash
# 현재 상태 확인
git status

# 변경사항 확인
git diff

# 브랜치 목록
git branch -a

# 브랜치 전환
git checkout branch-name

# 새 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 최신 코드 가져오기
git pull origin develop

# 커밋
git add .
git commit -m "커밋 메시지"

# 푸시
git push origin feature/new-feature

# 마지막 커밋 수정 (아직 푸시 안 했을 때만!)
git commit --amend

# 로그 확인
git log --oneline
```

### 유용한 단축키 설정
```bash
# ~/.gitconfig 또는 ~/.zshrc에 추가
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'

# 사용 예: git st (git status와 동일)
```

---

## 📚 추가 자료

- [Git 공식 문서](https://git-scm.com/doc)
- [GitHub Flow 가이드](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Django 베스트 프랙티스](https://docs.djangoproject.com/en/4.2/misc/design-philosophies/)
- [React 베스트 프랙티스](https://react.dev/learn)
