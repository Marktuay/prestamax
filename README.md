# Prestamax2

Proyecto web para simulación de préstamos y formulario de contacto.

## Estructura del proyecto

```
prestamax2/
├── index.html
├── js/
│   ├── script.js
│   ├── tab.js
│   ├── contact-form.js
│   └── hamburger-menu.js
├── css/
│   └── styles.css
├── images/
├── prestamax-backend/
│   ├── index.js
│   └── package.json
```

## Descripción de archivos principales

- **index.html**: Página principal con formulario de simulación y contacto.
- **styles.css**: Estilos para la página web.
- **script.js**: Calculadora de préstamos (monto, plazo, tipo, tasa, cuota mensual).
- **tab.js**: Control de pestañas (tabs) en la interfaz.
- **contact-form.js**: Envía datos del formulario de contacto al backend.
- **prestamax-backend/index.js**: Backend Express para recibir y guardar correos (o más datos) enviados desde el formulario.

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
- Instala MySQL y crea la base de datos y tabla:
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
