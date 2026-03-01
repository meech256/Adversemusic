/* ui.js — Navigation, Search, Panels, Toast, Audius */

// ── Toast ─────────────────────────────────────────
const UI = (() => {
  let _timer = null;
  function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_timer);
    _timer = setTimeout(() => el.classList.remove('show'), 2400);
  }
  return { toast };
})();

// ── Navigation ────────────────────────────────────
const Nav = (() => {
  let current = 'home';
  let following = false;

  function go(name) {
    const prev = document.getElementById(`screen-${current}`);
    if (prev) {
      prev.classList.remove('active');
      prev.classList.add('exit-left');
      setTimeout(() => prev.classList.remove('exit-left'), 350);
    }
    const next = document.getElementById(`screen-${name}`);
    if (next) next.classList.add('active');
    current = name;

    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      const svg = el.querySelector('svg');
      if (svg) svg.style.stroke = '';
      const lbl = el.querySelector('.nav-label');
      if (lbl) lbl.style.color = '';
    });
    const navEl = document.getElementById(`nav-${name}`);
    if (navEl) navEl.classList.add('active');
  }

  function libTab(el, tab) {
    document.querySelectorAll('.lib-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    ['playlists','albums','artists','downloads'].forEach(t => {
      const el2 = document.getElementById(`lib-${t}`);
      if (el2) el2.style.display = t === tab ? '' : 'none';
    });
  }

  function toggleFollow() {
    following = !following;
    const btn = document.getElementById('follow-btn');
    if (btn) {
      btn.textContent = following ? 'Following ✓' : 'Follow';
      btn.classList.toggle('following', following);
    }
    UI.toast(following ? '✅ Following Wizkid' : 'Unfollowed Wizkid');
  }

  return { go, libTab, toggleFollow };
})();

// ── Search ────────────────────────────────────────
const Search = (() => {
  let _timeout = null;

  function query(q) {
    const clear   = document.getElementById('search-clear');
    const browse  = document.getElementById('browse-view');
    const results = document.getElementById('search-results-view');
    if (clear)   clear.classList.toggle('visible', q.length > 0);
    if (!q.trim()) {
      if (browse)  browse.style.display  = '';
      if (results) results.style.display = 'none';
      return;
    }
    if (browse)  browse.style.display  = 'none';
    if (results) results.style.display = '';
    const list = document.getElementById('search-results-list');
    if (list) list.innerHTML = '<div style="padding:24px;text-align:center"><div class="spinner"></div></div>';
    clearTimeout(_timeout);
    _timeout = setTimeout(() => _run(q), 350);
  }

  function _run(q) {
    const lower = q.toLowerCase();
    const localFound = ALL_SEARCH_TRACKS.filter(t =>
      t.name.toLowerCase().includes(lower) || t.artist.toLowerCase().includes(lower)
    );
    const audiusFound = audiusTracks.filter(t =>
      (t.title || '').toLowerCase().includes(lower) ||
      (t.user?.name || '').toLowerCase().includes(lower)
    );

    const total = localFound.length + audiusFound.length;
    const label = document.getElementById('results-label');
    if (label) label.textContent = total ? `${total} Result${total !== 1 ? 's' : ''}` : 'No Results';

    const list = document.getElementById('search-results-list');
    if (!list) return;

    if (!total) {
      list.innerHTML = `<div class="no-results"><span style="font-size:40px;display:block;margin-bottom:10px">🔍</span>No results for "<strong>${q}</strong>"<br><br>Try a different search</div>`;
      return;
    }

    const EMOJIS = ['🎵','🎶','🎸','🎹','🎤','🥁'];
    const BGS    = ['c-purple','c-teal','c-rose','c-gold','c-green','c-blue'];

    const localHTML = localFound.map(t => {
      const ti = TRACKS.findIndex(tr => tr.name === t.name);
      return `<div class="track-row" onclick="Player.play(${ti >= 0 ? ti : 0})">
        <div class="track-thumb ${t.bg}">${t.emoji || '🎵'}</div>
        <div class="track-info"><div class="track-name">${_hl(t.name, lower)}</div><div class="track-artist">${_hl(t.artist, lower)}</div></div>
        <div class="track-dur">${fmt(t.duration)}</div>
      </div>`;
    }).join('');

    const audiusHTML = audiusFound.map((t, i) => {
      const ai = audiusTracks.indexOf(t);
      return `<div class="track-row" onclick="Player.playAudius(${ai})">
        <div class="track-thumb ${BGS[i % 6]}">${EMOJIS[i % 6]}</div>
        <div class="track-info">
          <div class="track-name">${_hl(t.title || '', lower)} <span style="color:var(--a1);font-size:10px;font-weight:700;font-family:'Syne',sans-serif">LIVE</span></div>
          <div class="track-artist">${_hl(t.user?.name || '', lower)}</div>
        </div>
        <div class="track-dur">${fmt(t.duration || 180)}</div>
      </div>`;
    }).join('');

    list.innerHTML = localHTML + audiusHTML;
  }

  function _hl(text, q) {
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return text;
    return text.slice(0, i) + `<span style="color:var(--a1);font-weight:700">${text.slice(i, i + q.length)}</span>` + text.slice(i + q.length);
  }

  function clear() {
    const inp = document.getElementById('search-input');
    if (inp) { inp.value = ''; inp.focus(); }
    query('');
  }

  function genre(g) {
    const inp = document.getElementById('search-input');
    if (inp) inp.value = g;
    query(g);
  }

  return { query, clear, genre };
})();

