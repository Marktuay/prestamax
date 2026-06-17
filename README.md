

Proyecto web para simulación de préstamos, recepción de contactos y consultas/reclamos, y un dashboard administrativo para revisarlos.

Este README fue actualizado para reflejar cambios recientes en el backend (autenticación por JWT, endpoints de diagnóstico, soporte para Docker MySQL) y las utilidades añadidas (script para crear/actualizar usuarios y docker-compose para la base de datos).

## Resumen rápido
- Backend: Node.js + Express, MySQL (mysql2), validación con express-validator, hashing con bcrypt, autenticación JWT con `jsonwebtoken`.
- Persistencia: MySQL (es recomendable usar Docker Compose incluido para desarrollo).
- Autenticación: POST `/login` devuelve token JWT (Bearer). Endpoints administrativos protegidos aceptan Bearer JWT o Basic como fallback.

## Estructura del proyecto

```
prestamax/
├── index.html
├── consultas-reclamos.html
├── dashboard.html
├── privacy-policy.html
├── terms.html
├── js/
├── css/
├── images/
└── prestamax-backend/
  ├── index.js
  ├── package.json
  ├── .env.example
  └── db-init/ (scripts SQL para inicializar la base en Docker)
```

## Qué cambió (puntos clave)
- Se añadió `docker-compose.yml` en la raíz y `prestamax-backend/db-init/init.sql` para crear la base `prestamax` y las tablas necesarias automáticamente al iniciar el contenedor MySQL.
- Se implementó un endpoint de login: POST `/login` que devuelve un JWT (expira en 1h). Los endpoints administrativos (`/debug/*`) aceptan `Authorization: Bearer <token>`.
- Se agregó un script utilitario `prestamax-backend/scripts/create_user.js` y un npm script `create-user` para crear/actualizar usuarios en la tabla `usuarios` con contraseña hasheada.
- Se añadió `/health` para comprobaciones rápidas.

## Requisitos
- Node.js 16+ (o LTS recomendable)
- npm
- Docker Desktop (recomendado para levantar MySQL localmente) o MySQL instalado en la máquina

## Configuración y puesta en marcha (recomendado: Docker)

1) Copia o revisa el archivo de ejemplo de variables de entorno:


2) Arrancar MySQL con Docker (desde la raíz del repo):

```powershell
# Levanta el servicio MySQL (contenerizado) y ejecuta los scripts de init
docker compose up -d
```

El `docker-compose.yml` monta `prestamax-backend/db-init` en `/docker-entrypoint-initdb.d`, por lo que la base y las tablas se crean al primer arranque.

3) Instalar dependencias y arrancar el backend:

```powershell
cd prestamax-backend
npm install
node index.js
# o si tienes definido npm start: npm start
```

4) Crear o actualizar el usuario admin (ejemplo):

```powershell
# Desde la carpeta prestamax-backend
npm run create-user -- --username admin --password "PresMaxTa25!"
```

5) Verificar que el backend está arriba:

```powershell
# Endpoint health
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
```

6) Probar login (obtendrás un token JWT):

```powershell
$body = '{"username":"admin","password":"PresMaxTa25!"}'
Invoke-RestMethod -Uri "http://localhost:3001/login" -Method POST -ContentType "application/json" -Body $body
```

La respuesta contiene { ok: true, token: "..." } — usa ese token en el header Authorization: Bearer <token> al consultar `/debug/*`.

## Endpoints útiles
- POST /contact — guarda mensajes desde el formulario público.
- POST /consultas — guarda consultas/reclamos.
- POST /login — devuelve JWT si las credenciales son correctas.
- GET /health — estado del servicio.
- GET /debug/last-contact — (protegido) últimos contactos.
- GET /debug/consultas — (protegido) últimas consultas.
- GET /debug/logs — (protegido) logs/alertas (mensajes sospechosos).
- POST /import-excel — (protegido) importa filas desde el dashboard (envía JSON con tipo y rows).

Protección: los endpoints `/debug/*` requieren `Authorization` con Bearer token (JWT) o, como fallback, Basic Auth (usuario:contraseña en base64).

## Dashboard (cliente)
- `dashboard.html` fue actualizado para usar el endpoint `/login` y enviar el token JWT en `Authorization: Bearer <token>` cuando realiza peticiones administrativas.
- Para depuración rápida en local puedes abrir `dashboard.html` desde el filesystem, pero para un entorno parecido a producción sirve desplegar el frontend y apuntarlo al backend (cambiar la URL en los scripts si es necesario).
- Para configurar el endpoint del backend sin editar el archivo, define `window.PRESTAMAX_API_BASE` antes de cargar `dashboard.html` (por defecto usa `http://localhost:3002`).

## Base de datos (si no usas Docker)
Si prefieres instalar MySQL localmente, crea la base y tablas (ejemplo):

```sql
CREATE DATABASE prestamax;
USE prestamax;
-- correos, consultas, usuarios, logs (ver archivo prestamax-backend/db-init/init.sql para la estructura exacta)
```

