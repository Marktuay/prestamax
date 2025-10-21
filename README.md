# Prestamax2

Proyecto web para simulación de préstamos y formulario de contacto.

## Estructura del proyecto


```
prestamax2/
├── index.html
├── consultas-reclamos.html
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
│   └── styles.css
├── images/
├── prestamax-backend/
│   ├── index.js
│   └── package.json
```


## Páginas principales

- **index.html**: Página principal con simulador y formulario de contacto.
- **consultas-reclamos.html**: Formulario para consultas, reclamos y quejas.
- **privacy-policy.html**: Política de Privacidad, describe el tratamiento de datos personales, cookies y derechos del usuario.
- **terms.html**: Términos y Condiciones, regula el uso del sitio, limitación de responsabilidad y propiedad intelectual.

## Archivos y scripts
- **styles.css**: Estilos globales.
- **script.js**: Calculadora de préstamos.
- **tab.js**: Control de pestañas.
- **contact-form.js**: Validación y envío de formulario de contacto.
- **consultas-form.js**: Validación y envío de formulario de consultas/reclamos.
- **hamburger-menu.js**: Menú responsivo.
- **cookies.js**: Banner y gestión de cookies.
- **prestamax-backend/index.js**: Backend Express para recibir y guardar datos en MySQL.


## Enlaces rápidos
- [Consultas, Reclamos y Quejas](consultas-reclamos.html)
- [Política de Privacidad](privacy-policy.html)
- [Términos y Condiciones](terms.html)

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
1. Abre `index.html` en tu navegador.
2. Asegúrate de que los scripts estén enlazados correctamente.

### Backend
1. Instala Node.js y npm.
2. Ve a la carpeta `prestamax-backend`:
   ```bash
   cd prestamax-backend
   npm install
   node index.js
   ```
3. El backend escuchará en el puerto 3001.

### Conexión con MySQL (opcional)
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
      mensaje TEXT
  );
  CREATE TABLE consultas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      apellido VARCHAR(255) NOT NULL,
      producto VARCHAR(100),
      tipo_asunto VARCHAR(100),
      descripcion TEXT,
      contacto VARCHAR(50),
      email VARCHAR(255) NOT NULL
  );
  ```
- Modifica `index.js` para conectar y guardar los datos en MySQL.

## Despliegue
- El frontend puede desplegarse en Vercel, GitHub Pages, Google cloud, etc.
- El backend Express debe desplegarse en Railway, Render, Heroku, google cloud, etc.
- Cambia la URL en `contact-form.js` para apuntar al backend público. (Nube)

## Notas
- El proyecto está listo para ampliarse: puedes agregar validaciones, guardar más datos, enviar correos, etc.
- Si usas MySQL en la nube, recuerda actualizar las credenciales y la configuración de conexión.

---

**Autor:** Ing. Marcelo Martinez Vallecillo / marktuay@gmail.com/ 
**Fecha:** Septiembre 2025
