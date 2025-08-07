const sequelize = require('../db/sequelize');
const User = require('../db/Users');
const Medications = require('../db/Medications');
const Medication_schedule = require('../db/Medication_schedule');
const Health_alerts = require('../db/Health_alerts');

// 탈퇴하지 않은 유저만 조회
async function getUserById(user_id) {
  const user = await User.findOne({ 
    where: { 
      user_id, 
      delyn: 'N' 
    } 
  });
  return user;  // Sequelize 모델 그대로 반환
}

// 회원 생성
async function createUser(userData) {
  return await User.create(userData);
}

// 회원 탈퇴 (논리 삭제 방식)
async function removeMember(user_id) {
  const t = await sequelize.transaction();

  try {
    const result = await User.update(
      { delyn: 'Y' },
      { where: { user_id }, transaction: t }
    );

    if (result[0] === 0) {
      console.warn(`탈퇴 실패: user_id ${user_id}가 존재하지 않거나 이미 탈퇴`);
      await t.rollback();
      return 0;
    }

    // 필요한 경우 다른 테이블도 논리 삭제 처리 가능

    await t.commit();
    return result[0];
  } catch (err) {
    console.error('탈퇴 처리 중 오류 발생:', err);
    await t.rollback();
    throw err;
  }
}

// 첫 로그인 처리
async function updateUserFirstLoginAt(user_id) {
  await User.update(
    { first_login: 1 },
    {
      where: {
        user_id,
        first_login: 0,  // 아직 첫 로그인이 아닌 경우에만 업데이트
      }
    }
  );
}

module.exports = {
  getUserById,
  createUser,
  removeMember,
  updateUserFirstLoginAt
};
