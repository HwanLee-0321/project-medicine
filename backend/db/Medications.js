const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./Users');  // user_id 외래키 참조를 위해 import

const Medication = sequelize.define('Medication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'users',       // 실제 테이블 이름 (소문자)
      key: 'user_id',
    },
  },
  med_nm: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  times_per_day: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dosage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  // morning: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: true,
  //   defaultValue: null,
  // // },
  // // lunch: {
  // //   type: DataTypes.BOOLEAN,
  // //   allowNull: true,
  // //   defaultValue: null,
  // // },
  // // dinner: {
  // //   type: DataTypes.BOOLEAN,
  // //   allowNull: true,
  // //   defaultValue: null,
  // // }
}, {
  tableName: 'medications',
  timestamps: false  // createdAt, updatedAt 자동관리 안 할 경우 false
});

// 🔗 관계 설정 (User 1:N Medication)
User.hasMany(Medication, {
  foreignKey: 'user_id',
});
Medication.belongsTo(User, {
  foreignKey: 'user_id',
});

module.exports = Medication;
