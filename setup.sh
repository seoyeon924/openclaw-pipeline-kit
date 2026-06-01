#!/bin/bash
# openclaw-pipeline-kit 셋업 스크립트
# 실행: bash setup.sh

set -e

echo "📦 openclaw-pipeline-kit 셋업 시작..."

# 1. 워크스페이스 폴더 생성 및 AGENTS.md 복사
for agent in echo aria sam min evan; do
  src="workspace/$agent"
  if [ "$agent" = "echo" ]; then
    dst="$HOME/.openclaw/workspace"
  else
    dst="$HOME/.openclaw/workspace-$agent"
  fi
  mkdir -p "$dst"
  cp "$src/AGENTS.md" "$dst/AGENTS.md"
  echo "✓ $agent → $dst/AGENTS.md"
done

# 2. 결과물 폴더 생성
mkdir -p runs/latest/input
mkdir -p runs/latest/outputs
echo "✓ runs/latest/ 폴더 생성"

echo ""
echo "✅ 셋업 완료!"
echo ""
echo "다음 단계:"
echo "  1. openclaw onboard 실행 (API 키 + 텔레그램 봇 설정)"
echo "  2. runs/latest/input/ 에 CSV 파일 넣기"
echo "  3. 텔레그램 Echo 봇에게 '파이프라인 실행해줘' 전송"
