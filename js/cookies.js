// js/cookies.js
// Banner y lógica para aceptar cookies y guardar preferencia

document.addEventListener('DOMContentLoaded', function() {
  // Si ya aceptó cookies, no mostrar el banner
  if (getCookie('cookies_aceptadas') === 'si') return;

  // Crear banner
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner-content">
      Este sitio utiliza cookies para mejorar tu experiencia. <button id="aceptar-cookies">Aceptar</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('aceptar-cookies').onclick = function() {
    document.cookie = "cookies_aceptadas=si; expires=Fri, 31 Dec 2027 23:59:59 GMT; path=/";
    banner.remove();
  };
});

// Función para leer cookies
function getCookie(nombre) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${nombre}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
