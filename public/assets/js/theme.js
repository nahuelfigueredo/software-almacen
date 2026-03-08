/* theme.js — Dark / Light mode toggle */
(function () {
  var html = document.documentElement;

  // Apply saved theme immediately (before DOM paint)
  var savedTheme = localStorage.getItem("mcn_theme") || "light";
  html.setAttribute("data-theme", savedTheme);

  function updateThemeIcon(theme) {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var icon = btn.querySelector(".theme-toggle__icon");
    if (icon) icon.textContent = theme === "light" ? "🌙" : "☀️";
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateThemeIcon(savedTheme);

    var themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    themeToggle.addEventListener("click", function () {
      var current = html.getAttribute("data-theme") || "light";
      var next = current === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      localStorage.setItem("mcn_theme", next);
      updateThemeIcon(next);
    });
  });
})();
