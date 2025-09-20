# app.py
# Python 3.10, FastAPI, MeloTTS

from fastapi import FastAPI, Body
from fastapi.responses import Response
from pydantic import BaseModel
from melo.api import TTS
import torch
import soundfile as sf
import io
import logging

# --- 로깅 설정 ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FastAPI 앱 초기화 ---
app = FastAPI()

# --- 모델 로딩 ---
# 서버가 시작될 때 모델을 한 번만 로드하여 메모리에 상주시키는 것이 효율적입니다.
try:
    TORCH_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"MeloTTS 모델을 로딩합니다. 사용하는 장치: {TORCH_DEVICE}")
    
    # MeloTTS 모델 로드 (언어: 한국어)
    model = TTS(language='KR', device=TORCH_DEVICE)
    speaker_ids = model.hps.data.spk2id
    
    logger.info("✅ MeloTTS 모델 로딩이 완료되었습니다.")

except Exception as e:
    logger.error(f"💥 모델 로딩 중 치명적인 오류가 발생했습니다: {e}")
    # 모델 로딩 실패 시 서버가 시작되지 않도록 예외를 발생시킵니다.
    model = None

# --- API 요청 본문 모델 정의 ---
class TTSRequest(BaseModel):
    text: str
    speed: float = 1.0

@app.on_event("startup")
async def startup_event():
    if model is None:
        raise RuntimeError("TTS 모델을 로드할 수 없어 서버를 시작할 수 없습니다.")

@app.post("/generate-speech", response_class=Response)
async def generate_speech(request: TTSRequest = Body(...)):
    """
    입력된 텍스트를 받아 음성(wav) 데이터를 생성하여 반환합니다.
    """
    try:
        logger.info(f"음성 생성 요청 수신: '{request.text}'")

        # 메모리 내 버퍼에 음성을 생성합니다. (파일 저장 X)
        audio_tensor, sample_rate = model.synthesizer.synthesize(
            request.text,
            speaker_ids['KR'],
            speed=request.speed
        )
        audio_array = audio_tensor.cpu().numpy().squeeze()
        
        buffer = io.BytesIO()
        sf.write(buffer, audio_array, sample_rate, format='WAV', subtype='PCM_16')
        audio_bytes = buffer.getvalue()
        
        logger.info("✅ 음성 생성이 완료되었습니다.")
        
        # 생성된 WAV 파일 데이터를 HTTP 응답으로 직접 반환합니다.
        return Response(content=audio_bytes, media_type="audio/wav")

    except Exception as e:
        logger.error(f"⚠️ 음성 생성 중 오류 발생: {e}", exc_info=True)
        return Response(content=f"Error during speech generation: {e}", status_code=500)

if __name__ == "__main__":
    import uvicorn
    # 8080 포트에서 서버를 실행합니다.
    uvicorn.run(app, host="0.0.0.0", port=8080)
