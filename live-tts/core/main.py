# live-tts/core/main.py
# Python 3.11, FastAPI, httpx

from fastapi import FastAPI, Response 
from .models import ChatRequest
import httpx 

app = FastAPI()

GEMINI_SERVER_URL = "http://127.0.0.1:8001/generate-text"

# --- ✨ 수정된 부분 ✨ ---
# Docker 포트 매핑에 따라 호스트 포트인 8888로 주소를 변경합니다.
TTS_SERVER_URL = "http://127.0.0.1:8888/convert/tts" 

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # 타임아웃을 넉넉하게 설정합니다.
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # 1. Gemini 서버에 텍스트 생성을 요청 (기존과 동일)
            gemini_response = await client.post(GEMINI_SERVER_URL, json={"prompt": request.message})
            gemini_response.raise_for_status()
            generated_text = gemini_response.json()["text"]

            # 2. 새로운 MeloTTS API 서버의 요청 형식에 맞게 데이터를 구성합니다.
            tts_payload = {
                "text": generated_text,
                "language": "KR",
                "speaker_id": "KR" # MeloTTS의 한국어 화자 ID
            }
            
            # 3. 새로운 TTS 서버에 음성 생성을 요청합니다.
            tts_response = await client.post(TTS_SERVER_URL, json=tts_payload)
            tts_response.raise_for_status()
            audio_bytes = tts_response.content

            # 4. 오디오 데이터를 클라이언트로 응답 (기존과 동일)
            return Response(content=audio_bytes, media_type="audio/wav")
        
        except httpx.HTTPStatusError as e:
            print(f"Error from downstream server: {e.response.status_code} - {e.response.text}")
            return Response(content="An error occurred while communicating with backend services.", status_code=500)
        except httpx.RequestError as e:
            print(f"Request error: {e}")
            return Response(content="Could not connect to a backend service.", status_code=503)
