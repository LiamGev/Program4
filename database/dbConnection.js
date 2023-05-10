const mysql = require("mysql2");
const logger = require("../src/config/config").logger;
require("dotenv").config();

const pool = mysql.createPool({
  connectionLimit: 100,
  waitForConnections: true,
  queueLimit: 0,
  multipleStatements: true,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

module.exports = pool;

pool.on("connection", function (connection) {
  logger.debug(`Connected to database '${connection.config.database}'`);
});

pool.on("acquire", (connection) => {
  logger.debug("Connection %d acquired", connection.threadId);
});

pool.on("release", (connection) => {
  logger.debug("Connection %d released", connection.threadId);
});