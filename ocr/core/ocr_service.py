import json
import re
from datetime import datetime
from zoneinfo import ZoneInfo
import google.generativeai as genai
from PIL import Image
import io

def clean_json_string(json_string: str) -> str:
    match = re.search(r"```(json)?(.*)```", json_string, re.DOTALL)
    if match:
        cleaned_string = match.group(2).strip()
    else:
        cleaned_string = json_string.strip()
    return cleaned_string

def extract_text_from_image(image_bytes: bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        print(f"Error opening image: {e}")
        yield json.dumps({"error": "Invalid image file"})
        return

    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    prompt = """
    이 이미지는 약 처방전입니다. 다음 정보를 추출하여 JSON 형식으로 반환해주세요.
    - 각 약에 대한 정보를 객체로 만들어 배열에 담아주세요.
    - 각 약 객체는 다음 키를 포함해야 합니다:
      - "MED_NM": 약의 이름 (문자열)
      - "DOSAGE": 1회 투여량 (숫자, 예: 1정 -> 1 혹 1.00 -> 1, 0.50 -> 0.5)
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
        response = model.generate_content([prompt, img], stream=True)
        full_response_text = ""

        for chunk in response:
            # OCR/AI 응답 텍스트 실시간 로그 출력
            print("Received chunk.text:", chunk.text)
            full_response_text += chunk.text

        cleaned_response = clean_json_string(full_response_text)
        try:
            json_data = json.loads(cleaned_response)
            seoul_tz = ZoneInfo("Asia/Seoul")
            now_seoul = datetime.now(seoul_tz)
            json_data["CREATED_AT"] = now_seoul.strftime("%Y-%m-%d %H:%M:%S")

            if "medicines" not in json_data:
                json_data["medicines"] = []

            yield json.dumps(json_data, ensure_ascii=False)
        except json.JSONDecodeError:
            print("JSON 파싱 오류. 원본 응답:", cleaned_response)
            yield json.dumps({
                "error": "Failed to parse OCR result as JSON.",
                "raw_text": cleaned_response
            })
    except Exception as e:
        print(f"Gemini API 호출 중 오류 발생: {e}")
        yield json.dumps({"error": f"An error occurred during OCR processing: {e}"})
