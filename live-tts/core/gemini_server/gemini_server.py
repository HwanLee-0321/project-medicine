# live-tts/core/gemini_server.py
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os

# 주의: 실제 실행 시에는 API 키를 환경 변수 등 안전한 곳에 보관하세요.
genai.configure(api_key="GEMINI_API_KEY") # 본인의 API 키로 교체
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

class ChatRequest(BaseModel):
    prompt: str

@app.post("/generate-text")
async def generate_text(request: ChatRequest):
    response = model.generate_content(request.prompt)
    return {"text": response.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)