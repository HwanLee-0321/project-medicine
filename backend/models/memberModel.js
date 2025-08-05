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
  return user?.toJSON();
}

// 회원 생성
async function createUser(userData) {
  await User.create(userData);
}

// 회원 탈퇴 (논리 삭제 방식)
async function removeMember(user_id) {
  const t = await sequelize.transaction();

  try {
    // delyn 플래그를 'Y'로 변경 (유저만)
    const result = await User.update(
      { delyn: 'Y' },
      { where: { user_id }, transaction: t }
    );

    if (result[0] === 0) {
      console.warn(`탈퇴 실패: user_id ${user_id}가 존재하지 않거나 이미 탈퇴`);
      await t.rollback();
      return 0;
    }

    // 다른 테이블 데이터도 논리 삭제하려면 여기에 추가
    // 예: Medication_schedule, Medications 등

    await t.commit();
    return result[0]; // 업데이트된 row 수 (1이면 성공)
  } catch (err) {
    console.error('탈퇴 처리 중 오류 발생:', err);
    await t.rollback();
    throw err;
  }
}

module.exports = { getUserById, createUser, removeMember };
