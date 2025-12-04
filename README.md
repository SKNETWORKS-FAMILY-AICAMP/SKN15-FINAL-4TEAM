# 🏠 ASSEMBLE: AI 인테리어 디자이너

> **SK Networks Family AI CAMP 15기 – 4팀 Goodfellow**  
> 한샘 인테리어 컨설팅 프로세스를 자동화하는 **AI 기반 시안 생성 플랫폼**

---

## 🔰 프로젝트 개요

**ASSEMBLE**은 사용자가 입력한 **요구사항(Text)** 과 **방 이미지(Image)** 를 기반으로

- **SLLM 기반 인테리어 설명 생성**
- **OpenAI Image Edit 기반 Object Removal / 빈 방 생성**
- **요구사항 반영 이미지 재생성 (Image-to-Image)**
- **한샘 가구 추천 + 가격·URL 매칭 자동화**

까지 수행하는 **end-to-end 인테리어 생성·추천 시스템**입니다.

> "AI가 초안을 만들고, 디자이너가 완성한다."

---

## 🧭 문제 정의

| 문제                    | 기존 방식의 한계                        |
| ----------------------- | ---------------------------------------  |
| 이미지 기반 상담 난이도  | 가구·구조 노이즈로 시안 제작 난이도 ↑    |
| 초안 반복 수정           | "따뜻한 느낌" 등 모호한 표현 해석 어려움 |
| 초기 시안 제작 부담      | 디자이너가 모든 과정을 수작업으로 처리   |
| 비효율적 가구 추천       | 고객 취향·예산 분석 → 가구 매칭 반복 작업|

**ASSEMBLE**은 이 과정을 자동화하여  
디자이너의 **초기 시안 제작 시간을 크게 단축**하고 **품질 일관성**을 확보합니다.

---

## 💡 주요 기능

| 기능                                    | 설명                                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| **방 이미지 분류(Classification)**      | 방/비방 여부 및 빈방 여부 자동 판별          |
| **Object Removal (OpenAI)** | 기존 사진에서 가구 제거 후 빈 방 생성 |
| **SLLM Multi-task**                     | 설명 + 프롬프트 + 가구 목록 동시 생성 |
| **요구사항 기반 재생성(Feedback Loop)** | 이전 출력물 + 사용자 추가 요청을 반영해 재생성                    |
| **한샘 Web Scraper**               | 추천된 가구명을 기반으로 가격·URL 수집                |
| **Complete Pipeline**                   | 텍스트 → 이미지 → 가구 추천 단일 파이프라인 구성       |

---
## 👥 팀 구성 (Goodfellow)  

| 권주연 | 강민정 | 기현택 | 정민철 | 임경원 |
|--------|--------|--------|--------|--------|
| <img src="https://github.com/user-attachments/assets/4c0d0666-7cce-4a00-9752-eabe04ffc819" width="160" height="160" /> | <img src="https://github.com/user-attachments/assets/cee30360-6ebd-483d-a15e-08cd66ade36d" width="160" height="160" /> | <img src="https://github.com/user-attachments/assets/55202f12-190a-41a5-a057-06b7ce59c49d" width="160" height="160" /> | <img src="https://github.com/user-attachments/assets/1e3d5ad6-0f95-4677-a93d-d2b59895dc67" width="160" height="160" /> | <img src="https://github.com/user-attachments/assets/62492357-b120-4bb9-b4d0-e2b7bde93f5e" width="160" height="160" /> |
| **PM & SLLM Engineer** | **UNet / Preprocessing Engineer** | **Backend & Partial Frontend** | **Image AI & DB Engineer** | **Frontend & AWS Infra** |
| • 프로젝트 총괄/기획<br>• SLLM 파이프라인<br>• Classification 설계 | • UNet 빈방모델 학습<br>• 이미지 전처리/마스킹<br>• 데이터 제작·정제 | • Django 백엔드<br>• DB 연동/REST API<br>• 프론트 일부 기능 | • NanoBanana 이미지 생성<br>• Object Removal 연동<br>• DB 설계/QA | • Next.js UI/UX<br>• FastAPI 연동<br>• AWS 인프라/배포 |




---
## 🧱 시스템 아키텍처

<img width="3459" height="2436" alt="fin_system" src="https://github.com/user-attachments/assets/6703df82-398e-4c89-9741-6340802a2081" />


### 🔵 Primary Flow (Black Line)

초기 입력 → 방 여부 분류 → (필요 시) Object Removal → 1차 및 최종 이미지 생성

### 🟢 Feedback Flow (Green Line)

사용자 불만족 → 추가 요구사항 입력 → 재생성

---
## ☁️ AWS 인프라 아키텍처  

---

## 🧠 AI 모델 구성

