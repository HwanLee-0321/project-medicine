// controllers/memberController.js
const {
  getUserById,
  createUser,
  removeMember,
  updateUserFirstLogin,
  getElderNm
} = require('../models/memberModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * 회원가입
 */
const signup = async (req, res) => {
  const {
    user_id,
    user_pw,
    elder_nm,
    guard_mail,
    elder_birth,
    birth_type,
    sex,
  } = req.body;

  if (
    user_id === undefined ||
    user_pw === undefined ||
    elder_nm === undefined ||
    guard_mail === undefined ||
    elder_birth === undefined ||
    birth_type === undefined ||
    sex === undefined
  ) {
    return res.status(400).json({ message: '모든 항목을 입력하세요' });
  }

  // 🔐 비밀번호 정책 검증 (최소 8자, 영문, 숫자, 특수문자 포함)
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/;
  if (!passwordRegex.test(user_pw)) {
    return res.status(400).json({ message: '비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 모두 포함해야 합니다.' });
  }

  try {
    const existing = await getUserById(user_id);
    if (existing) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다' });
    }

    const hashedPassword = await bcrypt.hash(user_pw, 10);

    await createUser({
      user_id,
      user_pw: hashedPassword,
      elder_nm,
      guard_mail,
      elder_birth,
      birth_type: Boolean(birth_type),
      sex: Boolean(sex),
      delyn: 'N',
      first_login: 0,
    });

    return res.status(201).json({ message: '회원가입 성공', user_id });
  } catch (err) {
    console.error('signup error:', err);
    return res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

/**
 * 로그인
 */
const login = async (req, res) => {
  const { user_id, user_pw } = req.body;

  if (!user_id || !user_pw) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력하세요' });
  }

  try {
    const user = await getUserById(user_id);
    if (!user || user.delyn === 'Y') {
      return res
        .status(401)
        .json({ message: '존재하지 않거나 탈퇴한 사용자입니다' });
    }

    const isValid = await bcrypt.compare(user_pw, user.user_pw);
    if (!isValid) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다' });
    }

    if (!user.first_login || user.first_login === 0) {
      await updateUserFirstLogin(user_id);
    }

    const token = jwt.sign(
      { user_id: user.user_id, elder_nm: user.elder_nm },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } 
    );

    return res.json({
      message: '로그인 성공',
      token,
      user_id: user.user_id,
      elder_nm: user.elder_nm,
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: '서버 오류' });
  }
};

/**
 * 회원 탈퇴 (논리 삭제)
 */
const remove = async (req, res) => {
  const { user_id } = req.user; // 🔐 JWT에서 사용자 ID 추출

  try {
    const affected = await removeMember(user_id);
    if (affected > 0) {
      return res.json({ success: true, message: '탈퇴 완료' });
    }
    return res
      .status(404)
      .json({ success: false, message: '존재하지 않거나 이미 탈퇴한 회원입니다' });
  } catch (err) {
    console.error('remove error:', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
};

/**
 * 아이디 중복 확인
 */
const checkUserId = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: '아이디를 입력하세요' });
  }

  try {
    const existing = await getUserById(user_id);
    if (existing) {
      return res.json({
        available: false,
        message: '이미 존재하는 아이디입니다',
      });
    }
    return res.json({ available: true, message: '사용 가능한 아이디입니다' });
  } catch (err) {
    console.error('checkUserId error:', err);
    return res.status(500).json({ message: '서버 오류' });
  }
};

/**
 * 로그아웃 (서버 상태 없음)
 */
const logout = (req, res) => {
  // 클라이언트에서 토큰을 삭제하는 것이 핵심
  return res.json({
    message: '로그아웃 되었습니다. 클라이언트에서 토큰을 삭제하세요.',
  });
};

// 🔐 현재 로그인된 사용자의 이름 조회
const name = async (req, res) => {
  const { user_id } = req.user;  // 🔐 JWT에서 사용자 ID 추출

  try {
    const elder_nm = await getElderNm(String(user_id));
    if (!elder_nm) {
      return res.status(404).json({ message: '존재하지 않는 사용자이거나 탈퇴한 회원입니다.' });
    }
    return res.json({ name: elder_nm });
  } catch (err) {
    console.error('getName error:', err);
    return res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

module.exports = { signup, login, remove, checkUserId, logout, name };
