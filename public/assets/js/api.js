/* api.js — REST API client for backend routes */
var API = (function () {

  async function request(method, url, body) {
    var options = {
      method: method,
      headers: { "Content-Type": "application/json" }
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    var res = await fetch(url, options);
    if (!res.ok) {
      var err;
      try { err = await res.json(); } catch (_) { err = { error: res.statusText }; }
      throw new Error(err.error || res.statusText);
    }
    return res.json();
  }

  /* ── Products ─────────────────────────────────────── */
  var Products = {
    list: function ()       { return request("GET",    "/api/products"); },
    get:  function (id)     { return request("GET",    "/api/products/" + id); },
    create: function (data) { return request("POST",   "/api/products", data); },
    update: function (id, data) { return request("PUT", "/api/products/" + id, data); },
    remove: function (id)   { return request("DELETE", "/api/products/" + id); }
  };

  /* ── Sales ────────────────────────────────────────── */
  var Sales = {
    list: function (params) {
      var qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request("GET", "/api/sales" + qs);
    },
    get:    function (id)   { return request("GET",  "/api/sales/" + id); },
    create: function (data) { return request("POST", "/api/sales", data); }
  };

  /* ── Users ────────────────────────────────────────── */
  var Users = {
    list: function ()       { return request("GET",    "/api/users"); },
    get:  function (id)     { return request("GET",    "/api/users/" + id); },
    create: function (data) { return request("POST",   "/api/users", data); },
    update: function (id, data) { return request("PUT", "/api/users/" + id, data); },
    remove: function (id)   { return request("DELETE", "/api/users/" + id); }
  };

  /* ── Stock ────────────────────────────────────────── */
  var Stock = {
    movements: function (productId) {
      var qs = productId ? "?product_id=" + productId : "";
      return request("GET", "/api/stock" + qs);
    },
    adjust: function (data) { return request("POST", "/api/stock/adjust", data); }
  };

  /* ── Reports ──────────────────────────────────────── */
  var Reports = {
    daily: function (date) {
      var qs = date ? "?date=" + date : "";
      return request("GET", "/api/reports/daily" + qs);
    },
    weekly: function () { return request("GET", "/api/reports/weekly"); },
    topProducts: function () { return request("GET", "/api/reports/top-products"); },
    paymentMethods: function () { return request("GET", "/api/reports/payment-methods"); }
  };

  return { Products: Products, Sales: Sales, Users: Users, Stock: Stock, Reports: Reports };
})();
