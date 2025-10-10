// frontend/js/auth.js
// Simple auth helper client for your backend
// NOTE: this stores token in localStorage (easy for dev). For production, consider httpOnly cookies.

// Use a *different* name to avoid colliding with other global vars like the main page's API_BASE.
const AUTH_API_BASE = ''; // empty => same origin (useful when serving frontend from backend)

// Wrap in an IIFE so we only expose window.authClient
(function () {
  const _tokenKey = 'ptv_token';

  async function signup(username, password) {
    const res = await fetch(AUTH_API_BASE + '/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Signup failed');
    return data;
  }

  async function login(username, password) {
    const res = await fetch(AUTH_API_BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Login failed');
    return data;
  }

  function saveToken(token) { localStorage.setItem(_tokenKey, token); }
  function getToken() { return localStorage.getItem(_tokenKey); }
  function removeToken() { localStorage.removeItem(_tokenKey); }

  async function apiFetch(path, opts = {}) {
    const headers = opts.headers ? { ...opts.headers } : {};
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(AUTH_API_BASE + path, { ...opts, headers });
    return res;
  }

  function logout() { removeToken(); /* optionally tell server later */ }

  window.authClient = {
    signup, login, saveToken, getToken, removeToken, apiFetch, logout
  };
})();
