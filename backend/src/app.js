const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const { startMQTTClient } = require('./services/mqttService');
const sensorRoutes = require('./routes/sensorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', sensorRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Sensor IoT Backend API',
    author: '152023040_Nizar',
    timestamp: new Date().toISOString(),
    endpoints: {
      summary: '/api/summary',
      latest: '/api/sensors/latest',
      list: '/api/sensors?limit=50',
      led: 'POST /api/led',
      health: '/api/health'
    }
  });
});

// Initialize and start server
async function startServer() {
  console.log('\n=================================');
  console.log('🚀 Starting Sensor IoT Backend');
  console.log('   Author: 152023040_Nizar');
  console.log('=================================\n');
  
  try {
    // Initialize database
    await initDatabase();
    
    // Start MQTT client
    startMQTTClient();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\n=================================');
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/`);
      console.log('=================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;