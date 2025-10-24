
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: '127.0.0.1',
    user: 'admin',
    password: 'prestamax2025',
    database: 'prestamax',
    port: 3305
};
const db = mysql.createPool(dbConfig);

db.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection error on startup (server will keep running):', err.message || err);
    } else {
        console.log('Connected to MySQL (pool)');
        connection.release();
    }
});

// Crear tabla de logs para registrar actividad en  dashboard de administración
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
// Middleware de autenticación básica para rutas de diagnóstico (asíncrono)
const basicAuth = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
        res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
        return res.status(401).send('Autenticación requerida');
    }
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const [user, pass] = credentials;
    try {
        const [results] = await db.promise().query('SELECT * FROM usuarios WHERE username = ?', [user]);
        if (results.length > 0) {
            const hash = results[0].password;
            const match = await bcrypt.compare(pass, hash);
            if (match) {
                return next();
            } else {
                res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
                return res.status(401).send('Credenciales incorrectas');
            }
        } else {
            res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
            return res.status(401).send('Credenciales incorrectas');
        }
    } catch (err) {
        console.error('Error en autenticación:', err);
        res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
        return res.status(500).send('Error interno');
    }
};



process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception (see stack):', err.stack || err);
});

// Ruta para guardar consultas, reclamos y quejas
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

// Ruta de diagnóstico: últimos 10 registros de la tabla consultas
app.get('/debug/consultas', basicAuth, (req, res) => {
    db.query('SELECT id, nombre, apellido, producto, tipo_asunto, descripcion, contacto, email, fecha FROM consultas ORDER BY id DESC LIMIT 10', (err, results) => {
        if (err) {
            console.error('MySQL select error (consultas):', err);
            return res.status(500).json({ ok: false, message: 'Error al consultar la base de datos.' });
        }
        res.json({ ok: true, data: results });
    });
});

// Ruta para guardar consultas, reclamos y quejas
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

// Ruta de diagnóstico: últimos 10 registros de la tabla correos
app.get('/debug/last-contact', basicAuth, (req, res) => {
    db.query('SELECT id, nombre, email, telefono, producto, mensaje, fecha FROM correos ORDER BY id DESC LIMIT 10', (err, results) => {
        if (err) {
            console.error('MySQL select error:', err);
            return res.status(500).json({ ok: false, message: 'Error al consultar la base de datos.' });
        }
        res.json({ ok: true, data: results });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});