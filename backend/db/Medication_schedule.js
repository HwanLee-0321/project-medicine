const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./Users');

const MedicationSchedule = sequelize.define('MedicationSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  med_nm: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  dosage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  scheduled_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('y', 'n', 'm'), // y=복용 완료, n=복용 전, m=복용 실패 등
    allowNull: false,
  },
  taken_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'medication_schedule',
  timestamps: false,
});

// 🔗 관계 설정 (User 1:N MedicationSchedule)
User.hasMany(MedicationSchedule, {
  foreignKey: 'user_id',
});
MedicationSchedule.belongsTo(User, {
  foreignKey: 'user_id',
});

module.exports = MedicationSchedule;
