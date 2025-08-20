import os
import google.generativeai as genai

# Gemini API 키 설정 및 모델 초기화
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    gemini_model = genai.GenerativeModel('gemini-1.5-flash-lite')
except Exception as e:
    print(f"Gemini 모델 초기화 실패: {e}")
    gemini_model = None

def generate_gemini_response(message: str, history: list) -> str:
    """
    Gemini 모델을 사용하여 대화 응답을 생성합니다.
    """
    if not gemini_model:
        raise ConnectionError("Gemini 모델이 올바르게 초기화되지 않았습니다.")

    chat_session = gemini_model.start_chat(history=history)
    response = chat_session.send_message(message)
    return response.text