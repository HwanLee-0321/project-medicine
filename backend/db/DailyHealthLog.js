const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const DailyHealthLog = sequelize.define('DailyHealthLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING(50), allowNull: false },
    log_date: { type: DataTypes.DATEONLY, allowNull: false },
    meal_time: { type: DataTypes.ENUM('morning','lunch','dinner'), allowNull: false },
    medication_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    symptom_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'daily_health_log',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    indexes: [
        { unique: true, fields: ['user_id', 'log_date', 'meal_time'] }
    ]
});

module.exports = DailyHealthLog;
