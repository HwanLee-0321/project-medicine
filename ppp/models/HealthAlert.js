// models/HealthAlert.js
module.exports = (sequelize, DataTypes) => {
  const HealthAlert = sequelize.define('HealthAlert', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alert_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detected_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'health_alerts',
    timestamps: false,
  });

  return HealthAlert;
};
