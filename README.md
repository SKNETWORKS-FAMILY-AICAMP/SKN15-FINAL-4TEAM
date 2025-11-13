# 🏠 ASSEMBLE: AI 인테리어 디자이너

> **SK Networks Family AI CAMP 15기 – 4팀 Goodfellow**  
> 한샘 인테리어 컨설팅 프로세스를 자동화하는 **AI 기반 시안 생성 솔루션**

---

## 🔰 프로젝트 개요

**ASSEMBLE**은  
사용자가 입력한 **요구사항(Text)** 과 **방 이미지(Image)** 를 기반으로

- **SLLM 기반 인테리어 설명 생성**
- **OpenAI Image Edit 기반 빈 방 생성 / Object Removal**
- **요구사항 반영 Image-to-Image 변환**
- **한샘 가구 추천 및 가격·URL 매칭**

까지 수행하는 **엔드-투-엔드 인테리어 생성·추천 시스템**입니다.

> “AI가 초안을 만들고, 디자이너가 완성한다.”

---

## 🧭 문제 정의

한샘을 포함한 대부분의 인테리어 상담 과정에는 다음과 같은 병목이 존재합니다.

| 문제                    | 기존 방식의 한계                                                |
| ----------------------- | --------------------------------------------------------------- |
| 이미지 기반 상담 난이도 | 고객이 제공하는 사진의 가구·구조 때문에 시안 제작 난이도가 높음 |
| 반복된 초안 수정        | ‘따뜻한 느낌’, ‘모던한 분위기’ 등 모호한 표현 해석이 난해       |
| 초기 시안 제작 부담     | 디자이너가 초안을 직접 제작하기 때문에 시간이 오래 걸림         |
| 가구 추천 비효율        | 고객 취향·예산 기반 가구 매칭이 반복 작업                       |

**ASSEMBLE**은 이 병목을 자동화하여  
디자이너의 **초기 시안 제작 시간을 크게 단축**하는 데 목적이 있습니다.

---

## 💡 주요 기능

| 기능                                    | 설명                                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| **방 이미지 분류(Classification)**      | 입력 이미지를 분석해 방/비방, 빈방 여부 자동 판별          |
| **Object Removal / 빈방 생성 (OpenAI)** | OpenAI Image Edit(API)를 활용해 기존 방 사진에서 가구 제거 |
| **SLLM Multi-task**                     | 인테리어 설명, 이미지 프롬프트, 가구 리스트를 한 번에 생성 |
| **요구사항 기반 재생성(Feedback Loop)** | 이전 출력물 + 추가 요청을 반영해 재생성                    |
| **한샘 Web Scraper 연동**               | 추천된 가구명을 기반으로 가격·URL 자동 수집                |
| **Complete Pipeline**                   | 텍스트 → 이미지 → 가구 추천까지 단일 파이프라인 구성       |

---
## 👥 팀 구성 (Goodfellow)  

| 권주연 | 강민정 | 기현택 | 정민철 | 임경원 |
|--------|--------|--------|--------|--------|
| <img src="./images/juyeon.png" width="90"/> | <img src="./images/minjung.png" width="90"/> | <img src="./images/hyuntaek.png" width="90"/> | <img src="./images/mincheol.png" width="90"/> | <img src="./images/kyungwon.png" width="90"/> |
| **PM & SLLM Engineer** | **UNet / Preprocessing Engineer** | **Backend & Partial Frontend** | **Image AI & DB Engineer** | **Frontend & AWS Infra** |
| • 프로젝트 총괄/기획<br>• SLLM 파이프라인<br>• Classification 설계 | • UNet 빈방모델 학습<br>• 이미지 전처리/마스킹<br>• 데이터 제작·정제 | • FastAPI 백엔드<br>• DB 연동/REST API<br>• 프론트 일부 기능 | • NanoBanana 이미지 생성<br>• Object Removal 연동<br>• DB 설계/QA | • Next.js UI/UX<br>• FastAPI 연동<br>• AWS 인프라/배포 |



---
## 🧱 시스템 아키텍처

### ⚙️ 전체 구조

```
Frontend (Next.js + React)
     ↓
FastAPI Backend (AWS EC2)
     ↓
LangGraph Orchestrator
     ↓
Classification Model (RunPod)
 └─ 입력 이미지의 방 여부·빈방 여부 판별
     ↓
sLLM (RunPod)
 ├─ 사용자 요구사항 기반 인테리어 설명 생성
 ├─ 이미지 모델용 텍스트 프롬프트 생성
 └─ 추천 가구 목록 생성
     ↓
Image Model (RunPod, FLUX / Stable Diffusion)
 ├─ 빈 방 생성(Object Removal 결과 기반)
 └─ 요구사항 반영 인테리어 이미지 생성
     ↓
Web Scraper (ChatGPT + Naver API)
 └─ 한샘 가구 이미지·가격·URL 수집
     ↓
PostgreSQL (Amazon RDS)
 └─ 프로젝트 / 생성 결과 / 사용자 로그 저장
     ↓
Amazon S3
 └─ 생성 이미지 저장
```

