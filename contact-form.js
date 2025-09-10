document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('infoForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                email: form.email.value
            };
            const res = await fetch('http://localhost:3001/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if(result.ok) {
                alert('¡Correo guardado correctamente!');
                form.reset();
            } else {
                alert('Hubo un error al guardar el correo.');
            }
        });
    }
});