| 모델명                                  | 역할               | 입력             | 출력                   |
| ------------------------------------ | ---------------- | -------------- | -------------------- |
| **Classification Model**             | 방 여부·빈방 판별       | 이미지            | Yes/No               |
| **OpenAI Image Edit (gpt-image-1)**  | 가구 제거 / 빈 방 생성   | 원본 이미지 + 마스크   | Clean Room           |
| **Image Model (NanoBanana)** | 인테리어 시안 생성       | 빈 방 이미지 + 프롬프트 | 시안 이미지               |
| **SLLM (Multi-task)**                | 설명·프롬프트·가구 목록 생성 | 요구 텍스트         | DESC + PROMPT + FURN |



---

## 💾 DB 구조 요약
- Users – 사용자 정보  
- Projects – 프로젝트 메타 데이터  
- Customer_req – 고객 요구 텍스트  
- Ai_make_image – 생성 이미지 저장  
- Furniture – 가구 데이터  
- Built_case / Built_contents – 시공사례 정보  
- User_log – 사용자 로그

---

## ⚙️ Tech Stack

<p align="left">
  <!-- Frontend -->
  <img src="https://img.shields.io/badge/Next.js-000?style=flat&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/AWS%20Amplify-FF9900?style=flat&logo=awsamplify&logoColor=black"/>

  <!-- Backend -->
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/LangChain-000?style=flat&logo=chainlink&logoColor=white"/>
  <img src="https://img.shields.io/badge/LangGraph-000000?style=flat&logoColor=white"/>

  <!-- AI -->
  <img src="https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white"/>
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=flat&logo=pytorch&logoColor=white"/>

  <!-- Infra -->
  <img src="https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazonaws&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white"/>

  <!-- Data -->
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white"/>
</p>

**Other Key Tools:** `pgvector`, `RunPod`, `NanoBanana`, `Stable Diffusion`, `FLUX`, `Selenium`, `BeautifulSoup`, `Pandas`

---
## 📈 Performance Metrics (0~1 Scale)
> 모든 스코어는 0~1 스케일 또는 절대값(CLIPScore) 기준으로 표시.

### 🧠 SLLM (Multi-task)

| **Loss Curve** | **BLEU Score** |
|----------------|----------------|
| <img width="500" src="https://github.com/user-attachments/assets/382f4522-e69b-4a75-8593-32033aba0291" /> | <img width="500" src="https://github.com/user-attachments/assets/90eebedd-4bcd-4e6e-833e-a5471c3dc872" /> |

| **ROUGE-L / METEOR** | **BERTScore(F1) / Embedding Cosine** |
|----------------------|--------------------------------------|
| <img width="500" src="https://github.com/user-attachments/assets/54fc294e-4279-44d8-bb79-15c379c0f33c" /> | <img width="500" src="https://github.com/user-attachments/assets/a8a62cf3-3d5f-435b-a06e-3065528047b8" /> |
  

---

## 📊 프로젝트 결과

### ✔ 구축 완료

- 한샘 데이터 기반 텍스트+이미지 생성 파이프라인
- 방 분류 → OpenAI Object Removal → 멀티스텝 이미지 생성
- SLLM Multi-task → 인테리어 설명·프롬프트·가구 리스트 일괄 생성
- 한샘 가구 추천 자동화 및 Web Scraping 연동
- AWS 기반 전체 배포 (EC2/S3/RDS/Amplify)

### 🔄 향후 계획

- 이미지 품질 평가 자동화(CLIPScore/SSIM)
- 반복 피드백 기반 Fine Loop 고도화
- 디자이너 워크플로우와 통합
- 상업 공간/오피스 도메인 확장

### 📌 Demo Screens

| **Main Page** | **My Project** |
|--------------|----------------|
| <img width="500" src="https://github.com/user-attachments/assets/4581c022-1265-4381-8f30-c9bd2c1039d1" /> | <img width="500" src="https://github.com/user-attachments/assets/bbf8e46f-2a44-422a-9df9-feeeff4c5779" /> |

| **Created Images** | **Final Results** |
|-------------------|-------------------|
| <img width="500" src="https://github.com/user-attachments/assets/ae83bb32-4537-41db-8c1d-25d1554dfa59" /> | <img width="500" src="https://github.com/user-attachments/assets/68ebbebb-a057-4a8c-bbd9-e4a56c975757" /> |



---

## 🪪 Repository Info

- **Repository:** https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN15-FINAL-4TEAM
- **Team:** Goodfellow (SKN AI CAMP 15기)
- **Last Updated:** 2025.11
- **Keywords:** `AI Interior Designer`, `SLLM`, `OpenAI Image Edit`, `Image-to-Image`, `AWS`, `FastAPI`, `LangGraph`

---

> **© 2025 Goodfellow Team — SK Networks Family AI CAMP 15기**
