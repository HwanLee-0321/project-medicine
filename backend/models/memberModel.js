// models/memberModel.js
const sequelize = require('../db/sequelize');
const User = require('../db/Users');

/**
 * 탈퇴하지 않은 유저만 조회
 * - WHERE user_id = :user_id AND delyn = 'N'
 */
async function getUserById(user_id) {
  return User.findOne({
    where: {
      user_id,
      delyn: 'N',
    },
  });
}

/**
 * 회원 생성
 * - memberController.js/signup 에서 호출
 */
async function createUser(userData) {
  return User.create(userData);
}

/**
 * 회원 탈퇴 (논리 삭제)
 * - delyn = 'Y' 로 업데이트
 * - 트랜잭션 사용
 */
async function removeMember(user_id) {
  const t = await sequelize.transaction();
  try {
    const [affected] = await User.update(
      { delyn: 'Y' },
      { where: { user_id }, transaction: t }
    );

    if (affected === 0) {
      await t.rollback();
      return 0; // 존재하지 않거나 이미 탈퇴
    }

    await t.commit();
    return affected;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * 첫 로그인 처리
 * - 아직 first_login = 0 인 경우에만 1로 업데이트
 * - delyn = 'N' 인 사용자만
 */
async function updateUserFirstLogin(user_id) {
  const [affected] = await User.update(
    { first_login: 1 },
    {
      where: {
        user_id,
        first_login: 0,
        delyn: 'N',
      },
    }
  );
  return affected;
}

/**
 * 역할 저장/수정 (is_elderly)
 * - WHERE user_id = :user_id AND delyn = 'N'
 * - 반환: 업데이트된 row 수 (0 or 1)
 */
async function updateUserRole(user_id, isElderlyBool) {
  const [affected] = await User.update(
    { is_elderly: isElderlyBool ? 1 : 0 },
    {
      where: {
        user_id,
        delyn: 'N',
      },
    }
  );
  return affected;
}

module.exports = {
  getUserById,
  createUser,
  removeMember,
  updateUserFirstLogin,
  updateUserRole,
};
