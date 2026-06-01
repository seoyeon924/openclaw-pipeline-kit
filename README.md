# OpenClaw Pipeline Kit

5명의 전문 AI 에이전트 팀이 데이터 분석 → 대시보드 생성을 자동으로 처리합니다.

ai-pipeline-kit의 7단계 파이프라인을 OpenClaw 에이전트 5명이 역할 분담해서 실행합니다.

---

## 강의 구성

### [1단계] 혼자 돌아가는 데이터 분석 팀 만들기

`activity-monitor.html` — 파이프라인 실행 상태 모니터링 대시보드

- 브라우저에서 `activity-monitor.html` 열면 바로 확인 가능
- `runs/latest/status.json` 을 10초마다 자동 폴링
- OpenClaw 파이프라인 실행 시 0/7 → 7/7 단계별 실시간 업데이트
- 데모용: `runs/latest/status.json` 이미 "7/7 완료" 상태로 세팅됨

### [2단계] AI 에이전트 팀이 매일 알아서 분석하고 리포트까지

`runs/sample-ecommerce/outputs/` — 이커머스 사업부 매출 성과 분석 완성 예시

- `sales-report.html` — 이커머스 사업부 매출 성과 분석 보고서 (브라우저에서 바로 열기)
- `06_dashboard.html` — KPI 대시보드
- `07_executive_report.md` — 임원용 보고서
- 이 결과물이 크론으로 매일 자동 생성되는 것이 목표

### [3단계] OpenClaw Agent Manager로 대시보드를 한 화면에서 관리하기

OpenClaw Manager — 에이전트 활동, 크론 스케줄, 파일 브라우저를 한 화면에서 관리

- 에이전트별 실행 상태, Heartbeat, 메모리 파일 확인
- 크론 잡 등록/수정/삭제
- 각 단계별 에이전트가 역할 분담해 체계적인 흐름으로 대시보드를 지속적으로 생성

---

## 에이전트 구성

| 에이전트 | 역할 | 담당 단계 |
|---------|------|---------|
| **Echo** | 데이터 분석 팀장 | 오케스트레이터 — 팀 전체 지휘 |
| **Aria** | 데이터 분석 엔지니어 | STEP 1 data-ingestion + STEP 2 eda |
| **Sam** | 상품 분석가 | STEP 3 problem + STEP 4 metrics |
| **Min** | 비즈니스 분석가 | STEP 5 analysis |
| **Evan** | BI 팀장 | STEP 6 dashboard + STEP 7 report |

---

## 파이프라인 흐름

```
[크론 / 사용자 요청]
        ↓
      Echo (팀장)
        ↓ sessions_send
      Aria → STEP 1, 2 실행
        ↓ sessions_send
       Sam → STEP 3, 4 실행
        ↓ sessions_send
       Min → STEP 5 실행
        ↓ sessions_send
      Evan → STEP 6, 7 실행
        ↓
  텔레그램으로 결과 전송
```

---

## 산출물

```
runs/latest/outputs/
├── 01_dataset_profile.md      ← Aria
├── 02_eda_report.md           ← Aria
├── 03_problem_definition.md   ← Sam
├── 04_kpi_summary.md          ← Sam
├── 05_analysis_report.md      ← Min
├── 06_dashboard.html          ← Evan
└── 07_executive_report.md     ← Evan
```

---

## 셋업 방법

### 1. 텔레그램 봇 5개 생성 (@BotFather)
```
/newbot → echo_pipeline_bot
/newbot → aria_pipeline_bot
/newbot → sam_pipeline_bot
/newbot → min_pipeline_bot
/newbot → evan_pipeline_bot
```

### 2. 각 에이전트 workspace 파일 복사

```bash
cp -r workspace/echo/   ~/.openclaw/workspace-echo/
cp -r workspace/aria/   ~/.openclaw/workspace-aria/
cp -r workspace/sam/    ~/.openclaw/workspace-sam/
cp -r workspace/min/    ~/.openclaw/workspace-min/
cp -r workspace/evan/   ~/.openclaw/workspace-evan/
```

### 3. openclaw.json 에 5개 에이전트 등록

openclaw.json 예시는 workspace/echo/AGENTS.md 하단 참고.

### 4. 데이터 파일 준비

```
runs/latest/input/ 에 CSV 파일 넣기
```

### 5. Echo에게 요청

```
텔레그램 Echo DM:
/run-pipeline
또는
"파이프라인 실행해줘. runs/latest/input/ 에 파일 있어."
```

---

## 크론 자동화 예시

매주 월요일 오전 9시 자동 실행:
```
payload.message:
파일 경로: ~/Projects/openclaw-pipeline-kit/runs/latest/input/weekly.csv
/run-pipeline 실행하고 완료 후 결과물 목록 알려줘.
```
