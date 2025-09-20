# live-tts/core/gemini_server.py
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv # --- 추가된 부분 ---

# --- 추가된 부분 ---
# .env 파일로부터 환경 변수를 로드합니다.
load_dotenv()

# 이제 os.getenv를 통해 .env 파일에 설정된 값을 읽어올 수 있습니다.
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.")
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

class ChatRequest(BaseModel):
    prompt: str

@app.post("/generate-text")
async def generate_text(request: ChatRequest):
    try:
        response = model.generate_content(request.prompt)
        return {"text": response.text}
    except Exception as e:
        print(f"Gemini API 오류 발생: {e}")
        return {"text": "죄송합니다, AI 모델 응답 생성에 실패했습니다."}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
