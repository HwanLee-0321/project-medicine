import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // 메시지 목록이 업데이트될 때마다 맨 아래로 스크롤
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 1. Gemini에 텍스트 응답 요청
      const chatRes = await axios.post('/api/chat', { message: inputText });
      const aiText = chatRes.data.reply;
      const aiMessage = { sender: 'ai', text: aiText };
      setMessages((prev) => [...prev, aiMessage]);

      // 2. Dia에 TTS 음성 요청
      const ttsRes = await axios.post('/api/tts', { text: aiText }, { responseType: 'blob' });
      const audioUrl = URL.createObjectURL(ttsRes.data);
      
      // 3. 음성 자동 재생
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }

    } catch (error) {
      console.error('오류가 발생했습니다:', error);
      const errorMessage = { sender: 'ai', text: '죄송해요, 처리 중 오류가 발생했어요.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && <div className="message ai"><p>생각 중...</p></div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-area">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          전송
        </button>
      </form>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;