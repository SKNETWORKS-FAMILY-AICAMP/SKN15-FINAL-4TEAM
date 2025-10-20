# 🏠 ASSEMBLE: AI 인테리어 디자이너

> **SK Networks Family AI CAMP 15기 – 4팀 Goodfellow**
>
> 한샘 인테리어 디자이너를 위한 **AI 기반 맞춤형 디자인 컨설팅 솔루션**

---

## 🔰 프로젝트 개요

고객이 제공한 요구사항과 방 이미지를 기반으로
AI가 **맞춤형 인테리어 시안을 자동 생성**하는 B2B형 솔루션입니다.
한샘의 공식 시공사례와 자재 데이터를 학습한 모델을 통해
디자이너의 초안 설계 시간을 단축하고, 고객 커뮤니케이션을 강화합니다.

> “AI가 제안하고, 디자이너가 완성한다.”

---

## 🧭 문제 정의

| 문제            | 기존 방식의 한계                                  |
| ------------- | ------------------------------------------ |
| 반복적인 시안 탐색    | 고객 요구에 맞는 레퍼런스 이미지를 수동 탐색                  |
| 감성 표현 해석의 어려움 | “따뜻한 분위기”, “고급스러운 느낌” 등의 모호한 표현을 시각화하기 어려움 |
| 시간·비용 낭비      | 스케치·시안 작성에 많은 리소스 소요                       |
| 전문성 저하        | 반복 작업으로 디자이너 본연의 컨설팅 업무 감소                 |

**ASSEMBLE**은 고객 요구를 텍스트와 이미지로 입력받아
AI가 즉각적으로 초안을 제시함으로써 이러한 비효율을 해소합니다.

---

## 💡 주요 기능

| 구분                        | 기능 요약                               |
| ------------------------- | ----------------------------------- |
| 🗨️ **요구사항 입력**           | 주거 유형, 공간, 스타일, 예산 등 고객 요구 입력       |
| 🧠 **SLLM 텍스트 컨설팅**       | 고객 요구를 바탕으로 상세한 인테리어 컨설팅 텍스트 생성     |
| 🏗️ **Image-to-Image 생성** | 빈 방 이미지와 프롬프트를 입력받아 완성된 인테리어 이미지 생성 |
| 🪑 **Object Removal**     | 기존 방 사진에서 가구를 제거해 깨끗한 학습용 이미지 생성    |
| 📊 **AI 시안 관리 대시보드**      | 프로젝트별 생성 이력·결과 관리                   |
| 🪪 **한샘 가구 연동**           | ChatGPT + Naver API로 실제 가구 제품 추천    |

---

## 🧱 시스템 아키텍처

### ⚙️ 전체 구조

```text
Frontend (React/Next.js)
     ↓
FastAPI (AWS EC2)
     ↓
LangGraph Orchestrator
 ├─ sLLM (RunPod)
 │    └─ Text-based Interior Consulting
 ├─ Image-to-Image Model (RunPod)
 │    └─ FLUX / Stable Diffusion 기반
 ├─ ChatGPT + Naver API (가구 추천)
 ├─ PostgreSQL (Amazon RDS)
 └─ S3 (생성 이미지 저장)
```

### 🧩 배포 구성 (AWS)

* EC2 (FastAPI, Nginx, Gunicorn)
* RDS (PostgreSQL)
* S3 (이미지 저장소)
* Route53 + ACM (HTTPS)
* Amplify (Frontend)
* Cognito (로그인/인증)

> CI/CD 자동화:
> GitHub → Docker Build → EC2 Deploy
> Frontend → Amplify 자동 배포

---

## 🧠 AI 모델 구성

| 모델명                             | 역할                         | 입력                 | 출력              |
| ------------------------------- | -------------------------- | ------------------ | --------------- |
| **SLLM**                        | 고객 요구사항 기반 인테리어 컨설팅 텍스트 생성 | 요구 텍스트             | 스타일·가구·색상 기반 설명 |
| **Image-to-Image (FLUX)**       | 인테리어 시안 이미지 생성             | 빈 방 이미지 + 텍스트 프롬프트 | 완성 이미지          |
| **Object Removal / Inpainting** | 방 사진에서 가구 제거               | 원본 이미지             | 가구 제거된 빈 공간 이미지 |
| **Room Classification** | 사용자 이미지를 기반으로 방(실내 공간) 여부를 자동 분류 | 입력 이미지 | 분류 결과 |

> SLLM 결과 텍스트 → Image Model 프롬프트로 연계되어
> “텍스트 → 이미지”의 완전한 생성 파이프라인을 구성합니다.

---

## 🗂️ 데이터 파이프라인

### 1️⃣ 데이터 수집

* **출처:** 한샘 공식 홈페이지 / 블로그 / 뉴스 / RISS 논문
* **형태:** 가구, 인테리어, 시공사례, 뉴스·블로그, 논문
* **수집도구:** Python, BeautifulSoup, Selenium
* **자동화:** 매일 새벽 스케줄링, 실패 시 재수집 로직

### 2️⃣ 데이터 전처리