// ── Sleep & Crossfade Panels ─────────────────────
const Panels = (() => {
  let sleepRemaining = 0;
  let sleepInterval  = null;
  let cfSecs         = 3;

  function _backdrop(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', show);
  }
  function _panel(id, open) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('open', open);
  }

  function openSleep()  { _panel('sleep-panel', true);  _backdrop('sleep-backdrop', true); }
  function closeSleep() { _panel('sleep-panel', false); _backdrop('sleep-backdrop', false); }

  function setSleep(mins, el) {
    document.querySelectorAll('.sleep-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    clearInterval(sleepInterval);
    sleepRemaining = mins * 60;
    const cd  = document.getElementById('sleep-countdown');
    const btn = document.getElementById('sleep-btn');
    if (cd)  cd.style.display = 'block';
    if (btn) btn.classList.add('active');

    sleepInterval = setInterval(() => {
      sleepRemaining--;
      const m = Math.floor(sleepRemaining / 60);
      const s = sleepRemaining % 60;
      if (cd) cd.textContent = `⏱ Stopping in ${m}:${s.toString().padStart(2,'0')}`;
      if (sleepRemaining <= 0) {
        clearInterval(sleepInterval);
        Player.togglePlay();
        UI.toast('😴 Sleep timer — goodnight!');
        if (cd)  cd.style.display = 'none';
        if (btn) btn.classList.remove('active');
        closeSleep();
      }
    }, 1000);

    UI.toast(`🌙 Music stops in ${mins} min`);
    closeSleep();
  }

  function cancelSleep() {
    clearInterval(sleepInterval);
    sleepRemaining = 0;
    const cd  = document.getElementById('sleep-countdown');
    const btn = document.getElementById('sleep-btn');
    if (cd)  cd.style.display = 'none';
    if (btn) btn.classList.remove('active');
    document.querySelectorAll('.sleep-opt').forEach(o => o.classList.remove('active'));
    UI.toast('Sleep timer cancelled');
    closeSleep();
  }

  function openCrossfade()  { _panel('cf-panel', true);  _backdrop('cf-backdrop', true); }
  function closeCrossfade() { _panel('cf-panel', false); _backdrop('cf-backdrop', false); }

  function updateCf(val) {
    cfSecs = parseInt(val);
    const el = document.getElementById('cf-val');
    if (el) el.textContent = val;
  }

  function applyCf() {
    Player.setCrossfade(cfSecs);
    closeCrossfade();
    UI.toast(`✅ Crossfade set to ${cfSecs}s`);
  }

  return { openSleep, closeSleep, setSleep, cancelSleep, openCrossfade, closeCrossfade, updateCf, applyCf };
})();

// ── Audius API ────────────────────────────────────
const Audius = (() => {
  const HOSTS = [
    'https://discoveryprovider.audius.co',
    'https://discoveryprovider2.audius.co',
  ];
  const QUERIES = ['afrobeats','amapiano','afropop'];
  let host = HOSTS[0];

  async function load() {
    const q = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    try {
      const res  = await fetch(`${host}/v1/tracks/search?query=${q}&limit=8&app_name=AdverseMusic`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      audiusTracks = (data.data || []).slice(0, 6);
      _render();
    } catch {
      try {
        host = HOSTS[1];
        const res  = await fetch(`${host}/v1/tracks/trending?limit=8&app_name=AdverseMusic`);
        const data = await res.json();
        audiusTracks = (data.data || []).slice(0, 6);
        _render();
      } catch {
        _renderFallback();
      }
    }
  }

  function _render() {
    const container = document.getElementById('audius-list');
    if (!container) return;
    if (!audiusTracks.length) { _renderFallback(); return; }
    const EMOJIS = ['🎵','🎶','🎸','🎹','🎤','🥁'];
    const BGS    = ['c-purple','c-teal','c-rose','c-gold','c-green','c-blue'];
    container.innerHTML = audiusTracks.map((t, i) => `
      <div class="track-row" onclick="Player.playAudius(${i})">
        <div class="track-num">${i + 1}</div>
        <div class="track-thumb ${BGS[i % 6]}">${EMOJIS[i % 6]}</div>
        <div class="track-info">
          <div class="track-name">${t.title || 'Unknown'}</div>
          <div class="track-artist">${t.user?.name || 'Unknown Artist'} <span style="color:var(--a1);font-size:10px;font-weight:700;font-family:'Syne',sans-serif">● LIVE</span></div>
        </div>
        <div class="track-dur">${fmt(t.duration || 180)}</div>
      </div>
    `).join('');
  }

  function _renderFallback() {
    const container = document.getElementById('audius-list');
    if (container) container.innerHTML = `<div style="padding:16px 24px;font-size:13px;color:var(--muted)">⚠️ Couldn't reach Audius. Check your connection.</div>`;
  }

  return { load };
})();
