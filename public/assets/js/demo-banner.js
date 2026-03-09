(function () {
  // Check demo mode from server
  fetch('/api/demo/status')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.demoMode) return;

      localStorage.setItem('demoMode', 'true');

      document.body.insertAdjacentHTML('afterbegin', [
        '<div id="demo-banner" style="',
        'position:fixed;top:0;left:0;right:0;',
        'background:linear-gradient(135deg,#ff6b6b 0%,#ff5252 100%);',
        'color:white;padding:12px 20px;text-align:center;',
        'z-index:10000;font-weight:600;',
        'box-shadow:0 2px 10px rgba(0,0,0,0.2);',
        'display:flex;align-items:center;justify-content:center;gap:20px;',
        '">',
        '<span>🎨 MODO DEMOSTRACIÓN - Datos de prueba</span>',
        '<button onclick="resetDemo()" style="',
        'background:white;color:#ff5252;border:none;',
        'padding:6px 16px;border-radius:4px;font-weight:600;cursor:pointer;',
        '">Resetear Demo</button>',
        '</div>'
      ].join(''));

      document.body.style.paddingTop = '50px';
    })
    .catch(function () {
      // Server not in demo mode or not reachable — clear flag
      localStorage.removeItem('demoMode');
    });
})();

function resetDemo() {
  if (!confirm('¿Resetear todos los datos de demostración?')) return;

  fetch('/api/demo/reset', { method: 'POST' })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.success) {
        alert('✅ Demo reseteado. El servidor se reiniciará. Recargue la página en unos segundos...');
        setTimeout(function () { location.reload(); }, 3000);
      } else {
        alert('❌ Error: ' + data.message);
      }
    })
    .catch(function () {
      alert('❌ Error de conexión');
    });
}