<img width="3459" height="2436" alt="fin_system" src="https://github.com/user-attachments/assets/6703df82-398e-4c89-9741-6340802a2081" />


### 🔵 Primary Flow (Black Line)

초기 입력 → 방 여부 분류 → (필요 시) Object Removal → 1차 및 최종 이미지 생성

### 🟢 Feedback Flow (Green Line)

사용자 불만족 → 추가 요구사항 입력 → 재생성

---

## 🧠 AI 모델 구성

| 모델명                                           | 역할                           | 입력                    | 출력                          |
| ------------------------------------------------ | ------------------------------ | ----------------------- | ----------------------------- |
| **Classification Model**                         | 방 여부, 빈 방 여부 판별       | 이미지                  | Yes/No                        |
| **OpenAI Image Edit (gpt-image-1)**              | 기존 방 → 빈 방 이미지 생성    | 원본 이미지 + 마스크    | Clean Room Image              |
| **Image Model (NanoBanana / 또는 OpenAI Image)** | 인테리어 시안 이미지 생성      | 빈 방 이미지 + 프롬프트 | 인테리어 시안                 |
| **SLLM (Multi-task)**                            | 설명·프롬프트·가구목록 생성    | 요구 텍스트             | 설명 + 프롬프트 + 가구 리스트 |

---

## 🗂️ 데이터 파이프라인

### 1️⃣ 데이터 수집

- 한샘 공식 시공사례 이미지·텍스트
- 블로그·뉴스·NLP 자료
- 가구 데이터 (명칭/설명/가격)

### 2️⃣ 데이터 전처리

- HTML, 특수문자 제거
- 스타일/소재 코드화 (`spa_`, `sty_`, `mat_`…)
- 시공사례 – 텍스트 매핑
- Train/Val/Test (8:1:1)

### 3️⃣ 저장

- **AWS S3**: 이미지/CSV/JSON
- **PostgreSQL (RDS)**
- **pgvector** 기반 의미 검색

---

## 💾 DB 구조 요약

| 테이블                         | 설명                   |
| ------------------------------ | ---------------------- |
| `Users`                        | 디자이너/관리자 정보   |
| `Projects`                     | 프로젝트 메타관리      |
| `Customer_req`                 | 고객 요구 텍스트       |
| `Ai_make_image`                | 생성 이미지 저장·선택  |
| `Furniture`                    | 가구 메타데이터        |
| `Built_case`, `Built_contents` | 시공사례 텍스트·이미지 |
| `User_log`                     | 사용자 활동 로그       |

---

## 🎨 화면 흐름

| 화면                  | 설명                            |
| --------------------- | ------------------------------- |
| **Landing**           | 서비스 소개                     |
| **Login**             | Cognito 관리자 로그인           |
| **Project 관리**      | 생성 시안 목록                  |
| **Requirements 입력** | 요구사항 입력 폼                |
| **AI 결과 페이지**    | 생성 이미지 3x3 뷰, 선택·재생성 |
| **Resource Library**  | 한샘 자산 검색                  |
| **About Us**          | 팀 소개                         |

---

## ⚙️ 기술 스택

| 영역          | 기술                                                           |
| ------------- | -------------------------------------------------------------- |
| **Frontend**  | React, Next.js, Tailwind, AWS Amplify                          |
| **Backend**   | FastAPI, LangChain, LangGraph, Nginx, Gunicorn                 |
| **AI Models** | OpenAI API (GPT-4.1, GPT-Image-1), PyTorch, NanoBanana, RunPod |
| **Infra**     | Docker, AWS EC2, S3, RDS, Route53, ACM                         |
| **Data**      | PostgreSQL + pgvector                                          |
| **Crawling**  | Selenium, BeautifulSoup, Pandas                                |
| **DevOps**    | GitHub Actions (CI/CD)                                         |

---

## 📊 프로젝트 결과

### ✔ 구축 완료

- 한샘 데이터 기반 텍스트+이미지 생성 파이프라인
- 방 분류 → OpenAI Object Removal → 멀티스텝 이미지 생성
- SLLM Multi-task → 이미지 프롬프트 자동 생성
- 한샘 가구 추천 및 Web Scraping
- AWS 기반 전체 배포 구성 완성

### 🔄 향후 계획

- CLIPScore, SSIM 기반 이미지 평가 자동화
- 피드백 루프 기반 개선
- 디자이너 워크플로우와 통합
- 상업공간/오피스 도메인 확장

---

## 🪪 Repository Info

- **Repository:** https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN15-FINAL-4TEAM
- **Team:** Goodfellow (SKN AI CAMP 15기)
- **Last Updated:** 2025.11
- **Keywords:** `AI Interior Designer`, `SLLM`, `OpenAI Image Edit`, `Image-to-Image`, `AWS`, `FastAPI`, `LangGraph`

---

> **© 2025 Goodfellow Team — SK Networks Family AI CAMP 15기**
