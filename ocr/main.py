import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, StreamingResponse
import google.generativeai as genai
from dotenv import load_dotenv

from core.ocr_service import extract_text_from_image

# .env 파일로부터 환경 변수 로드
load_dotenv()

app = FastAPI()

# Gemini API 키 설정
api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_GOOGLE_API_KEY":
    print("경고: GEMINI_API_KEY 환경 변수가 .env 파일에 설정되지 않았습니다.")
else:
    genai.configure(api_key=api_key)


# 정적 파일(HTML, JS)을 제공하기 위해 'static' 디렉토리 마운트
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """
    루트 URL 접속 시 index.html 파일을 반환합니다.
    """
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="index.html not found")


@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    """
    이미지 파일을 업로드받아 OCR을 수행하고 결과를 스트리밍 형태로 반환합니다.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    image_bytes = await file.read()
    return StreamingResponse(extract_text_from_image(image_bytes), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn
    # Uvicorn 서버 실행. host="0.0.0.0"은 모든 네트워크 인터페이스에서 접속을 허용합니다.
    # reload=True는 코드 변경 시 서버를 자동으로 재시작해주는 개발 편의 기능입니다.
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)