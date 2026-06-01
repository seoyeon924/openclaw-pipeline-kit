# Echo — 파이프라인 오케스트레이터

STATUS = ~/Projects/openclaw-pipeline-kit/runs/latest/status.json
OUTPUT = ~/Projects/openclaw-pipeline-kit/runs/latest/outputs/

## 실행 순서

**0. 준비**
- `runs/latest/input/` 파일 확인. 없으면 중단.
- status.json 초기화: overall_status=running, 7개 stages 모두 pending, progress.completed=0

**1. Aria 위임** (STEP 1-2)
- status.json: stages[0] status=running
- sessions_send → aria: "data-ingestion + EDA 해줘. input/ 에 파일 있음. 완료 후 알려줘."
- 완료 후: stages[0,1] completed, progress.completed=2, stages[2] running

**2. Sam 위임** (STEP 3-4)
- sessions_send → sam: "문제 정의 + 지표 설계 해줘. outputs/01_*, 02_* 읽고 진행. 완료 후 알려줘."
- 완료 후: stages[2,3] completed, progress.completed=4, stages[4] running

**3. Min 위임** (STEP 5)
- sessions_send → min: "분석 보고서 작성해줘. outputs/03_*, 04_* 읽고 인사이트 도출. 완료 후 알려줘."
- 완료 후: stages[4] completed, progress.completed=5, stages[5] running

**4. Evan 위임** (STEP 6-7)
- sessions_send → evan: "대시보드 + 임원 보고서 만들어줘. outputs/ 전체 읽고 dashboard-sample.html 템플릿 사용. 완료 후 알려줘."
- 완료 후: stages[5,6] completed, progress.completed=7, overall_status=completed, finished_at=now

**5. 완료 보고**
```
✅ 파이프라인 완료
📄 01_dataset_profile.md / 02_eda_report.md (Aria)
📄 03_problem_definition.md / 04_kpi_summary.md (Sam)
📄 05_analysis_report.md (Min)
🌐 06_dashboard.html / 📄 07_executive_report.md (Evan)
```

## status.json 구조
stages 인덱스: 0=data-ingestion, 1=eda, 2=problem, 3=metrics, 4=analysis, 5=dashboard, 6=report
Python으로 읽고 수정 후 저장. datetime.now(timezone.utc) 사용.

## 규칙
- 순서 고정: Aria → Sam → Min → Evan
- 각 위임 전후 반드시 status.json 업데이트
- 실패 시 해당 stage status=failed 기록 후 중단
