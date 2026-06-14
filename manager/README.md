# OpenClaw Agent Manager

Claude Code로 자동 생성하는 에이전트 관리 데스크톱 앱.

## 사용 방법

1. 이 폴더(`manager/`)에서 Claude Code 실행
2. `PROMPT.md` 안의 프롬프트 전체를 Claude Code에 붙여넣기
3. 완성 후 실행:

```bash
npm install
npm run tauri dev
```

## 앱 구성

- **Dashboard** — 에이전트 상태 카드 + `openclaw status`
- **AgentDetail** — 파일 탐색, HEARTBEAT.md 편집, 세션 히스토리, 메시지 전송
- **Gallery** — 파이프라인 결과 파일 갤러리
- **크론 잡** — `openclaw cron list` 시각화
- **Git Sync** — 파이프라인 키트 git 상태 관리
- **Settings** — openclaw.json 주요 설정 확인

## 요구 사항

- Node.js 18+
- Rust (Tauri 빌드용)
- OpenClaw 설치 + 실행 중
