import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    const currentInputText = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // 1. Gemini 서버에 직접 텍스트 생성을 요청
      const geminiRes = await axios.post('/api/gemini/generate-text', {
        prompt: currentInputText,
      });
      const aiText = geminiRes.data.text;
      const aiMessage = { sender: 'ai', text: aiText };
      setMessages((prev) => [...prev, aiMessage]);

      // 2. MeloTTS 서버에 직접 음성 생성을 요청
      const ttsRes = await axios.post(
        '/api/tts/convert/tts',
        {
          text: aiText,
          language: 'KR',
          speaker_id: 'KR',
        },
        { responseType: 'blob' }
      );
      
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