## Seguridad y recomendaciones
- Cambia `JWT_SECRET` por un secreto fuerte en producción y no lo subas a Git.
- Ejecuta el backend detrás de HTTPS en producción.
- Añadir `helmet` y `express-rate-limit` en el backend mejora la seguridad (podemos agregarlo si quieres).
- Limita CORS al dominio del frontend en producción.
- Considerar rotación de claves y mecanismo de revocación/blacklist para tokens si fuera necesario.

## Diagnóstico y troubleshooting
- Si `docker compose up` falla en Windows, asegúrate de que Docker Desktop esté en ejecución.
- Si `node index.js` lanza "Cannot find module 'dotenv'", ejecuta `npm install` en `prestamax-backend`.
- Si `/login` devuelve 404 revisa que el backend ejecutado sea la versión actual que incluye el endpoint (el `index.js` actualizado coloca /login antes del middleware 404).

## Desarrollo y próximos pasos
- Añadir helmet + rate-limit, forzar HTTPS y restringir CORS.
- Añadir tests unitarios para rutas críticas (login, inserciones de forms) y un test de integración rápido.
- Implementar manejo de roles y UI de administración de usuarios.

---

**Autor:** Ing. Marcelo Martinez Vallecillo / marktuay@gmail.com
**Fecha actualización:** 2025-11-11
# Prestamax

Proyecto web para simulación de préstamos, gestión de consultas/reclamos y dashboard administrativo.

## Estructura del proyecto

```
prestamax/
├── index.html
├── consultas-reclamos.html
├── dashboard.html
├── privacy-policy.html
├── terms.html
├── js/
│   ├── script.js
│   ├── tab.js
│   ├── contact-form.js
│   ├── consultas-form.js
│   ├── hamburger-menu.js
│   └── cookies.js
├── css/
│   ├── styles.css
│   └── dashboard.css
├── images/
├── prestamax-backend/
│   ├── index.js
│   ├── package.json
│   └── .env (no se sube a GitHub)
```

## Páginas principales

- **index.html**: Página principal con simulador y formulario de contacto.
- **consultas-reclamos.html**: Formulario para consultas, reclamos y quejas.
- **dashboard.html**: Dashboard administrativo con login, autenticación, paginación, filtros avanzados, exportación a CSV/Excel, indicadores, notificaciones y cierre por inactividad.
- **privacy-policy.html**: Política de Privacidad, describe el tratamiento de datos personales, cookies y derechos del usuario.
- **terms.html**: Términos y Condiciones, regula el uso del sitio, limitación de responsabilidad y propiedad intelectual.

## Archivos y scripts
- **styles.css**: Estilos globales.
- **dashboard.css**: Estilos modernos para el dashboard administrativo.
- **script.js**: Calculadora de préstamos.
- **tab.js**: Control de pestañas.
- **contact-form.js**: Validación y envío de formulario de contacto.
- **consultas-form.js**: Validación y envío de formulario de consultas/reclamos.
- **hamburger-menu.js**: Menú responsivo.
- **cookies.js**: Banner y gestión de cookies.
- **prestamax-backend/index.js**: Backend Express para recibir y guardar datos en MySQL, autenticación, logs, seguridad y detección de mensajes sospechosos.


## Enlaces rápidos
- [Consultas, Reclamos y Quejas](consultas-reclamos.html)
- [Política de Privacidad](privacy-policy.html)
- [Términos y Condiciones](terms.html)

## Funcionalidades del dashboard

- **Login y autenticación**: Acceso protegido con usuario y contraseña (hash en MySQL).
- **Paginación**: Navegación por páginas de 10 registros.
- **Ordenar columnas**: Haz clic en los encabezados para ordenar los registros.
- **Filtros avanzados**: Filtra por rango de fechas, tipo de asunto, producto, nombre, email, etc.
- **Exportar CSV/Excel**: Descarga los registros en formato CSV o Excel.
- **Indicadores visuales**: Totales y desglose por tipo de registro.
- **Notificaciones**: Mensajes tipo toast al cargar, exportar o cerrar sesión.
- **Cierre por inactividad**: La sesión se cierra automáticamente tras 10 minutos sin actividad.
- **Estructura para logs y roles**: Listo para agregar logs de actividad y gestión de usuarios con privilegios.
- **Alertas de mensajes sospechosos**: El backend detecta palabras clave en los mensajes y los registra en la tabla logs. Puedes visualizar estas alertas en el dashboard.

## Diagnóstico y verificación del backend

