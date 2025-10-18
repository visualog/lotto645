# 프로젝트 상태 요약: 로또 번호 동적 추천 시스템

## 현재 목표
Google Cloud Platform (GCP)을 백엔드로 사용하는 동적 로또 번호 추천 웹사이트 구축.

## 현재까지의 진행 상황

### 1. 프론트엔드 (Next.js - `lotto-analyzer-web`)
*   `shadcn/ui`를 사용하여 모든 분석 탭(번호 빈도, 패턴, 시계열, 머신러닝 예측, 동시 출현, 통합 분석 추천, 합계 기반 추천) 구현 완료.
*   로컬 환경에서 백엔드 API로부터 데이터를 성공적으로 가져와 표시 중.

### 2. 백엔드 (Python FastAPI - `lotto-backend-api`)
*   모든 분석 및 추천 로직이 통합된 API 엔드포인트 구현 완료.
*   로컬 환경에서 `lotto_history.csv` 파일을 읽어 데이터를 제공 중.

### 3. 클라우드 배포 준비
*   백엔드 및 프론트엔드 애플리케이션을 위한 `Dockerfile` 작성 완료.
*   GitHub Actions를 통한 GCP Cloud Run 배포 자동화를 위한 `deploy.yml` 워크플로우 파일 작성 완료.

## 현재 직면한 문제
*   GitHub Actions를 통한 GCP Cloud Run 배포 시 `PERMISSION_DENIED` 오류 발생.
    *   `demo-service-account@...` 서비스 계정이 Cloud Run 배포 시 필요한 `iam.serviceaccounts.actAs` 권한이 부족함.

## 다음 진행 단계 (사용자 역할)
1.  **GCP IAM 권한 부여:** `demo-service-account@sincere-charmer-472810-a8.iam.gserviceaccount.com` 서비스 계정에 **`서비스 계정 사용자` (Service Account User)** 역할을 부여해야 합니다.
2.  **GitHub Actions 재실행:** 권한 부여 후 GitHub Actions 워크플로우를 다시 실행하여 배포를 시도합니다.

## 배포 성공 후 다음 단계
*   배포된 백엔드 서비스의 URL을 프론트엔드(`lotto-analyzer-web/Dockerfile` 내 `NEXT_PUBLIC_API_BASE_URL` 환경 변수)에 업데이트하고 프론트엔드를 재배포해야 함.
*   배포된 웹사이트의 기능 테스트.

---
