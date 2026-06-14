# OpenClaw Agent Manager — 빌드 프롬프트

아래 내용을 Claude Code에 그대로 붙여넣으세요.
`manager/` 폴더 안에서 실행하면 Agent Manager 앱이 자동으로 만들어집니다.

---

## 붙여넣을 프롬프트

```
이 폴더(manager/)에 React + TypeScript + Vite + Tauri 2 앱을 만들어줘.
완성되면 `npm install && npm run tauri dev`로 바로 실행되게 해줘.

─────────────────────────────────────
## 기술 스택
─────────────────────────────────────
- Vite 5 + React 18 + TypeScript
- Tauri 2 (Rust 백엔드, macOS/Windows 네이티브 앱)
- lucide-react (아이콘만)
- 외부 CSS 라이브러리 없음 — 모든 스타일은 인라인 style 객체

─────────────────────────────────────
## 디자인 토큰
─────────────────────────────────────
배경: #F9FAFB
텍스트 기본: #191F28
서브 텍스트: #6B7684
비활성: #B0B8C1
테두리: #E5E8EB
파란 accent: #3182F6
활성 배경: #EBF3FE
카드 배경: #FFFFFF
카드 그림자: 0 1px 6px rgba(0,0,0,0.07)
카드 radius: 12px
버튼 radius: 8px
폰트: system-ui, -apple-system, "Apple SD Gothic Neo", sans-serif

─────────────────────────────────────
## 에이전트 목록 (constants.ts)
─────────────────────────────────────
AGENTS 배열에 이 세 명만 넣어줘:
  { id: "main",  name: "Echo", color: "#818cf8", workspace: "~/.openclaw/workspace",      sessionsDir: "~/.openclaw/agents/main/sessions" }
  { id: "min",   name: "Min",  color: "#34d399", workspace: "~/.openclaw/workspace-min",  sessionsDir: "~/.openclaw/agents/min/sessions" }
  { id: "evan",  name: "Evan", color: "#fb923c", workspace: "~/.openclaw/workspace-evan", sessionsDir: "~/.openclaw/agents/evan/sessions" }

─────────────────────────────────────
## 뷰 타입
─────────────────────────────────────
type View = "dashboard" | "agent" | "gallery" | "cron" | "git-sync" | "settings"

─────────────────────────────────────
## 전체 레이아웃 (App.tsx)
─────────────────────────────────────
display:flex; height:100vh
- 왼쪽: Sidebar (width:220px, background:#FFFFFF, borderRight:1px solid #E5E8EB)
- 오른쪽: main (flex:1, overflow:auto, paddingTop:32px)

뷰에 따라 오른쪽 영역 전환:
  dashboard → <Dashboard onSelectAgent={fn} />
  agent     → <AgentDetail agent={selectedAgent} />
  gallery   → <Gallery />
  cron      → <CronJobs />
  git-sync  → <GitSync />
  settings  → <Settings />

─────────────────────────────────────
## Sidebar (components/Sidebar.tsx)
─────────────────────────────────────

### 구조 (위에서 아래):
1. Tauri drag 영역 (height:32px, data-tauri-drag-region 속성)
2. 로고 영역 (height:48px, borderBottom:1px solid #E5E8EB):
   - 파란 둥근 사각형(#3182F6, radius:8px) 안에 Zap 아이콘(흰색, size:16)
   - 오른쪽에 "OpenClaw" bold 텍스트
3. AGENTS 섹션 레이블 ("AGENTS", uppercase, 11px, #B0B8C1, letterSpacing:0.06em)
4. 에이전트 버튼 3개 (각각 클릭 시 onSelectAgent 호출):
   - 컬러 원형 avatar (28px, border:2.5px solid agent.color, 이니셜 텍스트)
   - 에이전트 이름 (14px, fontWeight:500)
   - 우측에 작은 회색 원 6px (offline 표시)
   - 활성 스타일: background:#EBF3FE, borderLeft:2px solid #3182F6, 텍스트 #3182F6
5. 구분선 (1px solid #E5E8EB)
6. 네비게이션 버튼 5개:
   - Dashboard (LayoutDashboard 아이콘)
   - 갤러리 (LayoutGrid 아이콘)
   - 크론 잡 (Clock 아이콘)
   - Git Sync (GitBranch 아이콘)
   - Settings (Settings 아이콘)
   - 활성: 에이전트 버튼과 동일한 스타일
7. 하단 모니터링 위젯 (borderTop:1px solid #E5E8EB, padding:12px):
   - "모니터링" 레이블(10px, #B0B8C1, uppercase) + RefreshCw 버튼(11px)
   - 에이전트별 토큰 사용량 바:
     각 에이전트(Echo/Min/Evan)에 대해:
       · 6px 컬러 원 + 이름(10px, bold) + 퍼센트(10px, bold, 80↑빨강/50↑주황/나머지파랑)
       · 프로그레스 바 (height:4px, background:#F2F4F6, 채워진 부분은 퍼센트 색)
       · "Xk / 1000k ctx" 텍스트 (9px, #B0B8C1)
     데이터는 `openclaw status` 실행 결과 파싱:
       - ":main:main" 포함 줄 → Echo
       - ":min:main" 포함 줄 → Min  
       - ":evan:main" 포함 줄 → Evan
       - 정규식: /(\d+)k\/(\d+)k\s*\((\d+)%\)/
   - 구분선
   - 계정 전환 버튼 (RotateCcw 11px + "계정 전환" 11px):
     클릭 시 드롭다운 펼침:
       ~/.openclaw/agents/main/agent/auth-profiles.json 읽기
       profiles 객체의 각 키를 항목으로 표시
       isCurrent: lastGood.anthropic 값과 비교
       isOnCooldown: usageStats[id].cooldownUntil > Date.now()
       errorCount: usageStats[id].errorCount
       "전환" 버튼 클릭 → order 배열에서 해당 id를 맨 앞으로 → lastGood 업데이트 → 파일 저장
       쿨다운 상태: AlertCircle 주황색 + "쿨다운 Xs 남음"
       현재 사용중: CheckCircle 파란색 + "사용중"
       에러 횟수: 9px #B0B8C1
   - "v0.1.0" (10px, #B0B8C1, 가운데)

─────────────────────────────────────
## Dashboard 뷰 (views/Dashboard.tsx)
─────────────────────────────────────
- 제목 "Dashboard" (20px, bold)
- 에이전트 카드 3개 (CSS grid, repeat(3, 1fr), gap:16px):
  각 카드 (background:#FFFFFF, border:1px solid #E5E8EB, radius:12px, padding:20px, shadow):
    · 상단: 컬러 원(40px, 이니셜) + 이름(16px bold) + "Offline" 회색 배지
    · 중단: "Workspace" → 경로(monospace, 최대 140px, 말줄임), "Agent ID" → id
    · 하단: "View Files" 버튼 + "Send Message" 버튼 (각각 클릭 시 onSelectAgent)
- OpenClaw Status 섹션:
  · "OpenClaw Status" (14px, #6B7684) + RefreshCw 버튼
  · pre 태그: `openclaw status` 결과 표시 (background:#F9FAFB, border:1px solid #E5E8EB, radius:12px, padding:16px, monospace 13px)
  · 컴포넌트 마운트 시 자동 실행, 버튼 클릭 시 재실행

─────────────────────────────────────
## AgentDetail 뷰 (views/AgentDetail.tsx)
─────────────────────────────────────
탭 4개 (탭 바: borderBottom:1px solid #E5E8EB):
  활성 탭: color:#3182F6, borderBottom:2px solid #3182F6
  비활성 탭: color:#6B7684

1. 파일 탭 (components/FilesTab.tsx):
   `openclaw workspace ls --agent {agent.id}` 실행
   결과를 파일/폴더 목록으로 표시 (FileText 아이콘)
   클릭 시 파일 내용 읽어서 아래 미리보기 패널에 표시

2. 하트비트 탭 (components/HeartbeatTab.tsx):
   에이전트 workspace의 HEARTBEAT.md 읽기
   textarea에 표시 (편집 가능)
   "저장" 버튼: writeFile로 덮어쓰기

3. 히스토리 탭 (components/HistoryTab.tsx):
   agent.sessionsDir 디렉토리 목록 조회
   각 세션 파일(날짜순 내림차순)을 리스트로 표시
   클릭 시 세션 파일 내용 표시 (JSONL → 대화 형식으로 파싱)

4. 메시지 전송 탭 (components/SendTab.tsx):
   에이전트 이름 표시
   textarea (placeholder: "에이전트에게 보낼 메시지를 입력하세요...")
   "전송" 버튼: `openclaw sessions send --agent {agent.id} --message "..."` 실행
   전송 후 성공/실패 메시지 표시

─────────────────────────────────────
## Gallery 뷰 (views/Gallery.tsx)
─────────────────────────────────────
~/Projects/openclaw-pipeline-kit/runs/ 디렉토리 스캔
각 run 폴더의 outputs/ 안 파일들을 카드 그리드로 표시

카드 레이아웃 (grid, repeat(auto-fill, minmax(200px, 1fr)), gap:12px):
  · 파일 확장자 아이콘: .md→FileText(파란), .html→Globe(초록), .csv→Table(주황)
  · 파일명 (14px, bold)
  · 수정 날짜 (12px, #6B7684)
  · 담당 에이전트 태그 (파일명 기반으로 추정):
    01/02→Aria, 03/04→Sam, 05→Min, 06/07→Evan
  · 클릭 시 모달로 파일 내용 미리보기

새로고침 버튼 상단 우측

─────────────────────────────────────
## CronJobs 뷰 (views/CronJobs.tsx)
─────────────────────────────────────
`openclaw cron list` 실행 결과 파싱

파싱 방법:
  헤더 줄에서 Name/Schedule/Next/Last/Status/Agent ID 컬럼 위치 파악
  각 데이터 줄을 슬라이싱해서 CronJob 객체 생성:
    { id, name, schedule, next, last, status: "ok"|"error"|"paused", agent }

크론 잡 카드 (각각 border:1px solid #E5E8EB, radius:12px, padding:16px 20px):
  · 좌: 상태 아이콘 (ok→CheckCircle초록, error→AlertCircle빨강, paused→Pause회색)
  · 중: 이름(bold) + 스케줄 텍스트(monospace, #6B7684)
  · 우: 다음실행/마지막실행 시간 + 에이전트 컬러 배지

새로고침 버튼, 마운트 시 자동 로드

─────────────────────────────────────
## GitSync 뷰 (views/GitSync.tsx)
─────────────────────────────────────
`git -C ~/Projects/openclaw-pipeline-kit status` 실행 결과 표시
"git pull" / "git push" 버튼 (각각 실행 후 결과 표시)
마지막 커밋 메시지 표시 (`git -C ... log -1 --oneline`)

─────────────────────────────────────
## Settings 뷰 (views/Settings.tsx)
─────────────────────────────────────
~/.openclaw/openclaw.json 읽어서 주요 설정 표시:
  · 게이트웨이 포트
  · 에이전트 모델
  · agentToAgent enabled 상태
"설정 파일 열기" 버튼: `open ~/.openclaw/openclaw.json` (macOS) 실행

─────────────────────────────────────
## Tauri 훅 (hooks/useTauri.ts)
─────────────────────────────────────
세 함수를 export:

  async function runCommand(cmd: string, args: string[]): Promise<string>
    → Tauri의 Command.create(cmd, args).execute() 사용
    → stdout 반환, stderr 있으면 throw

  async function readFile(path: string): Promise<string>
    → path의 ~ 를 실제 홈 디렉토리로 치환
    → Tauri fs.readTextFile 사용

  async function writeFile(path: string, content: string): Promise<void>
    → path의 ~ 를 실제 홈 디렉토리로 치환
    → Tauri fs.writeTextFile 사용

─────────────────────────────────────
## Tauri 설정 (src-tauri/tauri.conf.json)
─────────────────────────────────────
productName: "OpenClaw Agent Manager"
identifier: "com.openclaw.agent-manager"
윈도우: 1200×800, min 900×600
titleBarStyle: "Overlay", hiddenTitle: true
권한: shell:execute(openclaw, git, open, ls, cat), fs:read-all, fs:write-all

─────────────────────────────────────
## 파일 구조
─────────────────────────────────────
manager/
  package.json          (vite, react, typescript, @tauri-apps/api, lucide-react)
  vite.config.ts
  tsconfig.json
  index.html
  src/
    main.tsx
    App.tsx
    index.css           (body { margin:0; }, @keyframes spin)
    constants.ts
    types/
      index.ts          (Agent, DirEntry, View, AgentStatus 타입)
    hooks/
      useTauri.ts
    views/
      Dashboard.tsx
      AgentDetail.tsx
      Gallery.tsx
      CronJobs.tsx
      GitSync.tsx
      Settings.tsx
    components/
      Sidebar.tsx
      FilesTab.tsx
      HeartbeatTab.tsx
      HistoryTab.tsx
      SendTab.tsx
  src-tauri/
    tauri.conf.json
    Cargo.toml
    src/
      main.rs
      lib.rs

─────────────────────────────────────
## 주의사항
─────────────────────────────────────
- 모든 스타일은 인라인 style 객체 (className 없음)
- AGENTS 배열은 constants.ts 한 곳에서만 정의
- ~ 경로는 반드시 Tauri homeDir() API로 치환 후 사용
- 에러 시 빈 상태 또는 "데이터 없음" 표시 (콘솔 로그)
- 한국어/영어 혼용 UI OK
- 컴포넌트 마운트 시 데이터 자동 로드
- lucide-react 외 외부 의존성 추가 금지
```
