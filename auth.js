/* auth.js — Authentication module */

const Auth = (() => {
  // ── Private helpers ──────────────────────────
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('adverse_users') || '[]'); }
    catch { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem('adverse_users', JSON.stringify(users));
  }
  function getStoredUser() {
    try { return JSON.parse(localStorage.getItem('adverse_user') || 'null'); }
    catch { return null; }
  }
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  }
  function hideError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  }
  function showSuccess(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
  }
  function setBtn(id, html, disabled) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.innerHTML = html;
    btn.disabled = disabled;
  }

  // ── Public API ───────────────────────────────
  function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((t, i) => {
      t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'signup'));
    });
    const lf = document.getElementById('login-form');
    const sf = document.getElementById('signup-form');
    if (lf) lf.style.display = tab === 'login' ? 'flex' : 'none';
    if (sf) sf.style.display = tab === 'signup' ? 'flex' : 'none';
    // Clear errors when switching
    hideError('login-error');
    hideError('signup-error');
  }

  function togglePw(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    inp.type = inp.type === 'text' ? 'password' : 'text';
    btn.style.opacity = inp.type === 'password' ? '1' : '0.5';
  }

  function login() {
    const email    = (document.getElementById('login-email')?.value || '').trim();
    const password = document.getElementById('login-password')?.value || '';
    hideError('login-error');

    if (!email)              { showError('login-error', 'Please enter your email.'); return; }
    if (!email.includes('@')){ showError('login-error', 'Enter a valid email address.'); return; }
    if (!password)           { showError('login-error', 'Please enter your password.'); return; }

    setBtn('login-btn', '<div class="spinner"></div>', true);

    setTimeout(() => {
      const users = getUsers();
      const found = users.find(u => u.email === email && u.password === password);

      if (found) {
        _loginSuccess(found);
      } else if (!users.find(u => u.email === email)) {
        // No account with that email — demo mode: allow any valid login
        _loginSuccess({ name: email.split('@')[0], email });
      } else {
        showError('login-error', 'Incorrect password. Please try again.');
        setBtn('login-btn', 'Sign In', false);
      }
    }, 1000);
  }

  function signup() {
    const name     = (document.getElementById('signup-name')?.value || '').trim();
    const email    = (document.getElementById('signup-email')?.value || '').trim();
    const password = document.getElementById('signup-password')?.value || '';
    hideError('signup-error');

    if (!name)               { showError('signup-error', 'Please enter your name.'); return; }
    if (!email.includes('@')){ showError('signup-error', 'Enter a valid email address.'); return; }
    if (password.length < 8) { showError('signup-error', 'Password must be at least 8 characters.'); return; }

    setBtn('signup-btn', '<div class="spinner"></div>', true);

    setTimeout(() => {
      const users = getUsers();
      if (users.find(u => u.email === email)) {
        showError('signup-error', 'An account with this email already exists.');
        setBtn('signup-btn', 'Create Account', false);
        return;
      }
      const newUser = { name, email, password };
      users.push(newUser);
      saveUsers(users);
      showSuccess('signup-success');
      setTimeout(() => _loginSuccess(newUser), 900);
    }, 1000);
  }

  function social(provider) {
    UI.toast(`${provider} login coming in Phase 4 with Supabase! 🚀`);
  }

  function _loginSuccess(user) {
    localStorage.setItem('adverse_user', JSON.stringify(user));
    // Show main app
    const authEl = document.getElementById('auth-screen');
    const appEl  = document.getElementById('main-app');
    if (authEl) authEl.classList.add('hidden');
    if (appEl)  appEl.style.display = 'flex';
    // Update UI with user info
    const firstName = (user.name || 'There').split(' ')[0];
    const greeting  = document.getElementById('home-greeting');
    const avatar    = document.getElementById('home-avatar');
    const uname     = document.getElementById('home-uname');
    if (greeting) greeting.innerHTML = `${firstName} <span class="grad-text">✦</span>`;
    if (avatar)   avatar.textContent = firstName[0].toUpperCase();
    if (uname)    uname.textContent  = firstName;
    // Load Audius tracks now that we're in the app
    if (typeof Audius !== 'undefined') Audius.load();
  }

  function checkSession() {
    const user = getStoredUser();
    if (user && user.email) {
      _loginSuccess(user);
      return true;
    }
    return false;
  }

  return { switchTab, togglePw, login, signup, social, checkSession };
})();
