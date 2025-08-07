const { getUserById, createUser, removeMember, updateUserFirstLoginAt } = require('../models/memberModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 회원가입
const signup = async (req, res) => {
  const { user_id, user_pw, elder_nm, guard_mail, elder_birth, birth_type, sex, is_elderly } = req.body;

  // 필수 항목 체크
  if (
    user_id === undefined || user_pw === undefined || elder_nm === undefined ||
    guard_mail === undefined || elder_birth === undefined ||
    birth_type === undefined || sex === undefined || is_elderly === undefined
  ) {
    return res.status(400).json({ message: '모든 항목을 입력하세요' });
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
      birth_type,
      sex,
      is_elderly,
      delyn: 'N',
      first_login: 0 // 첫 로그인 아님을 명시적으로 설정
    });

    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 로그인
const login = async (req, res) => {
  const { user_id, user_pw } = req.body;

  if (!user_id || !user_pw) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력하세요' });
  }

  try {
    const user = await getUserById(user_id);
    if (!user || user.delyn === 'Y') {
      return res.status(401).json({ message: '존재하지 않거나 탈퇴한 사용자입니다' });
    }

    const isValid = await bcrypt.compare(user_pw, user.user_pw);
    if (!isValid) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다' });
    }

    // 첫 로그인 처리
    if (!user.first_login || user.first_login === 0) {
      await updateUserFirstLoginAt(user_id);  // 모델에서 first_login = 1로 업데이트
    }

    const token = jwt.sign(
      { user_id: user.user_id, elder_nm: user.elder_nm },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: '로그인 성공', token });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 회원 탈퇴 (논리 삭제)
const remove = async (req, res) => {
  const { user_id } = req.body;

  try {
    const result = await removeMember(user_id);

    if (result > 0) {
      res.json({ success: true, message: '탈퇴 완료' });
    } else {
      res.status(404).json({ success: false, message: '존재하지 않거나 이미 탈퇴한 회원입니다' });
    }
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

module.exports = { signup, login, remove };
