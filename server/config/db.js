const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error ❌', err);
  } else {
    console.log('Connected to MySQL database ✅');
    connection.release();
  }
});

const promisePool = pool.promise();

const ensureReportStatusColumn = async () => {
  try {
    const [columns] = await promisePool.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'status'`,
      [process.env.DB_NAME]
    );

    if (columns.length === 0) {
      await promisePool.query(
        `ALTER TABLE reports
         ADD COLUMN status ENUM('pending', 'reviewed', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending'
         AFTER description`
      );
      console.log('Added reports.status column');
    }
  } catch (err) {
    console.error('Could not verify reports.status column', err.message);
  }
};

const ensureContentFileType = async () => {
  try {
    await promisePool.query(
      "ALTER TABLE content MODIFY type ENUM('text', 'image', 'file') NOT NULL"
    );
  } catch (err) {
    console.error('Could not verify content.type values', err.message);
  }
};

ensureReportStatusColumn();
ensureContentFileType();

module.exports = promisePool;
