require('dotenv').config();
const { Sequelize } = require('sequelize');

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT
} = process.env;

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

module.exports = sequelize;