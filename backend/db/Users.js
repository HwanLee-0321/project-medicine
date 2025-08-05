const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.STRING(50),
    primaryKey: true,     // ✅ Primary Key 지정
    allowNull: false,
    unique: true,
  },
  user_pw: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  elder_nm: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  guard_mail: {
    type: DataTypes.STRING(255),
    allowNull: true,      // ✅ NULL 가능
  },
  elder_birth: {
    type: DataTypes.STRING(8),   // ✅ DATE 대신 char(8) 그대로 반영
    allowNull: true,
  },
  birth_type: {
    type: DataTypes.STRING(1),   // ✅ char(1)
    allowNull: true,
  },
  sex: {
    type: DataTypes.STRING(1),
    allowNull: true,
  },
  is_elderly: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  delyn: {
    type: DataTypes.STRING(1),
    allowNull: true,
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
