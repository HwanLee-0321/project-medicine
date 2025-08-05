const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./Users');

const Health_alert = sequelize.define('HealthAlert', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  alert_type: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  detected_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'health_alerts',
  timestamps: false, // createdAt, updatedAt 자동 관리 안 함
});

User.hasMany(Health_alert, {
  foreignKey: 'user_id',
});
Health_alert.belongsTo(User, {
  foreignKey: 'user_id',
});

module.exports = Health_alert;