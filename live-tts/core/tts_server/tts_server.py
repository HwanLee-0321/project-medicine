# live-tts/core/tts_server.py
# Python 3.11, FastAPI, Transformers, PyTorch, Scipy

from fastapi import FastAPI, Response
from pydantic import BaseModel
from transformers import AutoProcessor, DiaForConditionalGeneration
import torch
import scipy.io.wavfile
import io
import logging

# --- 로깅 설정 ---
# 서버 로그를 더 명확하게 보기 위해 로깅을 설정합니다.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- FastAPI 애플리케이션 초기화 ---
app = FastAPI()


# --- 모델 및 프로세서 로딩 ---
# 모범 사례: 모델과 같이 무거운 객체는 서버 시작 시 한 번만 로드하여
# 전역 변수로 관리하는 것이 효율적입니다.
# 이렇게 하면 API 요청이 있을 때마다 모델을 새로 로드하는 비효율을 막을 수 있습니다.
try:
    TORCH_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    MODEL_CHECKPOINT = "nari-labs/Dia-1.6B-0626"

    logger.info(f"'{MODEL_CHECKPOINT}' 모델을 로딩합니다. 사용하는 장치: {TORCH_DEVICE}")
    
    # Hugging Face Hub에서 모델과 프로세서를 다운로드하고 메모리에 로드합니다.
    PROCESSOR = AutoProcessor.from_pretrained(MODEL_CHECKPOINT)
    MODEL = DiaForConditionalGeneration.from_pretrained(MODEL_CHECKPOINT).to(TORCH_DEVICE)
    
    logger.info("✅ Dia TTS 모델 로딩이 완료되었습니다.")

except Exception as e:
    logger.error(f"💥 모델 로딩 중 치명적인 오류가 발생했습니다: {e}")
    # 모델 로딩에 실패하면 서버가 시작되지 않도록 예외를 발생시킵니다.
    raise RuntimeError("TTS 모델을 로드할 수 없어 서버를 시작할 수 없습니다.") from e


# --- API 요청 본문 모델 정의 ---
# Pydantic을 사용하여 요청 본문의 데이터 타입을 명확히 정의하고 유효성을 검사합니다.
class TTSRequest(BaseModel):
    text: str


# --- API 엔드포인트 정의 ---
@app.post("/generate-speech")
async def generate_speech(request: TTSRequest):
    """
    입력된 텍스트를 받아 Dia TTS 모델을 사용하여 음성(wav) 데이터를 생성합니다.
    """
    try:
        # Dia 모델의 입력 형식에 맞게 텍스트 앞에 화자 태그([S1])를 추가합니다.
        formatted_text = f"[S1] {request.text}"
        logger.info(f"음성 생성 요청 수신: '{formatted_text}'")

        # 1. 텍스트를 모델이 이해할 수 있는 토큰으로 변환 (인코딩)
        inputs = PROCESSOR(text=[formatted_text], padding=True, return_tensors="pt").to(TORCH_DEVICE)

        # 2. 모델을 통해 음성 데이터 생성
        # generation-guidelines에 따라 최적의 파라미터로 설정
        outputs = MODEL.generate(
            **inputs,
            max_new_tokens=3072,
            guidance_scale=3.0,
            temperature=1.8,
            top_p=0.90,
            top_k=45
        )

        # 3. 생성된 데이터를 오디오 배열로 변환 (디코딩)
        decoded_outputs = PROCESSOR.batch_decode(outputs)
        
        # 디코딩된 결과에서 실제 오디오 데이터와 샘플링 레이트를 추출합니다.
        audio_array = decoded_outputs[0].audio[0]
        sample_rate = decoded_outputs[0].sampling_rate
        
        # 4. 오디오 배열을 WAV 파일 형식의 바이트 데이터로 변환
        # 파일을 디스크에 저장하지 않고, 메모리상의 버퍼를 사용하여 직접 변환합니다.
        # 이는 API 응답으로 오디오를 바로 전송할 때 매우 효율적인 방법입니다.
        buffer = io.BytesIO()
        scipy.io.wavfile.write(buffer, rate=sample_rate, data=audio_array)
        audio_bytes = buffer.getvalue()
        
        logger.info("✅ 음성 생성이 완료되었습니다.")
        
        # 생성된 WAV 데이터를 HTTP 응답으로 반환합니다.
        return Response(content=audio_bytes, media_type="audio/wav")

    except Exception as e:
        logger.error(f"⚠️ 음성 생성 중 오류 발생: {e}")
        # 오류 발생 시 클라이언트에게 500 서버 내부 오류를 응답합니다.
        return Response(content=f"Error during speech generation: {e}", status_code=500)


# --- 서버 실행 ---
# 이 스크립트가 직접 실행될 때 Uvicorn 웹 서버를 시작합니다.
if __name__ == "__main__":
    import uvicorn
    # 127.0.0.1 (localhost)의 8002번 포트에서 서버를 실행합니다.
    uvicorn.run(app, host="127.0.0.1", port=8002)
