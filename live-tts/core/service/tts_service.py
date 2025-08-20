import io
import torch
import soundfile as sf
from dia.model import Dia

# Dia 모델 초기화 (GPU 우선 사용)
try:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dia_model = Dia.from_pretrained("nari-labs/Dia-1.6B", device=device)
except Exception as e:
    print(f"Dia 모델 초기화 실패: {e}")
    dia_model = None

def generate_dia_tts_audio(text: str) -> io.BytesIO:
    """
    Dia TTS 모델을 사용하여 텍스트로부터 음성 오디오를 생성합니다.
    """
    if not dia_model:
        raise ConnectionError("Dia 모델이 올바르게 초기화되지 않았습니다.")

    # [S1] 태그를 추가하여 화자 지정
    script = f"[S1] {text}"
    
    # 음성 데이터 생성 (Numpy 배열)
    audio_array = dia_model.generate(script, seed=42)

    # 메모리 내 오디오 버퍼 생성 및 데이터 쓰기
    buffer = io.BytesIO()
    sf.write(buffer, audio_array, 44100, format="WAV")
    buffer.seek(0)  # 버퍼의 커서를 처음으로 이동

    return buffer