- Para comprobar que el backend y la base de datos funcionan correctamente, puedes acceder a las rutas de diagnóstico:
  - [http://localhost:3001/debug/last-contact](http://localhost:3001/debug/last-contact): Últimos 10 registros del formulario de contacto.
  - [http://localhost:3001/debug/consultas](http://localhost:3001/debug/consultas): Últimos 10 registros del formulario de consultas/reclamos.
  - [http://localhost:3001/debug/logs](http://localhost:3001/debug/logs): Últimas alertas de mensajes sospechosos detectados por IA.

- En la terminal donde ejecutas el backend (`node index.js`) verás logs de cada petición recibida y cualquier error de MySQL.

- Para consultar manualmente la base de datos desde la terminal:
  ```bash
  mysql -u root -p -D prestamax -e "SELECT * FROM correos ORDER BY id DESC LIMIT 10;"
  mysql -u root -p -D prestamax -e "SELECT * FROM consultas ORDER BY id DESC LIMIT 10;"
  mysql -u root -p -D prestamax -e "SELECT * FROM logs WHERE action = 'mensaje_sospechoso' ORDER BY fecha DESC LIMIT 10;"
  ```

## Instalación y ejecución

### Frontend
1. Abre `index.html` o `dashboard.html` en tu navegador.
2. Asegúrate de que los scripts y estilos estén enlazados correctamente.

### Backend
1. Instala Node.js y npm.
2. Ve a la carpeta `prestamax-backend`:
   ```bash
   cd prestamax-backend
   npm install
   node index.js
   ```
3. El backend escuchará en el puerto 3001 y creará automáticamente las tablas necesarias (usuarios, correos, consultas, logs).
4. Crea el archivo `.env` con los datos de conexión a MySQL:
   ```env
   DB_HOST=tu_host_mysql
   DB_USER=tu_usuario_mysql
   DB_PASS=tu_contraseña_mysql
   DB_NAME=tu_base_de_datos
   DB_PORT=tu_puerto_mysql
   ```

### Conexión con MySQL
- Instala MySQL y crea la base de datos y tablas:
  ```sql
  CREATE DATABASE prestamax;
  USE prestamax;
  CREATE TABLE correos (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,            
    telefono VARCHAR(50),
    producto VARCHAR(100),
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE consultas (
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
  CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  );
  CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    action VARCHAR(100),
    details TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

## Despliegue y migración
- El frontend puede desplegarse en Vercel, GitHub Pages, Google Cloud, etc.
- El backend Express debe desplegarse en Railway, Render, Heroku, Google Cloud, etc.
- Cambia la URL en los scripts JS para apuntar al backend público.
- Al migrar, solo actualiza el archivo `.env` o las variables de entorno en la nube para conectar al nuevo servidor MySQL.
- Asegúrate de que el backend tenga acceso a la base de datos (firewall, permisos, etc.).

## Seguridad y buenas prácticas
- El backend nunca expone datos sensibles al frontend, solo responde a solicitudes HTTP.
- El archivo `.env` nunca debe subirse a GitHub (está en `.gitignore`).
- El frontend nunca se conecta directo a MySQL, solo al backend por HTTP.
- Para migrar a la nube, solo cambia la configuración en `.env` o en el panel de tu proveedor.
- La detección de mensajes sospechosos ayuda a prevenir fraudes y mejorar la seguridad del sistema.

## Notas
- El dashboard incluye estructura para roles y logs, y puede ampliarse fácilmente para administración avanzada.

---


## Resumen de funcionalidades actuales

### Frontend (dashboard.html)
- Login seguro con autenticación básica.
- Visualización de registros de consultas/reclamos y contactos.
- Paginación, ordenación y búsqueda en tablas.
- Filtros avanzados por fecha, tipo de asunto y producto.
- Exportación de datos a CSV y Excel (SheetJS).
- Indicadores visuales de totales y desglose por tipo.
- Notificaciones tipo toast para acciones y errores.
- Cierre automático de sesión por inactividad (10 min).
- Interfaz moderna y responsiva (dashboard.css).
- Visualización de alertas de mensajes sospechosos detectados por IA.

### Backend (prestamax-backend/index.js)
- Node.js + Express + MySQL2.
- Autenticación básica con usuarios y contraseñas hasheadas (bcrypt).
- Validación de datos (express-validator).
- Rutas protegidas para consultas, contactos y logs.
- Creación automática de tablas: usuarios, logs, consultas, correos.
- Registro de logs de acceso, acciones y alertas de mensajes sospechosos.
- Detección automática de mensajes sospechosos por palabras clave.

### Base de datos
- Tablas: usuarios, logs, consultas, correos.
- Estructura lista para ampliación (CRUD, roles, logs).

## Guía para futuras mejoras

1. **CRUD completo**: Agregar edición, alta y baja de registros desde el dashboard.
2. **Roles de usuario**: Implementar roles (admin, operador) y vistas diferenciadas.
3. **Gestión de logs**: Sección exclusiva para admins con historial de accesos y acciones.
4. **Mejoras visuales**: Optimizar responsividad y experiencia de usuario.
5. **Auditoría y seguridad**: Validaciones extra y registro de cambios.
6. **Mejorar la detección de anomalías**: Integrar modelos de IA más avanzados para análisis de patrones y prevención de fraude.

### Para retomar el desarrollo
- El dashboard y backend están listos para ampliar con CRUD y roles.
- La estructura de logs y usuarios ya está implementada.
- Siga la hoja de ruta anterior para continuar.

---
**Autor:** Ing. Marcelo Martinez Vallecillo / marktuay@gmail.com/ 
**Fecha:** Octubre 2025
