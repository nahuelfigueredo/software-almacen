// Detectar si estamos en modo demo
async function checkDemoMode() {
  try {
    const response = await fetch('/api/demo/info');
    if (response.ok) {
      const info = await response.json();
      if (info.demoMode && info.bannerEnabled) {
        showDemoBanner();
      }
    }
  } catch (error) {
    // No hacer nada si el endpoint no existe
  }
}

function showDemoBanner() {
  const banner = document.createElement('div');
  banner.className = 'demo-banner';
  banner.innerHTML = `
    <span class="demo-banner__icon">🎨</span>
    <span>MODO DEMO - Los datos se resetean automáticamente</span>
    <button class="demo-banner__button" onclick="resetDemoData()">
      🔄 Resetear Ahora
    </button>
  `;
  document.body.prepend(banner);

  // Agregar estilos
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/assets/css/demo-banner.css';
  document.head.appendChild(link);
}

async function resetDemoData() {
  if (!confirm('¿Resetear todos los datos de demo? Esta acción reiniciará el servidor.')) {
    return;
  }

  try {
    const response = await fetch('/api/demo/reset', { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      alert('✅ Datos reseteados. El servidor se reiniciará...');
      setTimeout(() => location.reload(), 3000);
    }
  } catch (error) {
    alert('❌ Error al resetear datos: ' + error.message);
  }
}

// Auto-ejecutar al cargar
checkDemoMode();
