const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { publishLEDCommand } = require('../services/mqttService');

// API Routes
router.get('/summary', sensorController.getSummary);
router.get('/sensors/latest', sensorController.getLatest);
router.get('/sensors', sensorController.getSensorList);
router.get('/health', sensorController.healthCheck);

// LED Control
router.post('/led', async (req, res) => {
  try {
    const { state } = req.body;
    
    if (!state || !['on', 'off'].includes(state.toLowerCase())) {
      return res.status(400).json({ 
        error: "state harus 'on' atau 'off'" 
      });
    }
    
    await publishLEDCommand(state);
    res.status(202).json({ 
      status: 'sent', 
      state: state.toLowerCase() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;