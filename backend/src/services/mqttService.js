const mqtt = require('mqtt');
const { insertSensorData } = require('../controllers/sensorController');
require('dotenv').config();

const BROKER = process.env.MQTT_BROKER || 'broker.hivemq.com';
const PORT = process.env.MQTT_PORT || 1883;
const DATA_TOPIC = process.env.MQTT_DATA_TOPIC || 'nzmk2/pemiot/data';
const CMD_TOPIC = process.env.MQTT_CMD_TOPIC || 'nzmk2/pemiot/cmd/state/led';
const CLIENT_ID = process.env.MQTT_CLIENT_ID || 'Server_Nzmk2_ingestor';

let client = null;

function startMQTTClient() {
  const brokerUrl = `mqtt://${BROKER}:${PORT}`;
  
  console.log('🔄 Connecting to MQTT broker...');
  console.log(`   Broker: ${BROKER}:${PORT}`);
  console.log(`   Client ID: ${CLIENT_ID}`);
  
  client = mqtt.connect(brokerUrl, {
    clientId: CLIENT_ID,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  });

  client.on('connect', () => {
    console.log('✅ MQTT Connected to', BROKER);
    client.subscribe(DATA_TOPIC, { qos: 1 }, (err) => {
      if (!err) {
        console.log(`📡 Subscribed to topic: ${DATA_TOPIC}`);
      } else {
        console.error('❌ Subscribe error:', err);
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📩 Received MQTT message:', data);

      const suhu = parseFloat(data.temperature);
      const humidity = parseFloat(data.humidity);
      const lux = parseInt(data.lightlevel || data.lux || 0);
      
      // Parse timestamp
      let timestamp = null;
      if (data.datetime) {
        timestamp = new Date(data.datetime.replace('Z', ''));
      }

      await insertSensorData(suhu, humidity, lux, timestamp);
    } catch (error) {
      console.error('❌ Error processing MQTT message:', error.message);
    }
  });

  client.on('error', (error) => {
    console.error('❌ MQTT Error:', error);
  });

  client.on('offline', () => {
    console.log('⚠️  MQTT Client offline');
  });

  client.on('reconnect', () => {
    console.log('🔄 MQTT Reconnecting...');
  });
}

// Publish LED command
function publishLEDCommand(state) {
  return new Promise((resolve, reject) => {
    if (!client || !client.connected) {
      return reject(new Error('MQTT client not connected'));
    }

    const payload = state.toLowerCase() === 'on' ? 'ON' : 'OFF';
    
    client.publish(CMD_TOPIC, payload, { qos: 1 }, (error) => {
      if (error) {
        console.error('❌ Error publishing LED command:', error);
        reject(error);
      } else {
        console.log(`📤 LED command sent: ${payload}`);
        resolve(payload);
      }
    });
  });
}

module.exports = {
  startMQTTClient,
  publishLEDCommand
};

// Run standalone if executed directly
if (require.main === module) {
  console.log('🚀 Starting MQTT Service...');
  startMQTTClient();
}