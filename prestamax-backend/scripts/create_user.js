#!/usr/bin/env node
// Script para crear o actualizar un usuario en la tabla `usuarios`.
// Uso: node scripts/create_user.js --username admin --password MyNewPass

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i+1];
      out[key] = val;
      i++;
    }
  }
  return out;
}

async function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const l of lines) {
    if (!l || l.trim().startsWith('#')) continue;
    const idx = l.indexOf('=');
    if (idx === -1) continue;
    const k = l.slice(0, idx).trim();
    const v = l.slice(idx+1).trim();
    env[k] = v;
  }
  return env;
}

async function main() {
  const args = parseArgs();
  const username = args.username;
  const password = args.password;
  if (!username || !password) {
    console.error('Uso: node scripts/create_user.js --username <user> --password <pass>');
    process.exit(1);
  }
  const env = await loadEnv();
  const dbConfig = {
    host: env.DB_HOST || '127.0.0.1',
    user: env.DB_USER || 'admin',
    password: env.DB_PASS || 'prestamax2025',
    database: env.DB_NAME || 'prestamax',
    port: env.DB_PORT ? parseInt(env.DB_PORT) : 3306
  };

  console.log('Conectando a la base de datos', `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  const conn = await mysql.createConnection(dbConfig);
  try {
    // Asegurar que la tabla existe
    await conn.execute(`CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )`);

    const hash = await bcrypt.hash(password, 10);
    // Insert or update
    const [rows] = await conn.execute('SELECT id FROM usuarios WHERE username = ?', [username]);
    if (rows.length > 0) {
      await conn.execute('UPDATE usuarios SET password = ? WHERE username = ?', [hash, username]);
      console.log(`Usuario '${username}' actualizado.`);
    } else {
      await conn.execute('INSERT INTO usuarios (username, password) VALUES (?, ?)', [username, hash]);
      console.log(`Usuario '${username}' creado.`);
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
