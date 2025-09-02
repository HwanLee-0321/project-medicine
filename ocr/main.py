# main.py
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
from core.ocr_service import extract_text_from_image  # OCR 처리 함수

# .env 파일로부터 환경 변수 로드
load_dotenv()

# __file__은 현재 실행 중인 스크립트의 경로를 나타냅니다.
# os.path.abspath()는 상대 경로를 절대 경로로 변환합니다.
# os.path.dirname()은 파일의 디렉토리 경로를 반환합니다.
# 결과적으로 BASE_DIR은 프로젝트의 루트 디렉토리를 가리키게 되어,
# 파일 경로를 안정적으로 관리할 수 있습니다.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

# === Gemini API 키 설정 ===
# .env 파일에 저장된 GEMINI_API_KEY를 가져옵니다.
api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_GOOGLE_API_KEY":
    # API 키가 설정되지 않았을 경우 경고 메시지를 출력합니다.
    print("경고: GEMINI_API_KEY 환경 변수가 .env 파일에 설정되지 않았습니다.")
else:
    # genai 라이브러리에 API 키를 설정합니다.
    genai.configure(api_key=api_key)

# === CORS (Cross-Origin Resource Sharing) 설정 ===
# 웹 브라우저에서 다른 출처(도메인, 프로토콜, 포트)의 리소스에 접근할 수 있도록 허용하는 정책입니다.
# 프론트엔드와 백엔드가 다른 서버에서 실행될 때 필요합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인에서의 요청을 허용합니다. (프로덕션에서는 특정 도메인만 지정하는 것이 안전합니다.)
    allow_credentials=True, # 인증 정보(쿠키 등)를 포함한 요청을 허용합니다.
    allow_methods=["*"],  # 모든 HTTP 메소드(GET, POST, PUT, DELETE 등)를 허용합니다.
    allow_headers=["*"],  # 모든 HTTP 헤더를 허용합니다.
)

# === 정적 파일(Static files) 연결 ===
# HTML, CSS, JavaScript, 이미지 등 정적인 파일들을 제공하기 위한 설정입니다.
# "/static" 경로로 들어오는 요청은 "static" 디렉토리의 파일을 찾아 반환합니다.
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# === 루트 URL('/') 접속 시 index.html 반환 ===
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """
    웹 애플리케이션의 메인 페이지를 반환합니다.
    """
    try:
        # 안정적인 파일 경로를 위해 os.path.join을 사용합니다.
        file_path = os.path.join(BASE_DIR, "static", "index.html")
        with open(file_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        # index.html 파일을 찾을 수 없을 때 404 에러를 발생시킵니다.
        raise HTTPException(status_code=404, detail="index.html not found")

# === OCR 업로드 처리 로직 ===
async def handle_upload(file: UploadFile):
    """
    업로드된 이미지 파일을 받아 OCR 처리를 수행하고 결과를 JSON으로 반환하는 공통 함수
    """
    # 업로드된 파일이 이미지인지 확인합니다.
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="잘못된 파일 형식입니다. 이미지를 업로드해주세요.")
    
    # 파일을 바이트 형태로 읽어옵니다.
    image_bytes = await file.read()
    
    try:
        # OCR 서비스 함수를 호출하여 텍스트 추출을 시도합니다.
        # 이 함수는 제너레이터(generator)이며, JSON 문자열을 yield합니다.
        json_generator = extract_text_from_image(image_bytes)
        
        # 제너레이터에서 첫 번째 결과(JSON 문자열)를 가져옵니다.
        json_string = next(json_generator)
        
        # 추출된 JSON 문자열을 HTTP 응답으로 반환합니다.
        return Response(content=json_string, media_type="application/json")
    except Exception as e:
        # OCR 처리 중 에러가 발생하면 500 서버 에러를 반환합니다.
        return JSONResponse({"error": str(e)}, status_code=500)

# === 두 가지 업로드 경로 모두 대응 ===
# 사용자가 주소 끝에 '/'를 붙이거나 붙이지 않아도 동일하게 동작하도록 두 개의 경로를 만듭니다.
@app.post("/upload-image/")
async def upload_image_slash(file: UploadFile = File(...)):
    return await handle_upload(file)

@app.post("/upload-image")
async def upload_image_no_slash(file: UploadFile = File(...)):
    return await handle_upload(file)

# === 서버 실행 ===
# 이 스크립트 파일이 직접 실행될 때 (예: python main.py) uvicorn 서버를 구동합니다.
if __name__ == "__main__":
    import uvicorn
    # host="0.0.0.0"은 외부 네트워크에서도 접속을 허용합니다.
    # reload=True는 코드 변경 시 서버를 자동으로 재시작하는 개발 편의 기능입니다.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
