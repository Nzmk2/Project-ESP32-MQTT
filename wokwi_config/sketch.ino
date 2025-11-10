#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <RTClib.h>
#include <ArduinoJson.h>

// WiFi Configuration (untuk Wokwi gunakan Wokwi-GUEST)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// MQTT Configuration
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_data_topic = "nzmk2/pemiot/data";
const char* mqtt_cmd_topic = "nzmk2/pemiot/cmd/state/led";

// Pin Configuration
#define DHTPIN 15
#define DHTTYPE DHT22
#define LDR_PIN 34
#define LED_PIN 2

// Objects
DHT dht(DHTPIN, DHTTYPE);
RTC_DS1307 rtc;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Variables
float temperature = 0;
float humidity = 0;
int lightLevel = 0;
unsigned long lastPublish = 0;
const unsigned long publishInterval = 10000; // Publish setiap 10 detik

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=================================");
  Serial.println("=== ESP32 IoT Sensor Node ===");
  Serial.println("Author: Nzmk2");
  Serial.println("Date: 2025-11-10 19:52:26 UTC");
  Serial.println("Server: Laragon + HeidiSQL");
  Serial.println("=================================\n");
  
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  dht.begin();
  Serial.println("✅ DHT22 initialized");
  
  if (!rtc.begin()) {
    Serial.println("❌ RTC not found!");
  } else {
    Serial.println("✅ RTC initialized");
    if (!rtc.isrunning()) {
      Serial.println("⚠️  RTC is NOT running, setting time...");
      rtc.adjust(DateTime(2025, 11, 10, 19, 52, 26));
    }
  }
  
  setupWiFi();
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
}

void setupWiFi() {
  Serial.print("🔄 Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("\n📩 Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  if (message == "ON") {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("💡 LED ON");
  } else if (message == "OFF") {
    digitalWrite(LED_PIN, LOW);
    Serial.println("💡 LED OFF");
  }
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("🔄 Attempting MQTT connection...");
    
    String clientId = "ESP32_Nzmk2_";
    clientId += String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println(" ✅ MQTT connected");
      mqttClient.subscribe(mqtt_cmd_topic);
      Serial.print("📡 Subscribed to: ");
      Serial.println(mqtt_cmd_topic);
    } else {
      Serial.print(" ❌ Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" - retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void readSensors() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  int rawLDR = analogRead(LDR_PIN);
  lightLevel = map(rawLDR, 0, 4095, 0, 100);
  
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    temperature = 0;
    humidity = 0;
  }
}

void publishSensorData() {
  readSensors();
  
  DateTime now = rtc.now();
  
  StaticJsonDocument<256> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["lightlevel"] = lightLevel;
  
  char datetime[25];
  sprintf(datetime, "%04d-%02d-%02dT%02d:%02d:%02dZ",
          now.year(), now.month(), now.day(),
          now.hour(), now.minute(), now.second());
  doc["datetime"] = datetime;
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  if (mqttClient.publish(mqtt_data_topic, buffer, true)) {
    Serial.println("\n📤 Data published:");
    Serial.println(buffer);
    Serial.println("   ➜ Sent to Laragon Backend via MQTT\n");
  } else {
    Serial.println("❌ Failed to publish data");
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }
  
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();
  
  unsigned long now = millis();
  if (now - lastPublish >= publishInterval) {
    lastPublish = now;
    publishSensorData();
  }
}