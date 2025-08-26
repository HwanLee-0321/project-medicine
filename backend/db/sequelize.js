require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',  // 사용할 데이터베이스 종류
    logging: false,  // SQL 쿼리 로그를 콘솔에 출력X
  }
);

module.exports = sequelize;
