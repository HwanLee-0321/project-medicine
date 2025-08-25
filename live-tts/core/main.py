# live-tts/core/main.py
# Python 3.11, FastAPI, httpx

# --- 변경된 부분 ---
# 사용하지 않는 StreamingResponse 대신, 실제 사용하는 Response를 명시적으로 임포트합니다.
from fastapi import FastAPI, Response 
from models import ChatRequest
import httpx # HTTP 요청을 보내기 위한 라이브러리

app = FastAPI()

GEMINI_SERVER_URL = "http://127.0.0.1:8001/generate-text"
TTS_SERVER_URL = "http://127.0.0.1:8002/generate-speech"

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # httpx.AsyncClient를 사용하여 비동기 HTTP 요청을 보냅니다.
    # async with 구문은 세션을 자동으로 열고 닫아주어 안전합니다.
    async with httpx.AsyncClient() as client:
        # 1. Gemini 서버에 텍스트 생성을 요청
        gemini_response = await client.post(GEMINI_SERVER_URL, json={"prompt": request.message})
        gemini_response.raise_for_status() # HTTP 오류(4xx, 5xx)가 발생하면 예외를 일으킵니다.
        generated_text = gemini_response.json()["text"]

        # 2. TTS 서버에 음성 생성을 요청
        tts_response = await client.post(TTS_SERVER_URL, json={"text": generated_text})
        tts_response.raise_for_status()
        audio_bytes = tts_response.content

        # 3. 오디오 데이터를 클라이언트로 응답
        # 전체 오디오 바이트를 한 번에 보내므로 StreamingResponse가 아닌 Response가 더 적합합니다.
        return Response(content=audio_bytes, media_type="audio/wav")

# 'httpx' 라이브러리가 없다면 이 파일을 실행할 환경에 설치해야 합니다.
# 예: pip install httpx
