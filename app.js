/* app.js — Entry point. Runs after all other scripts load. */

(function init() {
  // ── Clock ──────────────────────────────────
  function updateClock() {
    const now  = new Date();
    const h    = now.getHours();
    const m    = now.getMinutes().toString().padStart(2, '0');
    const time = document.getElementById('status-time');
    const greet = document.getElementById('greeting-text');
    if (time)  time.textContent  = `${h}:${m}`;
    if (greet) greet.textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ── Enter key on auth inputs ────────────────
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const loginForm  = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm  && loginForm.style.display  !== 'none') Auth.login();
    else if (signupForm && signupForm.style.display !== 'none') Auth.signup();
  });

  // ── Check for existing session ──────────────
  // Auth.checkSession() will show the app if a session exists,
  // otherwise the auth screen stays visible (it's shown by default)
  Auth.checkSession();
})();
