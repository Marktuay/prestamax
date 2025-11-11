-- Init script for Prestamax MySQL
-- This will be executed automatically by the official MySQL image on first startup

CREATE DATABASE IF NOT EXISTS prestamax DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE prestamax;

CREATE TABLE IF NOT EXISTS correos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  producto VARCHAR(100),
  mensaje TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  producto VARCHAR(100),
  tipo_asunto VARCHAR(100),
  descripcion TEXT,
  contacto VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- The application already creates 'logs' and 'usuarios' tables at runtime,
-- but keep safe definitions here for idempotent initialization.
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  action VARCHAR(100),
  details TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
