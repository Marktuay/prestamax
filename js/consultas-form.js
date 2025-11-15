document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-consultas');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    // Validación básica
      const nombre = form.nombre.value.trim();
      const apellido = form.apellido.value.trim();
    const producto = form.producto.value;
    const tipoAsunto = form.tipoAsunto.value;
    const descripcion = form.descripcion.value.trim();
    const contacto = form.contacto.value.trim();
    const email = form.email.value.trim();

    let errores = [];
      if (nombre.length < 2) errores.push('Nombre demasiado corto.');
      if (apellido.length < 2) errores.push('Apellido demasiado corto.');
    if (!producto) errores.push('Seleccione el tipo de producto.');
    if (!tipoAsunto) errores.push('Seleccione el tipo de asunto.');
    if (descripcion.length < 5) errores.push('La descripción es muy corta.');
    if (email.length < 5 || !email.includes('@')) errores.push('Correo inválido.');

    const mensajeDiv = document.getElementById('mensaje-form');
    mensajeDiv.style.display = 'none';
    mensajeDiv.innerHTML = '';
    if (errores.length > 0) {
      mensajeDiv.style.display = 'block';
      mensajeDiv.innerHTML = `<div class='mensaje-error'><i class='fas fa-exclamation-circle'></i> <strong>Corrige los siguientes errores:</strong><br>${errores.join('<br>')}</div>`;
      return;
    }

    // Enviar al backend
    try {
      const res = await fetch('http://localhost:3001/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, apellido, producto, tipoAsunto, descripcion, contacto, email })
      });
      const data = await res.json();
      if (data.ok) {
        mensajeDiv.style.display = 'block';
        mensajeDiv.innerHTML = `<div class='mensaje-exito'><i class='fas fa-check-circle'></i> <strong>¡Consulta enviada correctamente!</strong> Nos pondremos en contacto contigo pronto.</div>`;
        form.reset();
      } else {
        mensajeDiv.style.display = 'block';
        mensajeDiv.innerHTML = `<div class='mensaje-error'><i class='fas fa-exclamation-circle'></i> <strong>Error:</strong> ${data.message || 'No se pudo guardar.'}</div>`;
      }
    } catch (err) {
      mensajeDiv.style.display = 'block';
      mensajeDiv.innerHTML = `<div class='mensaje-error'><i class='fas fa-exclamation-circle'></i> <strong>Error de conexión con el servidor.</strong></div>`;
    }
  });
});
