const { getUserById, createUser, removeMember } = require('../models/memberModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { id, pw, name, phone } = req.body;

  if (!id || !pw || !name || !phone) {
    return res.status(400).json({ message: '모든 항목을 입력하세요' });
  }

  try {
    const existing = await getUserById(id);
    if (existing) return res.status(409).json({ message: '이미 존재하는 아이디입니다' });

    const hashedPassword = await bcrypt.hash(pw, 10);
    await createUser({ id, pw: hashedPassword, name, phone });

    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

const login = async (req, res) => {
  const { id, pw } = req.body;
  if (!id || !pw) return res.status(400).json({ message: '아이디와 비밀번호 입력' });

  try {
    const user = await getUserById(id);
    if (!user) return res.status(401).json({ message: '사용자 없음' });

    const isValid = await bcrypt.compare(pw, user.pw);
    if (!isValid) return res.status(401).json({ message: '비밀번호 틀림' });

    const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: '로그인 성공', token });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
};

const remove = async (req, res) => {
  const {id} = req.body;

  try {
    const result = await removeMember(id);

    if (result > 0) {
      res.json({ success: true, message: '탈퇴 완료' });
    }else{
      res.json({ success: false, message: '탈퇴 실패' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

module.exports = { signup, login, remove };
