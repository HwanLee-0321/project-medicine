import subprocess
import time
import sys
import os
from pyngrok import ngrok, conf

# --- 설정 ---
BACKEND_PORT = 8000
FRONTEND_PORT = 5173
# ---

def check_ngrok_auth():
    """ngrok 인증 토큰이 설정되었는지 확인하고, 없으면 설정을 요청합니다."""
    # 1. 시스템 환경 변수에서 'NGROK_AUTH_TOKEN'을 먼저 확인합니다.
    authtoken = os.environ.get("NGROK_AUTH_TOKEN")
    if authtoken:
        print("✅ 시스템 환경 변수에서 ngrok 인증 토큰을 발견했습니다.")
        ngrok.set_auth_token(authtoken)
        return # 토큰을 찾았으므로 함수 종료

    # 2. 환경 변수가 없으면 기존 방식(pyngrok 설정 파일 또는 직접 입력)을 따릅니다.
    try:
        # pyngrok 설정 파일 경로 확인
        conf.get_default().config_path
    except conf.PyngrokConfigError:
        print("="*60)
        print("🚨 ngrok 인증 토큰(authtoken)이 설정되지 않았습니다.")
        print("1. https://dashboard.ngrok.com/get-started/your-authtoken 에서 토큰을 복사하세요.")
        authtoken_input = input("2. 복사한 토큰을 여기에 붙여넣고 Enter를 누르세요: ")
        if authtoken_input:
            ngrok.set_auth_token(authtoken_input)
            print("✅ ngrok 인증 토큰이 성공적으로 설정되었습니다.")
        else:
            print("❌ 토큰이 입력되지 않았습니다. 스크립트를 종료합니다.")
            sys.exit(1)
        print("="*60)



def run_command(command, name):
    """지정된 명령어를 백그라운드 프로세스로 실행합니다."""
    print(f"🚀 '{name}'을(를) 시작합니다...")
    # Windows에서 npm 실행을 위해 shell=True 사용
    process = subprocess.Popen(
        command,
        stdout=sys.stdout,
        stderr=sys.stderr,
        shell=sys.platform == "win32"
    )
    return process

def main():
    """백엔드, 프론트엔드 서버 및 ngrok 터널을 시작하는 메인 함수"""
    
    # 1. ngrok 인증 확인
    check_ngrok_auth()

    # 2. 명령어 정의
    backend_command = ["uvicorn", "core.main:app", "--host", "127.0.0.1", "--port", str(BACKEND_PORT)]
    frontend_command = ["npm", "run", "dev"]

    processes = []
    public_url = None

    try:
        # 3. 백엔드 및 프론트엔드 서버 실행
        processes.append(run_command(backend_command, "백엔드 서버"))
        processes.append(run_command(frontend_command, "프론트엔드 서버"))

        print("\n⏳ 서버가 시작될 때까지 잠시 기다립니다... (약 10-15초)")
        time.sleep(15)

        # 4. ngrok 터널 생성 및 공개 주소 가져오기
        print(f"🚇 ngrok 터널을 포트 {FRONTEND_PORT}에 연결합니다...")
        public_url = ngrok.connect(FRONTEND_PORT, "http")
        
        print("\n" + "="*60)
        print("🎉 모든 준비가 완료되었습니다! 🎉")
        print(f"🌍 공개 주소: {public_url}")
        print("이 주소를 다른 사람과 공유하여 앱에 접속할 수 있습니다.")
        print("="*60)
        print("\n(종료하려면 이 터미널에서 Ctrl+C 를 누르세요)")

        # 스크립트가 종료되지 않도록 유지
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 종료 신호를 감지했습니다. 모든 프로세스를 정리합니다...")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
    finally:
        # 5. 모든 프로세스 종료
        if public_url:
            ngrok.disconnect(public_url)
            print("🔌 ngrok 터널 연결을 해제했습니다.")
        for p in processes:
            p.terminate()
        ngrok.kill()
        print("✅ 모든 서버 프로세스를 종료했습니다. 안녕히 가세요!")


if __name__ == "__main__":
    main()
    