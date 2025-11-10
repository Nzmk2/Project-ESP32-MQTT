-- Buat Database
CREATE DATABASE IF NOT EXISTS uts_pemiot;
USE uts_pemiot;

-- Buat Tabel
CREATE TABLE IF NOT EXISTS data_sensor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suhu FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    lux INT NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp),
    INDEX idx_suhu (suhu),
    INDEX idx_humidity (humidity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Data Sample untuk Testing
INSERT INTO data_sensor (suhu, humidity, lux, timestamp) VALUES
(36, 36, 25, '2010-09-18 07:23:48'),
(21, 30, 20, '2010-09-19 08:15:22'),
(28, 35, 22, '2010-09-20 09:30:15'),
(36, 36, 27, '2011-05-02 12:29:34'),
(25, 40, 18, '2011-05-03 14:45:20'),
(43.6, 69, 30, '2024-01-15 10:30:00'),
(32.5, 55, 22, '2024-01-15 11:00:00');