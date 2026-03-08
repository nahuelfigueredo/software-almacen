/* charts.js — Chart.js helpers with MCN brand colors */

var MCNCharts = (function () {

  var colors = {
    primary: "#2BB3F3",
    light:   "#7CE8FF",
    dark:    "#0A66C2",
    neutral: "#94a3b8"
  };

  function gradientFill(ctx) {
    var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(124, 232, 255, 0.8)");
    gradient.addColorStop(1, "rgba(10, 102, 194, 0.2)");
    return gradient;
  }

  /* ── Ventas por hora (line chart) ─────────────────── */
  function createVentasPorHora(canvasId, labels, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    var ctx = canvas.getContext("2d");
    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels || ["9h","10h","11h","12h","13h","14h","15h","16h","17h","18h"],
        datasets: [{
          label: "Ventas ($)",
          data: data || [],
          borderColor: colors.primary,
          backgroundColor: gradientFill(ctx),
          tension: 0.4,
          fill: true,
          pointBackgroundColor: colors.primary
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  /* ── Productos más vendidos (horizontal bar) ──────── */
  function createProductosMasVendidos(canvasId, labels, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    var ctx = canvas.getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels || [],
        datasets: [{
          label: "Cantidad",
          data: data || [],
          backgroundColor: colors.primary,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }

  /* ── Métodos de pago (doughnut) ───────────────────── */
  function createMetodosPago(canvasId, labels, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    var ctx = canvas.getContext("2d");
    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels || ["Efectivo","Mercado Pago","Tarjeta","Transferencia"],
        datasets: [{
          data: data || [],
          backgroundColor: [colors.primary, colors.light, colors.dark, colors.neutral],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }

  /* ── Tendencia semanal (bar chart) ────────────────── */
  function createTendenciaSemanal(canvasId, labels, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    var ctx = canvas.getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels || ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
        datasets: [{
          label: "Ventas ($)",
          data: data || [],
          backgroundColor: colors.primary,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  return {
    colors: colors,
    createVentasPorHora: createVentasPorHora,
    createProductosMasVendidos: createProductosMasVendidos,
    createMetodosPago: createMetodosPago,
    createTendenciaSemanal: createTendenciaSemanal
  };
})();
