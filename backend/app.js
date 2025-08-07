require('dotenv').config();
const express = require('express');
const memberRouter = require('./routes/memberRouter');
const session = require('express-session')
const medicationRoutes = require('./routes/medicationRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
app.use(express.json());

// session
app.use(session({
  secret : 'mySecretKey',  // 세션 암호화에 사용되는 키 (HMAC-SHA1 알고리즘 사용 암호화)
  resave : false,  // 요청이 들어올 때마다 세션을 매번 저장하는 게 아니라 변경사항이 있을 경우에만 저장
  saveUninitialized : false,  // 초기화되지 않은(값이 없는) 세션은 저장하지 않음
  cookie : {
    maxAge : 1000 * 60 * 10  // 10분 (ms)  // 브라우저를 끄지 않으면(연결을 해제하지 않으면) 10분까지만 유지
  }
}));

app.use('/api/users', memberRouter);

// JSON 파싱 미들웨어
app.use(express.json());

// 라우터 등록
app.use('/api/medication', medicationRoutes);

app.use('/api/alerts', healthRoutes)

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});