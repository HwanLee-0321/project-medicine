require('dotenv').config(); 
const express = require('express');
const cors = require('cors');  // 다른 도메인(출처)에서 오는 HTTP 요청을 허용

const memberRouter = require('./routes/memberRouter');
const medicationRoutes = require('./routes/medicationRouter');
const healthRoutes = require('./routes/healthRouter');

const app = express();

app.use(cors());  // 모든 출처에서 오는 요청을 허용 (클라이언트에서 자유롭게 API를 호출 가능)
app.use(express.json());  // 클라이언트 요청 json으로 자동 파싱 미들웨어

// 라우터 등록
app.use('/api/users', memberRouter);
app.use('/api/medication', medicationRoutes);
app.use('/api/health', healthRoutes)

// 서버 실행
app.listen(3050, () => {
  console.log(`Server running on port 3050`);
});
