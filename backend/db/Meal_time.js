const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize'); 

const MealTimes = sequelize.define('MealTimes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  morning: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  lunch: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  dinner: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'meal_times',
  timestamps: false, // 직접 created_at, updated_at 관리한다면 false
  underscored: true, // created_at, updated_at처럼 snake_case 컬럼 이름 사용 시 true
});

module.exports = MealTimes;