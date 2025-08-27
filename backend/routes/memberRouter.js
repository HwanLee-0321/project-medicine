const express = require('express');
const router = express.Router();
const { signup, login, remove, checkUserId, logout, name } = require('../controllers/memberController');

// 회원 정보를 저장하는 POST API
router.post('/signup', signup);  // 회원가입
router.post('/login', login);  // 로그인
router.post('/delete', remove);  // 탈퇴

router.get('/check-id', checkUserId);
router.post('/logout', logout);

// GET 요청은 params로 user_id 받기
router.get('/name/:user_id', name);

module.exports = router;
