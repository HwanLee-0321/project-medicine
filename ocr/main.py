# main.py
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from core.ocr_service import extract_text_from_image  # OCR 처리 함수

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

# === CORS 설정 ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 모든 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],   # 모든 HTTP 메소드 허용
    allow_headers=["*"],   # 모든 헤더 허용
)

# === Static files 연결 ===
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# === 루트 index.html ===
@app.get("/", response_class=HTMLResponse)
async def read_root():
    try:
        file_path = os.path.join(BASE_DIR, "static", "index.html")
        with open(file_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="index.html not found")

# === OCR 업로드 처리 ===
async def handle_upload(file: UploadFile):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    image_bytes = await file.read()
    try:
        json_generator = extract_text_from_image(image_bytes)
        json_string = next(json_generator)
        return Response(content=json_string, media_type="application/json")
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# === 두 가지 경로 모두 대응 ===
@app.post("/upload-image/")
async def upload_image_slash(file: UploadFile = File(...)):
    return await handle_upload(file)

@app.post("/upload-image")
async def upload_image_no_slash(file: UploadFile = File(...)):
    return await handle_upload(file)

# === 실행 ===
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
