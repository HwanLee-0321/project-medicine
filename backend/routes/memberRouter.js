const express = require('express');
const router = express.Router();
const { signup, login, remove, checkUserId, logout, name } = require('../controllers/memberController');
const { protect } = require('../authMiddleware');

// Public routes
router.post('/signup', signup);  // 회원가입
router.post('/login', login);  // 로그인
router.get('/check-id', checkUserId); // 아이디 중복 확인

// Protected routes
router.post('/delete', protect, remove);  // 탈퇴
router.post('/logout', protect, logout); // 로그아웃 (토큰 기반)
router.get('/name', protect, name); // 내 이름 조회

module.exports = router;
