# live-tts/core/service/tts_service.py

from transformers import AutoProcessor, DiaForConditionalGeneration
import torch
import scipy.io.wavfile
import io

class TTSService:
    def __init__(self):
        """
        TTSService 초기화 메서드.
        Dia TTS 모델과 프로세서를 로드하고 장치를 설정합니다.
        """
        self.torch_device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_checkpoint = "nari-labs/Dia-1.6B-0626"

        print(f"Dia 모델을 로드합니다. ({self.model_checkpoint})")
        self.processor = AutoProcessor.from_pretrained(self.model_checkpoint)
        self.model = DiaForConditionalGeneration.from_pretrained(self.model_checkpoint).to(self.torch_device)
        print("Dia 모델 로드 완료.")

    def generate_speech(self, text: str) -> bytes:
        """
        주어진 텍스트로부터 음성을 생성하고 wav 형식의 바이트 스트림을 반환합니다.

        Args:
            text (str): 음성으로 변환할 텍스트. [S1], [S2] 태그를 포함해야 합니다.

        Returns:
            bytes: 생성된 wav 형식의 오디오 데이터
        """
        try:
            # Dia 모델 입력 형식에 맞게 텍스트를 리스트에 담습니다.
            inputs = self.processor(text=[text], padding=True, return_tensors="pt").to(self.torch_device)

            # 음성 생성
            # generation-guidelinese에 따라 temperature: 1.8, top_p: 0.90, top_k: 45 로 설정
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=3072,
                guidance_scale=3.0,
                temperature=1.8,
                top_p=0.90,
                top_k=45
            )

            # 생성된 오디오 디코딩
            decoded_outputs = self.processor.batch_decode(outputs)
            
            # 오디오 데이터를 wav 형식으로 변환
            # processor.save_audio 대신 메모리에서 직접 처리합니다.
            audio_array = decoded_outputs[0].audio[0]
            sample_rate = decoded_outputs[0].sampling_rate
            
            buffer = io.BytesIO()
            scipy.io.wavfile.write(buffer, rate=sample_rate, data=audio_array)
            
            return buffer.getvalue()

        except Exception as e:
            print(f"음성 생성 중 오류 발생: {e}")
            return b""


# TTSService 인스턴스 생성 (싱글톤 패턴처럼 사용)
tts_service = TTSService()

def get_tts_service():
    return tts_service