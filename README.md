# Prestamax

Proyecto web para simulación de préstamos, recepción de contactos y consultas/reclamos, y un dashboard administrativo para revisarlos.

## ⚠️ IMPORTANTE: Seguridad

**Antes de desplegar en producción, lee el archivo [SECURITY.md](SECURITY.md) completo.**

Este proyecto incluye mejoras de seguridad importantes:
- Sin credenciales hardcoded en el código
- Configuración basada en variables de entorno
- Rate limiting en endpoints sensibles
- Headers de seguridad (helmet.js)
- Validación y sanitización de inputs
- Autenticación JWT con tokens seguros

## Resumen rápido
- Backend: Node.js + Express, MySQL (mysql2), validación con express-validator, hashing con bcrypt, autenticación JWT con `jsonwebtoken`.
- Seguridad: helmet.js (headers de seguridad), express-rate-limit (protección contra ataques de fuerza bruta), CORS configurable.
- Persistencia: MySQL (se recomienda usar Docker Compose incluido para desarrollo).
- Autenticación: POST `/login` devuelve token JWT (Bearer). Endpoints administrativos protegidos aceptan Bearer JWT o Basic como fallback.

## Estructura del proyecto

```
prestamax/
├── index.html
├── consultas-reclamos.html
├── dashboard.html
├── privacy-policy.html
├── terms.html
├── SECURITY.md           ← Documentación de seguridad (LEER ANTES DE PRODUCCIÓN)
├── .env.example          ← Ejemplo para docker-compose
├── docker-compose.yml    ← Configuración de MySQL con variables de entorno
├── js/
│   ├── config.js         ← Configuración de URLs del API
│   └── ...
├── css/
├── images/
└── prestamax-backend/
  ├── index.js
  ├── package.json
  ├── .env.example        ← Ejemplo de configuración del backend
  ├── scripts/
  │   └── create_user.js  ← Script para crear usuarios de forma segura
  └── db-init/            ← Scripts SQL de inicialización
```

## Qué cambió (últimas actualizaciones)

### Mejoras de Seguridad (2025-11-17)
- ✅ **Eliminadas todas las credenciales hardcoded** - Ahora se usan variables de entorno
- ✅ **Headers de seguridad** - Implementado helmet.js (CSP, HSTS, X-Frame-Options, etc.)
- ✅ **Rate limiting** - Protección contra ataques de fuerza bruta en login y spam en formularios
- ✅ **CORS configurable** - Soporte para diferentes orígenes según el entorno
- ✅ **URLs configurables** - Frontend usa `config.js` para diferentes entornos
- ✅ **Validación de JWT secret** - El servidor no arranca en producción sin un secret fuerte
- ✅ **Documentación de seguridad** - Ver [SECURITY.md](SECURITY.md)

### Funcionalidades Previas
- Se añadió `docker-compose.yml` en la raíz y `prestamax-backend/db-init/init.sql` para crear la base `prestamax` y las tablas necesarias automáticamente al iniciar el contenedor MySQL.
- Se implementó un endpoint de login: POST `/login` que devuelve un JWT (expira en 1h). Los endpoints administrativos (`/debug/*`) aceptan `Authorization: Bearer <token>`.
- Se agregó un script utilitario `prestamax-backend/scripts/create_user.js` y un npm script `create-user` para crear/actualizar usuarios en la tabla `usuarios` con contraseña hasheada.
- Se añadió `/health` para comprobaciones rápidas.

## Requisitos
- Node.js 16+ (o LTS recomendable)
- npm
- Docker Desktop (recomendado para levantar MySQL localmente) o MySQL instalado en la máquina

## Configuración y puesta en marcha (recomendado: Docker)

### ⚠️ IMPORTANTE: Configuración de Seguridad Primero

Antes de arrancar el proyecto, **debes configurar las credenciales de forma segura**:

#### 1) Configurar variables de entorno para Docker

Crea un archivo `.env` en la raíz del proyecto (NO lo comites a git):

```bash
# Genera contraseñas seguras con este comando:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Crea el archivo `.env`:
```env
MYSQL_ROOT_PASSWORD=<tu-contraseña-segura-generada>
MYSQL_DATABASE=prestamax
MYSQL_USER=prestamaxuser
MYSQL_PASSWORD=<otra-contraseña-segura-diferente>
```

#### 2) Configurar variables de entorno para el Backend

Copia el archivo de ejemplo y edítalo:

```bash
cd prestamax-backend
cp .env.example .env
```

Genera secrets fuertes y actualiza `.env`:

```bash
# Genera un JWT secret fuerte (64+ caracteres recomendado)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Genera una contraseña de base de datos fuerte
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Edita `prestamax-backend/.env`:
```env
DB_HOST=127.0.0.1
DB_USER=prestamaxuser
DB_PASS=<la-misma-contraseña-que-en-docker-compose>
DB_NAME=prestamax
DB_PORT=3306

JWT_SECRET=<tu-jwt-secret-generado-64-caracteres>

# Para producción:
# NODE_ENV=production
# ALLOWED_ORIGINS=https://tudominio.com
```

#### 3) Arrancar MySQL con Docker

```bash
# Desde la raíz del repo
docker compose up -d
```

#### 4) Instalar dependencias y arrancar el backend

```bash
cd prestamax-backend
npm install
node index.js
# o si tienes definido npm start: npm start
```

