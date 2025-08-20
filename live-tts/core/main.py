from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

# 내부 모듈 임포트
from .models import ChatRequest, TtsRequest
from .services import gemini_service, tts_service

app = FastAPI()

@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Gemini 서비스와 연동하여 대화 응답을 생성하는 API"""
    try:
        reply = gemini_service.generate_gemini_response(req.message, req.history)
        return {"reply": reply}
    except ConnectionError as e:
         raise HTTPException(status_code=503, detail=f"서비스 연결 오류: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"채팅 응답 생성 중 오류 발생: {e}")

@app.post("/api/tts")
async def text_to_speech(req: TtsRequest):
    """Dia TTS 서비스와 연동하여 음성을 생성하는 API"""
    try:
        audio_buffer = tts_service.generate_dia_tts_audio(req.text)
        return StreamingResponse(audio_buffer, media_type="audio/wav")
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=f"서비스 연결 오류: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS 생성 중 오류 발생: {e}")