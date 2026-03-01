/* player.js — Audio engine & player UI */

const Player = (() => {
  // ── State ─────────────────────────────────────
  const audio = new Audio();
  audio.preload = 'none';

  let idx        = 0;
  let playing    = false;
  let shuffle    = false;
  let repeat     = false;
  let liked      = false;
  let elapsed    = 0;
  let ticker     = null;
  let lyricsKey  = null;
  let cfSecs     = 3; // crossfade seconds

  // ── Icons ─────────────────────────────────────
  const PAUSE_SVG = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
  const PLAY_SVG  = `<polygon points="5,3 19,12 5,21"/>`;

  // ── Internal helpers ──────────────────────────
  function $id(id) { return document.getElementById(id); }

  function applyTheme(c1, c2) {
    document.documentElement.style.setProperty('--dyn1', c1);
    document.documentElement.style.setProperty('--dyn2', c2);
    const glow = $id('dyn-glow');
    if (glow) glow.style.background = `radial-gradient(circle,${c1} 0%,transparent 70%)`;
    const fpGlow = $id('fp-bg-glow');
    if (fpGlow) fpGlow.style.background = `radial-gradient(circle,${c1} 0%,transparent 70%)`;
  }

  function updateUI(track) {
    const fields = {
      'mini-thumb':   { cls: track.bg, txt: track.emoji },
      'mini-track':   { txt: track.name },
      'mini-artist':  { txt: track.artist },
      'fp-art':       { cls: `fp-art ${track.bg} playing`, txt: track.emoji },
      'fp-track':     { txt: track.name },
      'fp-artist':    { txt: track.artist },
      'fp-total':     { txt: fmt(track.duration) },
      'fp-current':   { txt: '0:00' },
    };
    for (const [id, v] of Object.entries(fields)) {
      const el = $id(id);
      if (!el) continue;
      if (v.txt !== undefined) el.textContent = v.txt;
      if (v.cls !== undefined) el.className = v.cls;
    }
    // Progress reset
    const fp = $id('fp-progress');
    const mp = $id('mini-progress');
    if (fp) fp.style.width = '0%';
    if (mp) mp.style.width = '0%';
    // Source badge
    const badge = $id('fp-source-badge');
    if (badge) {
      badge.textContent = track.source === 'audius' ? 'Audius ●' : 'Preview';
      badge.className   = `fp-source-badge ${track.source === 'audius' ? 'audius' : 'preview'}`;
    }
  }

  function updateProgress(pct, current, total) {
    const fp = $id('fp-progress');
    const mp = $id('mini-progress');
    const fc = $id('fp-current');
    if (fp) fp.style.width  = pct + '%';
    if (mp) mp.style.width  = pct + '%';
    if (fc) fc.textContent  = fmt(current);
    syncLyrics(current);
  }

  function updateIcons() {
    const svg = playing ? PAUSE_SVG : PLAY_SVG;
    const mi  = $id('mini-play-icon');
    const fi  = $id('fp-play-icon');
    if (mi) mi.innerHTML = svg;
    if (fi) fi.innerHTML = svg;
    const art = $id('fp-art');
    if (art) art.classList.toggle('playing', playing);
  }

  function startTicker(duration) {
    clearInterval(ticker);
    ticker = setInterval(() => {
      if (!playing) return;
      elapsed++;
      // Crossfade: fade out near end
      if (cfSecs > 0 && duration - elapsed <= cfSecs && duration - elapsed >= 0) {
        audio.volume = Math.max(0, (duration - elapsed) / cfSecs);
      }
      const pct = (elapsed / duration) * 100;
      updateProgress(pct, elapsed, duration);
      if (elapsed >= duration) {
        clearInterval(ticker);
        repeat ? _restart() : next();
      }
    }, 1000);
  }

  function _restart() {
    elapsed = 0;
    audio.currentTime = 0;
    audio.volume = 1;
    if (audio.src) audio.play().catch(() => {});
  }

  // ── Lyrics ────────────────────────────────────
  function loadLyrics(track) {
    lyricsKey = track.lyricsKey || null;
    const content = $id('lyrics-content');
    const source  = $id('lyrics-source');
    if (!content || !source) return;

    if (track.source === 'audius') {
      source.textContent  = '🎤 Audius track';
      content.innerHTML   = '<div class="lyrics-loading" style="color:var(--muted);font-size:14px;padding:40px 0;text-align:center">Lyrics for Audius tracks coming in Phase 4!</div>';
      return;
    }

    const lines = LYRICS_DB[lyricsKey];
    if (!lines) {
      source.textContent  = '—';
      content.innerHTML   = '<div class="lyrics-loading" style="color:var(--muted);font-size:14px;padding:40px 0;text-align:center">No lyrics available</div>';
      return;
    }

    source.textContent = `📝 ${track.name}`;
    content.innerHTML  = lines.map((l, i) =>
      `<div class="lyric-line" id="lyric-${i}" onclick="Player._seekToLine(${l.t})">${l.l}</div>`
    ).join('');
  }

  function syncLyrics(sec) {
    if (!lyricsKey) return;
    const lines = LYRICS_DB[lyricsKey];
    if (!lines) return;

    let active = 0;
    for (let i = 0; i < lines.length; i++) {
      if (sec >= lines[i].t) active = i;
    }
    lines.forEach((_, i) => {
      const el = $id(`lyric-${i}`);
      if (!el) return;
      el.classList.remove('active', 'past');
      if (i === active)      el.classList.add('active');
      else if (i < active)   el.classList.add('past');
    });
    const activeLine = $id(`lyric-${active}`);
    if (activeLine) activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function _seekToLine(t) {
    elapsed = t;
    if (audio.src && audio.readyState > 0) audio.currentTime = t;
  }

  // ── Queue ────────────────────────────────────
  function updateQueue() {
    const list = $id('queue-list');
    if (!list) return;
    const upcoming = [];
    for (let i = 1; i <= 5; i++) {
      const qi = (idx + i) % TRACKS.length;
      upcoming.push({ track: TRACKS[qi], qi });
    }
    list.innerHTML = upcoming.map(({ track, qi }) => `
      <div class="track-row" onclick="Player.play(${qi})">
        <div class="track-thumb ${track.bg}">${track.emoji}</div>
        <div class="track-info">
          <div class="track-name">${track.name}</div>
          <div class="track-artist">${track.artist}</div>
        </div>
        <div class="track-dur">${fmt(track.duration)}</div>
      </div>
    `).join('');
  }

  // ── Public API ───────────────────────────────
  function play(trackIdx) {
    idx     = trackIdx;
    elapsed = 0;
    audio.pause();
    audio.volume = 1;
    clearInterval(ticker);

    const track = TRACKS[idx];
    if (!track) return;

    applyTheme(track.col1 || '#7c5cfc', track.col2 || '#c45cfc');
    updateUI(track);
    loadLyrics(track);
    updateQueue();

    // Show mini player
    const wrap = $id('mini-player-wrap');
    if (wrap) wrap.classList.remove('hidden');

    playing = true;
    updateIcons();

    if (track.streamUrl) {
      audio.src = track.streamUrl;
      audio.volume = 1;
      audio.play()
        .then(() => {
          audio.ontimeupdate = () => {
            elapsed = Math.floor(audio.currentTime);
            const dur = Math.floor(audio.duration) || track.duration;
            updateProgress((elapsed / dur) * 100, elapsed, dur);
            if (cfSecs > 0 && dur - elapsed <= cfSecs) {
              audio.volume = Math.max(0, (dur - elapsed) / cfSecs);
            }
          };
          audio.onended = () => { repeat ? _restart() : next(); };
        })
        .catch(() => startTicker(track.duration));
    } else {
      startTicker(track.duration);
    }

    openFull();
  }

  function playAudius(audIdx) {
    const t = audiusTracks[audIdx];
    if (!t) return;

    const EMOJIS = ['🎵','🎶','🎸','🎹','🎤','🥁'];
    const BGS    = ['c-purple','c-teal','c-rose','c-gold','c-green','c-blue'];
    const C1S    = ['#5a2acc','#0a5a5a','#8a0a28','#5a3a00','#0a4a18','#0a1a6a'];
    const C2S    = ['#9a3acc','#0a9a6a','#cc2a50','#aa7a00','#0a8a38','#1a4aaa'];
    const i      = audIdx % EMOJIS.length;

    const track = {
      name:      t.title || 'Unknown Track',
      artist:    t.user?.name || 'Audius Artist',
      emoji:     EMOJIS[i],
      bg:        BGS[i],
      col1:      C1S[i],
      col2:      C2S[i],
      duration:  t.duration || 180,
      source:    'audius',
      streamUrl: t._streamUrl || null,
      lyricsKey: null,
    };

    // Insert at front
    TRACKS.unshift(track);
    play(0);
  }

  function togglePlay() {
    playing = !playing;
    updateIcons();
    if (audio.src && audio.readyState > 0) {
      playing ? audio.play().catch(() => {}) : audio.pause();
    }
  }

  function next() {
    audio.volume = 1;
    const nextIdx = shuffle
      ? Math.floor(Math.random() * TRACKS.length)
      : (idx + 1) % TRACKS.length;
    play(nextIdx);
  }

  function prev() {
    audio.volume = 1;
    if (elapsed > 3) { elapsed = 0; if (audio.src) audio.currentTime = 0; return; }
    play((idx - 1 + TRACKS.length) % TRACKS.length);
  }

  function seek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const dur  = TRACKS[idx]?.duration || 230;
    elapsed    = Math.floor(pct * dur);
    if (audio.src && audio.readyState > 0) audio.currentTime = elapsed;
    updateProgress(pct * 100, elapsed, dur);
  }

  function toggleLike() {
    liked = !liked;
    const el   = $id('fp-like');
    const icon = $id('like-icon');
    if (el)   el.classList.toggle('liked', liked);
    if (icon) { icon.style.fill = liked ? '#ff5577' : 'none'; icon.style.stroke = liked ? '#ff5577' : 'currentColor'; }
    UI.toast(liked ? '❤️ Added to Liked Songs' : 'Removed from Liked Songs');
  }

  function toggleShuffle() {
    shuffle = !shuffle;
    $id('shuffle-btn')?.classList.toggle('active', shuffle);
    UI.toast(shuffle ? '🔀 Shuffle On' : 'Shuffle Off');
  }

  function toggleRepeat() {
    repeat = !repeat;
    $id('repeat-btn')?.classList.toggle('active', repeat);
    UI.toast(repeat ? '🔁 Repeat On' : 'Repeat Off');
  }

  function openFull()  { $id('full-player')?.classList.add('open'); }
  function closeFull() { $id('full-player')?.classList.remove('open'); }

  function tab(name) {
    document.querySelectorAll('.fp-tab').forEach((t, i) => {
      t.classList.toggle('active', ['player','lyrics','queue'][i] === name);
    });
    document.querySelectorAll('.fp-view').forEach(v => v.classList.remove('active'));
    $id(`fp-view-${name}`)?.classList.add('active');
  }

  function setCrossfade(s) { cfSecs = s; }

  // Swipe down to close full player
  let swipeY = 0;
  document.addEventListener('DOMContentLoaded', () => {
    const fp = $id('full-player');
    if (!fp) return;
    fp.addEventListener('touchstart', e => { swipeY = e.touches[0].clientY; }, { passive: true });
    fp.addEventListener('touchend',   e => { if (e.changedTouches[0].clientY - swipeY > 90) closeFull(); });
  });

  return { play, playAudius, togglePlay, next, prev, seek, toggleLike, toggleShuffle, toggleRepeat, openFull, closeFull, tab, setCrossfade, _seekToLine };
})();
