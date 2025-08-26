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
 * - 필수값 검증
 * - 중복 확인 (delyn='N' 기준)
 * - 비밀번호 해시
 * - 생성 후 응답에 user_id 포함(프론트 저장용)
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
      // 프론트에서 true/false, 0/1 등 다양하게 올 수 있으므로 서버에서 일관 변환
      birth_type: Boolean(birth_type),
      sex: Boolean(sex),
      delyn: 'N',
      first_login: 0, // tinyint(1) 사용 시 숫자로 관리하는 편이 명확
    });

    // 프론트가 user_id를 저장할 수 있도록 함께 내려줌
    return res.status(201).json({ message: '회원가입 성공', user_id });
  } catch (err) {
    console.error('signup error:', err);
    return res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

/**
 * 로그인
 * - 존재/탈퇴 여부
 * - 비밀번호 검증
 * - 첫 로그인 처리
 * - JWT 발급
 * - 응답에 user_id, elder_nm 포함 (프론트 저장/표시용)
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
  const { user_id } = req.body;

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
  return res.json({
    message: '로그아웃 되었습니다. 클라이언트에서 토큰을 삭제하세요.',
  });
};

const name = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id는 필수입니다.' });
  }

  try {
    const elder_nm = await getElderNm(user_id);

    if (!elder_nm) {
      return res.status(404).json('존재하지 않는 사용자이거나 탈퇴한 회원입니다.');
    }

    // 값만 바로 반환
    return res.json(elder_nm);
  } catch (err) {
    console.error('name error:', err);
    return res.status(500).json({ message: '서버 오류', error: err.message });
  }
};


// /**
//  * 역할 저장/수정 (is_elderly)
//  * - 업데이트 결과(affected)로 존재/성공 판정
//  */
// const setUserRole = async (req, res) => {
//   const { user_id, is_elderly } = req.body; // 0/1 또는 true/false

//   if (!user_id || is_elderly === undefined) {
//     return res
//       .status(400)
//       .json({ message: 'user_id와 is_elderly가 필요합니다' });
//   }

//   try {
//     const isElderlyBool = !!Number(is_elderly); // '0'/'1' 방지
//     const affected = await updateUserRole(user_id, isElderlyBool);

//     if (affected > 0) {
//       return res.json({ message: '역할 저장 완료' });
//     }
//     // 조건에 맞는 row 없음(존재X or delyn='Y')
//     return res.status(404).json({ message: '존재하지 않는 사용자입니다' });
//   } catch (err) {
//     console.error('setUserRole error:', err);
//     return res.status(500).json({ message: '서버 오류', error: err.message });
//   }
// };

module.exports = { signup, login, remove, checkUserId, logout, name };