* **텍스트 정제:** 특수문자, HTML 태그, 중복 문장 제거
* **범주형 코드화:** `spa_XXXX`, `sty_XXXX`, `cos_XXXX`
* **노이즈 필터링:** 30자 이하 문장, “시공 전”, “철거” 등 제거
* **데이터 병합:** 시공사례와 텍스트 매핑
* **데이터 분할:** Train 80% / Validation 10% / Test 10%

### 3️⃣ 데이터 저장

* AWS S3 (CSV, JSON)
* PostgreSQL + pgvector
  → LangChain 연동을 통한 의미 기반 검색 지원

---

## 💾 데이터베이스 설계 요약

| 주요 테이블                                | 설명                |
| ------------------------------------- | ----------------- |
| `Users`                               | 디자이너 계정 정보        |
| `Projects`                            | 프로젝트별 생성 시안 관리    |
| `Customer_req`                        | 고객 요구사항 저장        |
| `Ai_make_image`                       | 생성 이미지 경로 및 선택 여부 |
| `Furniture`, `Interior`               | 가구·인테리어 메타데이터     |
| `Built_case`, `Built_contents`        | 시공사례 텍스트 및 이미지 매핑 |
| `User_log`                            | 사용자 활동 로그         |
| `Category`, `Thesis`, `News`, `Blogs` | 크롤링 데이터 원본        |

> 모든 관계는 1:N 중심 구조로 설계되어
> **프로젝트 단위 관리 + AI 결과 추적**이 가능하도록 구성됨.

---

## 💻 화면 설계 주요 흐름

| 구분        | 화면 ID         | 주요 기능                         |
| --------- | ------------- | ----------------------------- |
| 랜딩 페이지    | SC-01-001     | 서비스 소개 / 로그인 이동               |
| 로그인·회원가입  | SC-01-002     | Cognito 관리자 계정 기반 로그인         |
| 프로젝트 관리   | SC-01-003     | My Projects / 생성 / 수정 / 결과 확인 |
| 요구사항 입력   | SC-01-005     | 주거유형, 공간, 예산, 가족, 스타일 입력      |
| 결과 페이지    | SC-01-006     | AI 생성 시안 3x3 뷰, 선택 및 수정       |
| 리소스·라이브러리 | SC-01-008~009 | 한샘 자산 검색 / 가구 자료 열람           |
| About Us  | SC-01-009     | 팀 및 서비스 소개                    |

---

## ⚙️ 기술 스택

| 영역                  | 사용 기술                                             |
| ------------------- | ------------------------------------------------- |
| **Frontend**        | React.js, Next.js, Tailwind, AWS Amplify          |
| **Backend**         | FastAPI, Nginx, Gunicorn, LangChain, LangGraph    |
| **AI Models**       | PyTorch, Diffusers, RunPod, OpenAI API            |
| **Database**        | PostgreSQL (pgvector), AWS RDS                    |
| **Infra / CI/CD**   | Docker, GitHub Actions, AWS EC2, S3, Route53, ACM |
| **ETL & Crawling**  | Python, BeautifulSoup, Selenium, Pandas           |
| **Version Control** | Git, GitHub                                       |

---

## 👥 팀 구성

| 역할                    | 이름      | 담당 업무                                     |
| --------------------- | ------- | ----------------------------------------- |
| 👩‍💼 PM & Backend    | **권주연** | 프로젝트 총괄, API 서버 설계, DB 설계                 |
| 🧠 SLLM Engineer      | **강민정** | 텍스트 생성 모델 설계 및 파인튜닝                       |
| 🧩 Image AI Engineer  | **기현택** | Object Removal, Image-to-Image 모델 구축 및 평가 |
| 💻 Frontend Developer | **임경원** | React/Next.js 기반 웹 UI/UX 설계 및 구현          |
| 🧾 Data Engineer & QA | **정민철** | 데이터 수집·정제·DB 관리, 품질 검증 및 테스트              |

---


---

## 📊 결과 및 향후 계획

* ✅ 한샘 공식 사례 기반 인테리어 텍스트·이미지 생성 파이프라인 구축
* ✅ 벡터DB 기반 의미 검색 + 가구 추천 기능 완성
* 🔄 **차후 계획**

  * CLIPScore, SSIM 기반 생성 이미지 평가 자동화
  * 사용자 피드백 루프 기반 모델 개선
  * 실서비스용 Admin 대시보드 추가
  * 추가 도메인 확장 (호텔, 상업공간 등)

---

## 🪪 Repository Info

* **Repository:** [SKNETWORKS-FAMILY-AICAMP/SKN15-FINAL-4TEAM](https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN15-FINAL-4TEAM)
* **Team:** Goodfellow (SKN AI CAMP 15기)
* **Last Updated:** 2025.10
* **Keywords:** `AI Interior Designer`, `SLLM`, `Image-to-Image`, `LangGraph`, `AWS`, `FastAPI`, `React`, `pgvector`

---

> **© 2025. Goodfellow Team — SK Networks Family AI CAMP 15기**
> All rights reserved. `pgvector`





# 1. 팀 소개

# 2. 프로젝트 기간

# 3. 프로젝트 개요

## 📕 프로젝트명

## ✅ 프로젝트 배경 및 목적

## 🖐️ 프로젝트 소개

## ❤️ 기대효과

## 👤 대상 사용자

# 4. 기술 스택

# 5. 수행결과

# 6. 한 줄 회고
