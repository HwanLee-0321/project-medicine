require('dotenv').config();
const express = require('express');
const cors = require('cors');

const memberRouter = require('./routes/memberRouter'); // 기존 회원 라우터
const medicationRouter = require('./routes/medicationRouter');
const healthRouter = require('./routes/healthRouter');
const calendarRouter = require('./routes/calendarRouter');

const sequelize = require('./sequelize');

const app = express();
app.use(cors());
app.use(express.json());

// 라우터 등록
app.use('/api/users', memberRouter);
app.use('/api/medication', medicationRouter);
app.use('/api/health', healthRouter);
app.use('/api/calendar', calendarRouter);

// DB 연결 확인 후 서버 실행
(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB 연결 성공');
        await sequelize.sync(); // 모델 기준 테이블 생성/동기화
        app.listen(3050, () => console.log('Server running on port 3050'));
    } catch (err) {
        console.error('DB 연결 실패:', err);
    }
})();
