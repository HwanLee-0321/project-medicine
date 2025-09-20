# live-tts/core/tts_server/tts_server.py
# Python 3.11, FastAPI, MeloTTS, PyTorch

from fastapi import FastAPI, Response
from pydantic import BaseModel
from melo.api import MeloTTS
import torch
import soundfile as sf
import io
import logging

# --- 로깅 설정 ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FastAPI 애플리케이션 초기화 ---
app = FastAPI()

# --- 모델 로딩 ---
try:
    TORCH_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    
    logger.info(f"MeloTTS 모델을 로딩합니다. 사용하는 장치: {TORCH_DEVICE}")
    
    # MeloTTS 모델을 로드합니다. 한국어('KO')를 지원합니다.
    model = MeloTTS(language='KO', device=TORCH_DEVICE)
    
    # 한국어 화자 ID를 가져옵니다.
    speaker_ids = model.hps.data.spk2id
    
    logger.info("✅ MeloTTS 모델 로딩이 완료되었습니다.")

except Exception as e:
    logger.error(f"💥 모델 로딩 중 치명적인 오류가 발생했습니다: {e}")
    raise RuntimeError("TTS 모델을 로드할 수 없어 서버를 시작할 수 없습니다.") from e

class TTSRequest(BaseModel):
    text: str

@app.post("/generate-speech")
async def generate_speech(request: TTSRequest):
    try:
        logger.info(f"음성 생성 요청 수신: '{request.text}'")

        # MeloTTS는 파일로만 저장하는 기능을 제공하므로,
        # 메모리 내 버퍼에 쓰기 위해 내부 함수를 직접 호출합니다.
        # 1. 음성 데이터(Tensor)와 샘플링 레이트를 생성합니다.
        audio_tensor, sample_rate = model.synthesizer.synthesize(
            request.text,
            speaker_ids['KO'],
            speed=1.0  # 음성 속도 조절
        )

        # 2. 생성된 텐서를 NumPy 배열로 변환합니다.
        audio_array = audio_tensor.cpu().numpy().squeeze()
        
        # 3. NumPy 배열을 WAV 형식의 바이트 데이터로 변환합니다.
        buffer = io.BytesIO()
        sf.write(buffer, audio_array, sample_rate, format='WAV', subtype='PCM_16')
        audio_bytes = buffer.getvalue()
        
        logger.info("✅ 음성 생성이 완료되었습니다.")
        
        return Response(content=audio_bytes, media_type="audio/wav")

    except Exception as e:
        logger.error(f"⚠️ 음성 생성 중 오류 발생: {e}", exc_info=True)
        return Response(content=f"Error during speech generation: {e}", status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
