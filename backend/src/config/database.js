const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uts_pemiot',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully to Laragon MySQL');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Make sure Laragon MySQL is running!');
    return false;
  }
}

// Ensure table exists
async function ensureTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS data_sensor (
        id INT AUTO_INCREMENT PRIMARY KEY,
        suhu FLOAT NOT NULL,
        humidity FLOAT NOT NULL,
        lux INT NOT NULL,
        timestamp DATETIME NOT NULL,
        INDEX idx_timestamp (timestamp),
        INDEX idx_suhu (suhu),
        INDEX idx_humidity (humidity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Table data_sensor ready');
    connection.release();
  } catch (error) {
    console.error('❌ Error ensuring table:', error.message);
  }
}

// Initialize database
async function initDatabase() {
  await testConnection();
  await ensureTable();
}

module.exports = {
  pool,
  initDatabase
};