#### 5) Crear usuario administrador

**IMPORTANTE**: Ya no se crea un usuario por defecto. Debes crear uno manualmente:

```bash
# Desde la carpeta prestamax-backend
npm run create-user -- --username admin --password "TuContraseñaSegura123!"
```

#### 6) Verificar que el backend está funcionando

```bash
# Endpoint health
curl http://localhost:3001/health

# Debería retornar: {"ok":true,"server":"prestamax-backend","env":"development"}
```

#### 7) Probar login

```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"TuContraseñaSegura123!"}'

# Respuesta exitosa: {"ok":true,"token":"..."}
```

### Servir el Frontend

Para desarrollo local, puedes usar cualquier servidor web estático:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js http-server
npx http-server -p 8000

# Opción 3: PHP
php -S localhost:8000
```

Luego abre tu navegador en `http://localhost:8000`

## Endpoints API

### Públicos
- `POST /contact` — Guarda mensajes desde el formulario de contacto
- `POST /consultas` — Guarda consultas/reclamos/quejas
- `POST /login` — Devuelve JWT si las credenciales son correctas
- `GET /health` — Estado del servicio (útil para health checks)

### Protegidos (requieren autenticación)
Los siguientes endpoints requieren `Authorization: Bearer <token>` o Basic Auth:

- `GET /debug/last-contact` — Últimos registros de contacto
- `GET /debug/consultas` — Últimas consultas/reclamos
- `GET /debug/logs` — Logs de alertas y mensajes sospechosos

### Seguridad en Endpoints
- **Rate Limiting**: 
  - `/login`: 5 intentos cada 15 minutos
  - `/contact` y `/consultas`: 10 submissions por hora
- **Validación**: Todos los inputs son validados y sanitizados
- **Autenticación**: JWT con expiración de 1 hora

## Dashboard Administrativo

El archivo `dashboard.html` proporciona una interfaz para:
- Visualizar consultas, reclamos y quejas
- Ver mensajes de contacto
- Monitorear alertas de seguridad
- Exportar datos a CSV/Excel
- Filtrar y buscar registros

**Acceso**: Usa las credenciales del usuario creado con el script `create-user`

## Base de datos (sin Docker)

Si prefieres instalar MySQL localmente en vez de usar Docker:

```sql
CREATE DATABASE prestamax;
USE prestamax;
```

Luego ejecuta el script de inicialización:
```bash
mysql -u root -p prestamax < prestamax-backend/db-init/init.sql
```

## Seguridad - Checklist de Producción

Antes de desplegar a producción, verifica que:

- [ ] Todas las variables de entorno están configuradas con valores seguros
- [ ] JWT_SECRET es una cadena aleatoria de 64+ caracteres
- [ ] Las contraseñas de base de datos son fuertes y únicas
- [ ] HTTPS está habilitado (Let's Encrypt recomendado)
- [ ] `NODE_ENV=production` está configurado
- [ ] CORS está restringido a tu dominio: `ALLOWED_ORIGINS=https://tudominio.com`
- [ ] El firewall permite solo puertos necesarios (80, 443)
- [ ] El usuario por defecto fue eliminado o cambió su contraseña
- [ ] Las dependencias están actualizadas: `npm audit fix`
- [ ] Los logs no contienen información sensible

**Ver [SECURITY.md](SECURITY.md) para la guía completa de seguridad.**

## Diagnóstico y Troubleshooting

### Backend no arranca
- **Error: "Missing required DB env vars"**: Crea el archivo `.env` en `prestamax-backend/`
- **Error: "JWT_SECRET is not set"**: Genera un secret fuerte y añádelo a `.env`
- **Error: "Cannot find module"**: Ejecuta `npm install` en `prestamax-backend/`

### Docker no funciona
- **Windows**: Asegúrate de que Docker Desktop esté en ejecución
- **Linux**: Verifica que tu usuario esté en el grupo docker: `sudo usermod -aG docker $USER`
- **Puerto 3306 ocupado**: Cambia el puerto en docker-compose.yml: `"3307:3306"`

### Problemas de conexión Frontend-Backend
- Verifica que el backend esté corriendo: `curl http://localhost:3001/health`
- Verifica la configuración de URLs en `js/config.js`
- Revisa la consola del navegador para errores CORS

## Desarrollo y Mantenimiento

### Actualizar dependencias
```bash
cd prestamax-backend
npm audit
npm audit fix
npm update
```

### Agregar nuevo usuario administrador
```bash
cd prestamax-backend
npm run create-user -- --username nuevouser --password "ContraseñaSegura123!"
```

### Ver logs de MySQL (Docker)
```bash
docker logs prestamax-mysql
```

### Backup de la base de datos
```bash
docker exec prestamax-mysql mysqldump -u root -p prestamax > backup-$(date +%Y%m%d).sql
```

## Próximas Mejoras Potenciales

- [ ] Tests unitarios y de integración
- [ ] Sistema de roles y permisos más granular
- [ ] Refresh tokens para JWT
- [ ] Autenticación de dos factores (2FA)
- [ ] Paginación en el backend para grandes volúmenes de datos
- [ ] Notificaciones por email
- [ ] API documentation con Swagger/OpenAPI

---

**Autor:** Ing. Marcelo Martinez Vallecillo / marktuay@gmail.com  
**Última actualización:** 2025-11-17 (Mejoras de seguridad implementadas)
