const { DataTypes } = require('sequelize');  // DataTypes: Sequelize에서 제공하는 자료형들을 사용하기 위한 객체
const sequelize = require('./sequelize');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    unique: true,  // 중복 불가
  },
  user_pw: {  // 암호화되어 저장됨
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  elder_nm: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  guard_mail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  elder_birth: {  // YYYYMMDD
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  birth_type: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,  // DB 기본값 0 (음력)과 맞춤
  },
  sex: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,  // DB 기본값 0 (여성)과 맞춤 (필요에 따라 true로 변경 가능)
  },
  is_elderly: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,  // DB 기본값 0 (보호자)와 맞춤
  },
  delyn: {
    type: DataTypes.STRING(1),
    allowNull: true,
    defaultValue: "N",
  },
  first_login: {
    type: DataTypes.BOOLEAN,  // true(1): 첫 로그인
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
