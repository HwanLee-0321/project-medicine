#!/bin/bash

# 스크립트가 있는 디렉토리로 이동하여 경로 문제를 해결합니다.
cd "$(dirname "$0")"

echo "======================================================"
echo " Live TTS 애플리케이션을 시작합니다..."
echo " (백엔드 서버, 프론트엔드 서버, ngrok 터널링)"
echo "======================================================"

# Python 가상환경이 프로젝트 루트에 있다고 가정하고 활성화합니다.
if [ -f "../.venv/bin/activate" ]; then
    echo "Python 가상환경(.venv)을 활성화합니다."
    source ../.venv/bin/activate
fi

# 자동 실행 스크립트를 실행합니다.
python run_app.py
