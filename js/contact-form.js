document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('infoForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            // Validaciones frontend
            const nombre = form.nombre.value.trim();
            const email = form.email.value.trim();
            const telefono = form.telefono.value.trim();
            const producto = form.producto.value;
            const mensaje = form.mensaje.value.trim();

            let errores = [];
            if (nombre.length < 2 || nombre.length > 100) errores.push('Nombre inválido.');
            if (!/^\S+@\S+\.\S+$/.test(email)) errores.push('Correo electrónico inválido.');
            if (telefono && (telefono.length < 7 || telefono.length > 20)) errores.push('Teléfono inválido.');
            if (!['hipotecario', 'colaboradores'].includes(producto)) errores.push('Producto inválido.');
            if (mensaje.length < 5 || mensaje.length > 1000) errores.push('Mensaje inválido.');

            if (errores.length > 0) {
                alert('Errores en el formulario:\n' + errores.join('\n'));
                return;
            }

            const data = { nombre, email, telefono, producto, mensaje };
            const res = await fetch('http://localhost:3001/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if(result.ok) {
                alert('¡Datos enviados correctamente!');
                form.reset();
            } else {
                alert('Error: ' + (result.message || 'No se pudo enviar la solicitud.'));
            }
        });
    }
});