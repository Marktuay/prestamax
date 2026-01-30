// If a .env file is not present but .env.example exists, copy it to .env
// to help developers bootstrap the project (won't overwrite an existing .env).
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
try {
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
        const example = fs.readFileSync(envExamplePath, 'utf8');
        fs.writeFileSync(envPath, example, { encoding: 'utf8', flag: 'wx' });
        console.log('Se ha creado un archivo .env desde .env.example (no fue sobrescrito). Revísalo y actualiza las credenciales.');
    }
} catch (e) {
    // If write fails, continue — dotenv will still try to load environment variables.
    console.warn('No se pudo crear .env automáticamente:', e.message || e);
}
require('dotenv').config();
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Database configuration: prefer values from environment variables.
// Avoid hardcoding real credentials here. Provide sane defaults only for
// host/port so development is easy; require user/password/db name from env
// (warn in development, throw in production).
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
};

// Validate important env vars. In production we fail fast; in development we warn.
const missing = [];
if (!dbConfig.user) missing.push('DB_USER');
if (!dbConfig.password) missing.push('DB_PASS');
if (!dbConfig.database) missing.push('DB_NAME');
if (missing.length > 0) {
    const msg = `Missing required DB env vars: ${missing.join(', ')}. Please create a .env file (see .env.example) or export these variables.`;
    if ((process.env.NODE_ENV || 'development') === 'production') {
        console.error(msg);
        // Fail fast in production
        process.exit(1);
    } else {
        console.warn(msg);
        console.warn('Using empty values will likely fail to connect; this is intended only for quick development.');
    }
}
const db = mysql.createPool(dbConfig);

db.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection error on startup (server will keep running):', err.message || err);
    } else {
        console.log('Connected to MySQL (pool)');
        connection.release();
    }
});

