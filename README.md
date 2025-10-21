
# Prestamax2

Proyecto web para simulación de préstamos, gestión de consultas/reclamos y dashboard administrativo.

## Estructura del proyecto


```
prestamax2/
├── index.html
├── consultas-reclamos.html
├── dashboard.html (dashboard administrativo con login y filtros)
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
│   └── package.json
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
- **prestamax-backend/index.js**: Backend Express para recibir y guardar datos en MySQL, autenticación, logs y seguridad.


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

## Diagnóstico y verificación del backend

- Para comprobar que el backend y la base de datos funcionan correctamente, puedes acceder a las rutas de diagnóstico:
  - [http://localhost:3001/debug/last-contact](http://localhost:3001/debug/last-contact): Últimos 10 registros del formulario de contacto.
  - [http://localhost:3001/debug/consultas](http://localhost:3001/debug/consultas): Últimos 10 registros del formulario de consultas/reclamos.

- En la terminal donde ejecutas el backend (`node index.js`) verás logs de cada petición recibida y cualquier error de MySQL.

- Para consultar manualmente la base de datos desde la terminal:
  ```bash
  mysql -u root -p -D prestamax -e "SELECT * FROM correos ORDER BY id DESC LIMIT 10;"
  mysql -u root -p -D prestamax -e "SELECT * FROM consultas ORDER BY id DESC LIMIT 10;"
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
- Modifica `index.js` para conectar y guardar los datos en MySQL.

## Despliegue
- El frontend puede desplegarse en Vercel, GitHub Pages, Google cloud, etc.
- El backend Express debe desplegarse en Railway, Render, Heroku, google cloud, etc.
- Cambia la URL en `contact-form.js` para apuntar al backend público. (Nube)

## Notas
- El proyecto está listo para ampliarse: puedes agregar validaciones, gestión de usuarios, logs, roles y más seguridad.
- Si usas MySQL en la nube, recuerda actualizar las credenciales y la configuración de conexión.
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

### Backend (prestamax-backend/index.js)
- Node.js + Express + MySQL2.
- Autenticación básica con usuarios y contraseñas hasheadas (bcrypt).
- Validación de datos (express-validator).
- Rutas protegidas para consultas y contactos.
- Creación automática de tablas: usuarios, logs, consultas, correos.
- Registro de logs de acceso y acciones.

### Base de datos
- Tablas: usuarios, logs, consultas, correos.
- Estructura lista para ampliación (CRUD, roles, logs).

## Guía para futuras mejoras

1. **CRUD completo**: Agregar edición, alta y baja de registros desde el dashboard.
2. **Roles de usuario**: Implementar roles (admin, operador) y vistas diferenciadas.
3. **Gestión de logs**: Sección exclusiva para admins con historial de accesos y acciones.
4. **Mejoras visuales**: Optimizar responsividad y experiencia de usuario.
5. **Auditoría y seguridad**: Validaciones extra y registro de cambios.

### Para retomar el desarrollo
- El dashboard y backend están listos para ampliar con CRUD y roles.
- La estructura de logs y usuarios ya está implementada.
- Siga la hoja de ruta anterior para continuar.

---
**Autor:** Ing. Marcelo Martinez Vallecillo / marktuay@gmail.com/ 
**Fecha:** Octubre 2025
