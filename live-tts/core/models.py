from pydantic import BaseModel

class ChatRequest(BaseModel):
    """/api/chat 엔드포인트의 요청 모델"""
    message: str
    history: list = []

class TtsRequest(BaseModel):
    """/api/tts 엔드포인트의 요청 모델"""
    text: str