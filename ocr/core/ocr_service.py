import os
import google.generativeai as genai
from PIL import Image
import io

def extract_text_from_image(image_bytes: bytes):
    """
    이미지 바이트에서 텍스트를 추출하여 마크다운 형식으로 스트리밍합니다.
    Gemini 2.5 Flash Lite 모델을 사용합니다.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        model = genai.GenerativeModel('models/gemini-2.5-flash-lite')
        
        # 명확하게 마크다운 형식으로 요청하고, 불필요한 설명을 제외하도록 프롬프트를 수정했습니다.
        prompt = [
            "이미지에서 모든 텍스트를 추출하고, 원본 문서의 구조(표, 목록 등)를 최대한 반영하여 마크다운 형식으로 정리해줘.",
            "마크다운 형식의 텍스트 외에 다른 설명이나 응답은 절대 추가하지 마.",
            img
        ]
        
        # stream=True를 사용하여 응답을 스트리밍합니다.
        response = model.generate_content(prompt, stream=True)
        
        # 각 텍스트 조각을 동기적으로 반환합니다.
        for chunk in response:
            yield chunk.text

    except Exception as e:
        yield f"이미지 처리 중 오류가 발생했습니다: {e}"