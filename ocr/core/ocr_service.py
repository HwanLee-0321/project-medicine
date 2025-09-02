import json
import re
from datetime import datetime
from zoneinfo import ZoneInfo
import os
import google.generativeai as genai
from PIL import Image
import io

def clean_json_string(json_string: str) -> str:
    """
    Markdowm 코드 블록으로 감싸진 JSON 문자열을 정리합니다.
    """
    # 정규 표현식을 사용하여 ```json ... ``` 또는 ``` ... ``` 패턴을 찾습니다.
    match = re.search(r"```(json)?(.*)```", json_string, re.DOTALL)
    if match:
        # 패턴이 발견되면, JSON 내용만 추출하고 양쪽 공백을 제거합니다.
        cleaned_string = match.group(2).strip()
    else:
        # 패턴이 없으면, 원본 문자열의 양쪽 공백만 제거합니다.
        cleaned_string = json_string.strip()
    return cleaned_string

def extract_text_from_image(image_bytes: bytes):
    """
    처방전 이미지에서 약 정보를 추출하여 JSON 형식으로 반환합니다.
    Gemini 2.5 Flash Lite 모델을 사용하며, 결과를 스트리밍합니다.
    """
    try:
        # 바이트 데이터를 이미지로 엽니다.
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        # 이미지 파일이 유효하지 않을 경우 에러를 처리합니다.
        print(f"이미지를 여는 중 오류 발생: {e}")
        yield json.dumps({"error": "유효하지 않은 이미지 파일입니다."})
        return

    # Google Generative AI 모델을 초기화합니다.
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    
    # 모델에 전달할 프롬프트를 정의합니다.
    prompt = """
    이 이미지는 약 처방전입니다. 다음 정보를 추출하여 JSON 형식으로 반환해주세요.
    - 각 약에 대한 정보를 객체로 만들어 배열에 담아주세요.
    - 각 약 객체는 다음 키를 포함해야 합니다:
        - "MED_NM": 약의 이름 (문자열)
        - "DOSAGE": 1회 투여량 (숫자, 예: 1정 -> 1, 1.00 -> 1, 0.50 -> 0.5)
        - "TIMES_PER_DAY": 하루 복약 횟수 (숫자)
        - "DURATION_DAYS": 총 복약 일수 (숫자)
    - 최상위 객체에는 "medicines"라는 키로 약 정보 배열을 포함해주세요.
    - 만약 정보를 추출할 수 없다면, 빈 배열을 반환해주세요.

    예시 JSON 형식:
    {
        "medicines": [
            {
                "MED_NM": "알마겔",
                "DOSAGE": 1,
                "TIMES_PER_DAY": 3,
                "DURATION_DAYS": 3
            }
        ]
    }
    """

    try:
        # 모델에 프롬프트와 이미지를 전달하고, 응답을 스트림으로 받습니다.
        response = model.generate_content([prompt, img], stream=True)
        full_response_text = ""

        # 스트리밍된 각 응답 조각을 하나로 합칩니다.
        for chunk in response:
            print("수신된 응답 조각:", chunk.text)
            full_response_text += chunk.text

        # Markdown 형식의 응답을 정리하여 순수 JSON 문자열만 추출합니다.
        cleaned_response = clean_json_string(full_response_text)
        
        try:
            # 정리된 문자열을 JSON 객체로 파싱합니다.
            json_data = json.loads(cleaned_response)
            
            # 서울 시간대를 기준으로 현재 시간을 기록합니다.
            seoul_tz = ZoneInfo("Asia/Seoul")
            now_seoul = datetime.now(seoul_tz)
            json_data["CREATED_AT"] = now_seoul.strftime("%Y-%m-%d %H:%M:%S")

            # "medicines" 키가 없는 경우, 빈 배열로 초기화합니다.
            if "medicines" not in json_data:
                json_data["medicines"] = []

            # 최종 JSON 데이터를 반환합니다. (ensure_ascii=False로 한글 인코딩 유지)
            yield json.dumps(json_data, ensure_ascii=False)
            
        except json.JSONDecodeError:
            # JSON 파싱에 실패할 경우 에러를 처리합니다.
            print("JSON 파싱 오류. 원본 응답:", cleaned_response)
            yield json.dumps({
                "error": "OCR 결과를 JSON으로 파싱하는 데 실패했습니다.",
                "raw_text": cleaned_response
            })
            
    except Exception as e:
        # Gemini API 호출 중 에러가 발생할 경우 처리합니다.
        print(f"Gemini API 호출 중 오류 발생: {e}")
        yield json.dumps({"error": f"OCR 처리 중 오류가 발생했습니다: {e}"})