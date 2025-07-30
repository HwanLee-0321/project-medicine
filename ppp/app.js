const express = require('express');
const bodyParser = require('body-parser');
const medicationRoutes = require('./routes/medicationRoutes');
const medRoutes = require('./routes/medRoutes');

const app = express();
app.use(express.json());
// JSON 파싱 미들웨어
app.use(bodyParser.json());

// 라우터 등록
app.use('/api/medication', medicationRoutes);
app.use('/api', medRoutes);
app.use('/medication', medRoutes);

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행: http://localhost:${PORT}`);
});
