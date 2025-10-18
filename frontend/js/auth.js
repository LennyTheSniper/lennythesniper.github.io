// frontend/js/auth.js
// Simple auth helper client for your backend
// NOTE: this stores token in localStorage (easy for dev). For production, consider httpOnly cookies.

// Make available globally for all pages
window.API_BASE = "http://192.168.1.28:3000/api";

// Wrap in an IIFE so we only expose window.authClient
(function () {
  const _tokenKey = 'ptv_token';

  async function signup(username, password) {
    const res = await fetch(API_BASE + '/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Signup failed');
    return data;
  }

  async function login(username, password) {
    const res = await fetch(API_BASE + '/auth/login', {
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
    const res = await fetch(API_BASE + path, { ...opts, headers });
    return res;
  }

  function logout() { removeToken(); /* optionally tell server later */ }

  window.authClient = {
    signup, login, saveToken, getToken, removeToken, apiFetch, logout
  };
})();
