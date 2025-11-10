const { pool } = require('../config/database');

// Get sensor summary (suhumax, suhumin, suhurata, dll)
async function getSummary(req, res) {
  try {
    const connection = await pool.getConnection();
    
    // Get aggregated data
    const [aggResult] = await connection.query(
      'SELECT MAX(suhu) as suhumax, MIN(suhu) as suhumin, AVG(suhu) as suhurata FROM data_sensor'
    );
    
    // Get max suhu record
    const [maxSuhuRows] = await connection.query(
      'SELECT id, suhu, humidity, lux, timestamp FROM data_sensor ORDER BY suhu DESC, id ASC LIMIT 1'
    );
    
    // Get max humidity record
    const [maxHumidRows] = await connection.query(
      'SELECT id, suhu, humidity, lux, timestamp FROM data_sensor ORDER BY humidity DESC, id ASC LIMIT 1'
    );
    
    connection.release();
    
    const suhumax = aggResult[0].suhumax;
    const suhumin = aggResult[0].suhumin;
    const suhurata = aggResult[0].suhurata ? parseFloat(aggResult[0].suhurata.toFixed(2)) : null;
    
    const listRows = [];
    const monthYearMax = [];
    
    [maxSuhuRows[0], maxHumidRows[0]].forEach(row => {
      if (row) {
        const tsDate = new Date(row.timestamp);
        listRows.push({
          idx: row.id,
          suhun: parseFloat(row.suhu),
          humid: parseFloat(row.humidity),
          kecerahan: parseInt(row.lux),
          timestamp: formatDateTime(row.timestamp)
        });
        monthYearMax.push({
          month_year: `${tsDate.getMonth() + 1}-${tsDate.getFullYear()}`
        });
      }
    });
    
    const response = {
      suhumax,
      suhumin,
      suhurata,
      nilai_suhu_max_humid_max: listRows,
      month_year_max: monthYearMax
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in getSummary:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get latest sensor data
async function getLatest(req, res) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, suhu, humidity, lux, timestamp FROM data_sensor ORDER BY id DESC LIMIT 1'
    );
    connection.release();
    
    if (rows.length === 0) {
      return res.json({});
    }
    
    const row = rows[0];
    const response = {
      id: row.id,
      suhu: parseFloat(row.suhu),
      humidity: parseFloat(row.humidity),
      lux: parseInt(row.lux),
      timestamp: formatDateTime(row.timestamp)
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in getLatest:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get list of sensor data with limit
async function getSensorList(req, res) {
  try {
    let limit = parseInt(req.query.limit) || 50;
    if (limit < 1) limit = 1;
    if (limit > 500) limit = 500;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, suhu, humidity, lux, timestamp FROM data_sensor ORDER BY id DESC LIMIT ?',
      [limit]
    );
    connection.release();
    
    const result = rows.map(row => ({
      id: row.id,
      suhu: parseFloat(row.suhu),
      humidity: parseFloat(row.humidity),
      lux: parseInt(row.lux),
      timestamp: formatDateTime(row.timestamp)
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error in getSensorList:', error);
    res.status(500).json({ error: error.message });
  }
}

// Insert sensor data (called from MQTT)
async function insertSensorData(suhu, humidity, lux, timestamp = null) {
  try {
    const connection = await pool.getConnection();
    const ts = timestamp || new Date();
    
    await connection.query(
      'INSERT INTO data_sensor (suhu, humidity, lux, timestamp) VALUES (?, ?, ?, ?)',
      [suhu, humidity, lux, ts]
    );
    
    connection.release();
    console.log(`✅ Data inserted: suhu=${suhu}, humidity=${humidity}, lux=${lux}`);
    return true;
  } catch (error) {
    console.error('❌ Error inserting data:', error.message);
    return false;
  }
}

// Helper function to format datetime
function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Health check
async function healthCheck(req, res) {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getSummary,
  getLatest,
  getSensorList,
  insertSensorData,
  healthCheck
};