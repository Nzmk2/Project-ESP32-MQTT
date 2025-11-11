# 🌡️ UTS Pemrograman IoT

**Nama:** Nizar  
**NIM:** 152023040    
**Mata Kuliah:** IFB309-Pemrograman IoT 

---

## 📋 Deskripsi Project

Project ini adalah sistem monitoring sensor IoT menggunakan:
- **ESP32** (simulasi di Wokwi)
- **MQTT Protocol** (broker.hivemq.com)
- **Backend Node.js + Express**
- **Database MySQL** (Laragon)
- **Frontend Web Dashboard**

Data sensor (suhu, humidity, cahaya) dikirim via MQTT, disimpan ke database, dan ditampilkan di web dashboard dengan format JSON.

---

## 🛠️ Teknologi

- **ESP32** - Microcontroller
- **Wokwi** - ESP32 Simulator
- **Node.js + Express** - Backend API
- **MySQL** - Database
- **MQTT** - Messaging Protocol
- **MQTTBox** - MQTT Client

---

### Frontend:
- **HTML5** - Structure
- **CSS3** - Styling & Responsive Design
- **JavaScript (Vanilla)** - Interactive Dashboard

---

## 📊 Komponen Hardware (Simulasi)

- ESP32 DevKit C V4
- DHT22 - Sensor Suhu & Kelembapan
- LDR - Sensor Cahaya
- RTC DS1307 - Real-Time Clock
- LED - Indicator

---

## 🚀 Cara Menjalankan

### 1. Clone Repository
```bash
git clone https://github.com/Nzmk2/Project-ESP32-MQTT.git
cd uts-pemiot-152023040-nizar
```

### 2. Setup Database
- Jalankan Laragon
- Import file `database/init.sql`

### 3. Setup Backend
```bash
cd backend
npm install
npm start
```

### 4. Setup Wokwi
- Buka https://wokwi.com/
- Upload file dari folder `wokwi_config/`
- Start simulation

### 5. Buka Dashboard
- Buka file `frontend/index.html` di browser


## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/summary` | Data aggregat sensor |
| GET | `/api/sensors/latest` | Data sensor terbaru |
| GET | `/api/sensors?limit=N` | List N data terakhir |
| POST | `/api/led` | Control LED ON/OFF |
| GET | `/api/health` | Health check |


---

## 📁 Struktur Project

```
uts-pemiot-152023040-nizar/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── package.json
│   └── .env
├── database/
│   └── init.sql
├── wokwi_config/
│   ├── sketch.ino
│   ├── diagram.json
│   └── libraries.txt
└── README.md
```

## 👨‍💻 Author

**Nizar**  
NIM: 152023040  
GitHub: [@Nzmk2]