// Crear tabla de logs para registrar actividad en dashboard de administración
db.query(`CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    action VARCHAR(100),
    details TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) console.error('Error creando tabla logs:', err);
});

// Crear tabla de usuarios si no existe (solo para desarrollo, en producción usar migraciones)
db.query(`CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
)`, (err) => {
    if (err) {
        console.error('Error creando tabla usuarios:', err);
        return;
    }
    // Insertar usuario por defecto con contraseña hasheada si no existe (solo para desarrollo)
    const defaultUser = 'admin';
    const defaultPass = 'prestamax2025';
    db.query('SELECT * FROM usuarios WHERE username = ?', [defaultUser], (err, results) => {
        if (err) {
            console.error('Error consultando usuario por defecto:', err);
            return;
        }
        if (results.length === 0) {
            bcrypt.hash(defaultPass, 10, (err, hash) => {
                if (err) {
                    console.error('Error generando hash:', err);
                    return;
                }
                db.query('INSERT INTO usuarios (username, password) VALUES (?, ?)', [defaultUser, hash], (err) => {
                    if (err) console.error('Error insertando usuario por defecto:', err);
                });
            });
        }
    });
});

// Authentication middleware supporting Bearer JWT or Basic (fallback).
const authMiddleware = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
        return res.status(401).send('Autenticación requerida');
    }
    try {
        // Bearer token path
        if (auth.startsWith('Bearer ')) {
            const token = auth.split(' ')[1];
            const secret = process.env.JWT_SECRET || 'ChangeMeToAStrongSecret';
            try {
                const payload = jwt.verify(token, secret);
                req.user = payload;
                return next();
            } catch (e) {
                return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
            }
        }
        // Basic auth fallback
        if (auth.startsWith('Basic ')) {
            const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
            const [user, pass] = credentials;
            const [results] = await db.promise().query('SELECT * FROM usuarios WHERE username = ?', [user]);
            if (results.length > 0) {
                const hash = results[0].password;
                const match = await bcrypt.compare(pass, hash);
                if (match) {
                    req.user = { username: user };
                    return next();
                }
            }
            res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
            return res.status(401).send('Credenciales incorrectas');
        }
        // Unsupported auth scheme
        res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
        return res.status(401).send('Autenticación requerida');
    } catch (err) {
        console.error('Error en autenticación:', err);
        res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
        return res.status(500).send('Error interno');
    }
};

// Keep compatibility variable name used in routes
const basicAuth = authMiddleware;

// Rutas protegidas y públicas
app.get('/debug/logs', basicAuth, (req, res) => {
    db.query("SELECT id, username, action, details, fecha FROM logs WHERE action = 'mensaje_sospechoso' ORDER BY fecha DESC LIMIT 50", (err, results) => {
        if (err) {
            console.error('MySQL select error (logs):', err);
            return res.status(500).json({ ok: false, message: 'Error al consultar los logs.' });
        }
        res.json({ ok: true, data: results });
    });
});

    // Health endpoint - útil para diagnosticar si el servidor Express está arriba
    app.get('/health', (req, res) => {
        res.json({ ok: true, server: 'prestamax-backend', env: process.env.NODE_ENV || 'development' });
    });

app.get('/debug/consultas', basicAuth, (req, res) => {
    db.query('SELECT id, nombre, apellido, producto, tipo_asunto, descripcion, contacto, email, fecha FROM consultas ORDER BY id DESC LIMIT 10', (err, results) => {
        if (err) {
            console.error('MySQL select error (consultas):', err);
            return res.status(500).json({ ok: false, message: 'Error al consultar la base de datos.' });
        }
        res.json({ ok: true, data: results });
    });
});

app.get('/debug/last-contact', basicAuth, (req, res) => {
    db.query('SELECT id, nombre, email, telefono, producto, mensaje, fecha FROM correos ORDER BY id DESC LIMIT 10', (err, results) => {
        if (err) {
            console.error('MySQL select error:', err);
            return res.status(500).json({ ok: false, message: 'Error al consultar la base de datos.' });
        }
        res.json({ ok: true, data: results });
    });
});

const MAX_IMPORT_ROWS = 100;
const normalizeText = (value) => String(value ?? '').trim();
const sanitizeText = (value) => validator.escape(normalizeText(value));
const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);
const isValidLength = (value, min, max) => value.length >= min && value.length <= max;

app.post('/import-excel', basicAuth, [
    body('tipo').isIn(['consultas', 'contactos']),
    body('rows').isArray({ min: 1, max: MAX_IMPORT_ROWS })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, message: 'Datos inválidos.', errors: errors.array() });
    }
    const { tipo, rows } = req.body;
    const rowErrors = [];
    const validRows = rows.map((row, index) => {
        const nombre = sanitizeText(row.nombre);
        const producto = normalizeText(row.producto).toLowerCase();
        const email = normalizeText(row.email).toLowerCase();
        if (tipo === 'consultas') {
            const apellido = sanitizeText(row.apellido);
            const tipoAsunto = normalizeText(row.tipoAsunto || row.tipo_asunto).toLowerCase();
            const descripcion = sanitizeText(row.descripcion);
            const contacto = sanitizeText(row.contacto);
            const currentErrors = [];
            if (!isValidLength(nombre, 2, 100)) currentErrors.push('Nombre inválido');
            if (!isValidLength(apellido, 2, 100)) currentErrors.push('Apellido inválido');
            if (!['hipotecario', 'colaborador'].includes(producto)) currentErrors.push('Producto inválido');
            if (!['consulta', 'reclamo', 'queja'].includes(tipoAsunto)) currentErrors.push('Tipo de asunto inválido');
            if (!isValidLength(descripcion, 5, 1000)) currentErrors.push('Descripción inválida');
            if (contacto && !isValidLength(contacto, 7, 20)) currentErrors.push('Contacto inválido');
            if (!isValidEmail(email)) currentErrors.push('Email inválido');
            if (currentErrors.length > 0) {
                rowErrors.push(`Fila ${index + 1}: ${currentErrors.join(', ')}`);
                return null;
            }
            return { nombre, apellido, producto, tipoAsunto, descripcion, contacto: contacto || null, email };
        }
        const mensaje = sanitizeText(row.mensaje);
        const telefono = sanitizeText(row.telefono);
        const currentErrors = [];
        if (!isValidLength(nombre, 2, 100)) currentErrors.push('Nombre inválido');
        if (!['hipotecario', 'colaborador'].includes(producto)) currentErrors.push('Producto inválido');
        if (!isValidEmail(email)) currentErrors.push('Email inválido');
        if (!isValidLength(mensaje, 5, 1000)) currentErrors.push('Mensaje inválido');
        if (telefono && !isValidLength(telefono, 7, 20)) currentErrors.push('Teléfono inválido');
        if (currentErrors.length > 0) {
            rowErrors.push(`Fila ${index + 1}: ${currentErrors.join(', ')}`);
            return null;
        }
        return { nombre, email, telefono: telefono || null, producto, mensaje };
    }).filter(Boolean);
    if (rowErrors.length > 0) {
        return res.status(400).json({ ok: false, message: 'Errores en el archivo.', errors: rowErrors });
    }
    if (validRows.length === 0) {
        return res.status(400).json({ ok: false, message: 'No hay filas válidas para importar.' });
    }
    if (tipo === 'consultas') {
        const values = validRows.map(row => [
            row.nombre,
            row.apellido,
            row.producto,
            row.tipoAsunto,
            row.descripcion,
            row.contacto,
            row.email,
            new Date()
        ]);
        return db.query(
            'INSERT INTO consultas (nombre, apellido, producto, tipo_asunto, descripcion, contacto, email, fecha) VALUES ?',
            [values],
            (err) => {
                if (err) {
                    console.error('MySQL insert error (import consultas):', err);
                    return res.status(500).json({ ok: false, message: 'Error al importar consultas.' });
                }
                db.query('INSERT INTO logs (username, action, details) VALUES (?, ?, ?)', [req.user?.username || 'import', 'import_excel', `Consultas: ${validRows.length}`], (logErr) => {
                    if (logErr) console.error('Error guardando log de importación:', logErr);
                });
                return res.json({ ok: true, imported: validRows.length });
            }
        );
    }
    const values = validRows.map(row => [
        row.nombre,
        row.email,
        row.telefono,
        row.producto,
        row.mensaje,
        new Date()
    ]);
    return db.query(
        'INSERT INTO correos (nombre, email, telefono, producto, mensaje, fecha) VALUES ?',
        [values],
        (err) => {
            if (err) {
                console.error('MySQL insert error (import contactos):', err);
                return res.status(500).json({ ok: false, message: 'Error al importar contactos.' });
            }
            db.query('INSERT INTO logs (username, action, details) VALUES (?, ?, ?)', [req.user?.username || 'import', 'import_excel', `Contactos: ${validRows.length}`], (logErr) => {
                if (logErr) console.error('Error guardando log de importación:', logErr);
            });
            return res.json({ ok: true, imported: validRows.length });
        }
    );
});

app.post('/consultas', [
    body('nombre').trim().isLength({ min: 2, max: 100 }).escape(),
    body('apellido').trim().isLength({ min: 2, max: 100 }).escape(),
    body('producto').isIn(['hipotecario', 'colaborador']),
    body('tipoAsunto').isIn(['consulta', 'reclamo', 'queja']),
    body('descripcion').trim().isLength({ min: 5, max: 1000 }).escape(),
    body('contacto').optional({ checkFalsy: true }).isLength({ min: 7, max: 20 }).escape(),
    body('email').isEmail().normalizeEmail()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, message: 'Datos inválidos.', errors: errors.array() });
    }
    const { nombre, apellido, producto, tipoAsunto, descripcion, contacto, email } = req.body;
    db.query(
        'INSERT INTO consultas (nombre, apellido, producto, tipo_asunto, descripcion, contacto, email, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [nombre, apellido, producto, tipoAsunto, descripcion, contacto, email],
        (err, result) => {
            if (err) {
                console.error('MySQL insert error (consultas):', err);
                return res.status(500).json({ ok: false, message: 'Error al guardar en MySQL. Revisa los logs del servidor para más detalles.' });
            }
            res.json({ ok: true, message: 'Consulta guardada en MySQL.' });
        }
    );
});

app.post('/contact', [
    body('nombre').trim().isLength({ min: 2, max: 100 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('telefono').optional({ checkFalsy: true }).isLength({ min: 7, max: 20 }).escape(),
    body('producto').isIn(['hipotecario', 'colaborador']),
    body('mensaje').trim().isLength({ min: 5, max: 1000 }).escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, message: 'Datos inválidos.', errors: errors.array() });
    }
    const { nombre, email, telefono, producto, mensaje } = req.body;
    // Detección de palabras sospechosas
    const palabrasSospechosas = ['fraude', 'hack', 'ataque', 'robo', 'phishing', 'estafa'];
    const contieneSospecha = palabrasSospechosas.some(palabra =>
        mensaje.toLowerCase().includes(palabra)
    );
    if (contieneSospecha) {
        console.log('¡Mensaje sospechoso detectado!', mensaje);
        // Guardar alerta en la tabla logs
        db.query(
            'INSERT INTO logs (username, action, details) VALUES (?, ?, ?)',
            [email || 'anónimo', 'mensaje_sospechoso', `Mensaje: ${mensaje}`],
            (err) => {
                if (err) console.error('Error guardando log de mensaje sospechoso:', err);
            }
        );
    }
    console.log('POST /contact received:', { nombre, email, telefono, producto, mensaje });
    db.query(
        'INSERT INTO correos (nombre, email, telefono, producto, mensaje, fecha) VALUES (?, ?, ?, ?, ?, NOW())',
        [nombre, email, telefono, producto, mensaje],
        (err, result) => {
            if (err) {
                console.error('MySQL insert error:', err);
                return res.status(500).json({ ok: false, message: 'Error al guardar en MySQL. Revisa los logs del servidor para más detalles.' });
            }
            res.json({ ok: true, message: 'Datos guardados en MySQL.' });
        }
    );
});
// Login endpoint: returns JWT when credentials are valid
app.post('/login', [
    body('username').trim().isLength({ min: 1 }),
    body('password').trim().isLength({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, message: 'Datos inválidos.' });
    const { username, password } = req.body;
    try {
        const [results] = await db.promise().query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (results.length === 0) return res.status(401).json({ ok: false, message: 'Credenciales incorrectas.' });
        const hash = results[0].password;
        const match = await bcrypt.compare(password, hash);
        if (!match) return res.status(401).json({ ok: false, message: 'Credenciales incorrectas.' });
        const secret = process.env.JWT_SECRET || 'ChangeMeToAStrongSecret';
        const token = jwt.sign({ username }, secret, { expiresIn: '1h' });
        // Log successful login
        db.query('INSERT INTO logs (username, action, details) VALUES (?, ?, ?)', [username, 'login_success', 'Login vía /login'], (err) => { if (err) console.error('Error guardando log:', err); });
        res.json({ ok: true, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ ok: false, message: 'Error interno' });
    }
});

// Middlewares de error al final
app.use((req, res, next) => {
    res.status(404).json({ ok: false, message: 'Ruta no encontrada.' });
});

app.use((err, req, res, next) => {
    console.error('Error general:', err);
    res.status(500).json({ ok: false, message: 'Error interno del servidor.' });
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception (see stack):', err.stack || err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
