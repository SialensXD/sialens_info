/* ============================================================
   SIALENS — script.js v2.0 (DESKTOP EDITION) да, йоу
   ============================================================ */

// ---------- АУДИО ----------
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (audioCtx) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  } catch (e) { console.warn('Audio unavailable'); }
}

function beep(freq, dur, type, vol) {
  freq = freq || 800; dur = dur || 0.06;
  type = type || 'square'; vol = (vol || 0.04) * 3;
  if (!soundEnabled || !audioCtx) return;
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

['click', 'keydown', 'touchstart'].forEach(function (ev) {
  window.addEventListener(ev, initAudio, { once: true });
});

function haptic(pattern) {
  if (!soundEnabled || !navigator.vibrate) return;
  try { navigator.vibrate(pattern || 10); } catch (e) {}
}

document.querySelectorAll('[data-sound-hover]').forEach(function (el) {
  el.addEventListener('mouseenter', function () { beep(1200, 0.04, 'square', 0.025); });
});

// ---------- КНОПКА ЗВУКА ----------
const soundBtn = document.getElementById('sound-toggle');
if (soundBtn) {
  soundBtn.classList.add('on');
  soundBtn.addEventListener('click', function () {
    soundEnabled = !soundEnabled;
    soundBtn.classList.toggle('on', soundEnabled);
    soundBtn.textContent = soundEnabled ? '◉ Звуки' : '○ Звуки';
    if (soundEnabled) { initAudio(); beep(900, 0.08, 'square', 0.05); haptic(12); }
  });
}

// ---------- ТОСТ ----------
const toastEl = document.getElementById('toast');
let toastTimer = null;
function showToast(text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
}

// ---------- КОПИРОВАНИЕ ----------
function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-1000px';
    ta.style.opacity = '0'; document.body.appendChild(ta);
    ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
}
function copyToClipboard(text) {
  return new Promise(function (resolve) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () { resolve(true); })
        .catch(function () { resolve(fallbackCopy(text)); });
    } else { resolve(fallbackCopy(text)); }
  });
}

// клик по нику (динамически — работает и в окнах)
document.addEventListener('click', function (e) {
  const el = e.target.closest('#copy-nick, [data-copy]');
  if (!el) return;
  if (el.classList.contains('social')) return; // соцкнопки — реальные ссылки
  if (el.id === 'copy-nick') {
    e.preventDefault();
    const nick = el.getAttribute('data-copy') || 'sialens_xd';
    copyToClipboard(nick).then(function (ok) {
      showToast(ok ? 'скопировано // @' + nick : 'не получилось :(');
      haptic([10, 30, 10]);
    });
  }
});

// ---------- ГЛИТЧ (wallpaper лого) ----------
const glitchEl = document.querySelector('.wallpaper-logo');
if (glitchEl) {
  setInterval(function () {
    if (Math.random() < 0.15) {
      const dx = (Math.random() - 0.5) * 4;
      const dy = (Math.random() - 0.5) * 4;
      glitchEl.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      setTimeout(function () { glitchEl.style.transform = ''; }, 80);
    }
  }, 1500);
}

// ---------- КАСТОМНЫЙ КУРСОР ----------
if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
  document.body.classList.add('has-cursor');
  const cur = document.createElement('div');
  cur.className = 'custom-cursor';
  document.body.appendChild(cur);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
  (function anim() {
    cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
    cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
    requestAnimationFrame(anim);
  })();

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest('a, button, .desktop-icon, .window-header, .window-close, .taskbar-chip, .social, input, .card'))
      cur.classList.add('hover');
    else cur.classList.remove('hover');
  });
}

// ---------- BLOOD MODE ----------
const bloodFlash = document.getElementById('blood-flash');
let bloodActive = false;
let bloodEndTimer = null;

function triggerBloodMode() {
  bloodActive = !bloodActive;
  document.body.classList.toggle('blood-mode', bloodActive);
  if (bloodFlash) bloodFlash.classList.toggle('show', bloodActive);

  if (bloodActive) {
    beep(120, 0.4, 'sawtooth', 0.08);
    setTimeout(function () { beep(80, 0.5, 'sawtooth', 0.08); }, 150);
    haptic([30, 60, 30, 60, 200]);
    showToast('// blood mode activated //');
    clearTimeout(bloodEndTimer);
    bloodEndTimer = setTimeout(function () {
      bloodActive = false;
      document.body.classList.remove('blood-mode');
      if (bloodFlash) bloodFlash.classList.remove('show');
    }, 6000);
  } else { haptic(10); }
}

// ============================================================
// WINDOW MANAGER
// ============================================================
(function initWindowManager() {
  const windowsRoot = document.getElementById('windows');
  const taskbarWin = document.getElementById('taskbar-windows');
  if (!windowsRoot) return;

  const APPS = {
    about:     { title: 'обо мне',         tpl: 'tpl-about' },
    interests: { title: 'интересы',        tpl: 'tpl-interests' },
    stuff:     { title: 'игры / музыка',   tpl: 'tpl-stuff' },
    archive:   { title: 'архив',           tpl: 'tpl-archive' },
    chaos:     { title: 'хаос',            tpl: 'tpl-chaos' },
    contact:   { title: 'связь',           tpl: 'tpl-contact' }
  };

  const openWindows = {}; // id → { el, chipEl, appId }
  let zTop = 200;
  let cascade = 0;

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  function openApp(appId) {
    // если окно уже открыто — фокус на него
    if (openWindows[appId]) { focusWindow(appId); return; }

    const cfg = APPS[appId];
    if (!cfg) return;
    const tpl = document.getElementById(cfg.tpl);
    if (!tpl) return;

    // создаём окно
    const win = document.createElement('div');
    win.className = 'window';
    win.dataset.app = appId;

    // позиция
    if (!isMobile()) {
      const baseX = 170 + (cascade % 4) * 30;
      const baseY = 70 + (cascade % 4) * 24;
      cascade++;
      win.style.left = baseX + 'px';
      win.style.top = baseY + 'px';
    }
    win.style.zIndex = ++zTop;

    // header
    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = '<div class="window-dots"><span></span><span></span><span></span></div>' +
                       '<div class="window-title">' + cfg.title + '</div>' +
                       '<button class="window-close" aria-label="закрыть">✕</button>';
    win.appendChild(header);

    // body
    const body = document.createElement('div');
    body.className = 'window-body';
    body.appendChild(tpl.content.cloneNode(true));
    win.appendChild(body);

    windowsRoot.appendChild(win);
    openWindows[appId] = { el: win, chipEl: null, appId: appId };

    // чип в таскбаре
    if (taskbarWin) {
      const chip = document.createElement('div');
      chip.className = 'taskbar-chip active';
      chip.dataset.app = appId;
      chip.innerHTML = '<span>' + cfg.title + '</span><button class="taskbar-chip-close" aria-label="закрыть">✕</button>';
      taskbarWin.appendChild(chip);
      openWindows[appId].chipEl = chip;
      chip.addEventListener('click', function (e) {
        if (e.target.closest('.taskbar-chip-close')) { closeApp(appId); return; }
        focusWindow(appId);
      });
    }

    // закрытие
    header.querySelector('.window-close').addEventListener('click', function () { closeApp(appId); });

    // drag
    if (!isMobile()) initDrag(win, header);

    // фокус
    win.addEventListener('mousedown', function () { focusWindow(appId); });

    // звуки
    beep(700, 0.06, 'square', 0.05);
    haptic(10);
  }

  function closeApp(appId) {
    const w = openWindows[appId];
    if (!w) return;
    w.el.classList.add('closing');
    if (w.chipEl) w.chipEl.remove();
    setTimeout(function () {
      if (w.el.parentNode) w.el.parentNode.removeChild(w.el);
    }, 240);
    delete openWindows[appId];
    beep(400, 0.08, 'square', 0.05);
    haptic(8);
  }

  function focusWindow(appId) {
    const w = openWindows[appId];
    if (!w) return;
    w.el.style.zIndex = ++zTop;
    Object.keys(openWindows).forEach(function (id) {
      const c = openWindows[id].chipEl;
      if (c) c.classList.toggle('active', id === appId);
    });
  }

  function initDrag(win, handle) {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;

    handle.addEventListener('mousedown', function (e) {
      if (e.target.closest('.window-close')) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = parseInt(win.style.left, 10) || 0;
      oy = parseInt(win.style.top, 10) || 0;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      const nx = ox + (e.clientX - sx);
      const ny = oy + (e.clientY - sy);
      const maxX = window.innerWidth - win.offsetWidth - 10;
      const maxY = window.innerHeight - 70;
      win.style.left = Math.max(10, Math.min(nx, maxX)) + 'px';
      win.style.top  = Math.max(10, Math.min(ny, maxY)) + 'px';
    });

    document.addEventListener('mouseup', function () {
      if (dragging) { dragging = false; document.body.style.userSelect = ''; }
    });
  }

  // клики по иконкам
  document.querySelectorAll('.desktop-icon').forEach(function (icon) {
    icon.addEventListener('click', function () { openApp(icon.dataset.app); });
    icon.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openApp(icon.dataset.app); }
    });
  });

  // глобальный доступ
  window.openApp = openApp;
  window.closeAllWindows = function () {
    Object.keys(openWindows).forEach(function (id) { closeApp(id); });
  };
})();

// ============================================================
// ТЕРМИНАЛ
// ============================================================
(function initTerminal() {
  const termEl = document.getElementById('terminal');
  const termBody = document.getElementById('term-body');
  const termInput = document.getElementById('term-input');
  const termOpen = document.getElementById('term-toggle');
  const termClose = document.getElementById('term-close');
  if (!termEl || !termBody || !termInput) return;

  const PROMPT = 'sialens@chaos:~$';

  function line(text, cls) {
    const div = document.createElement('div');
    div.className = 'term-line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }
  function printLines(arr, cls) { arr.forEach(function (t) { line(t, cls); }); }
  function delay(fn, ms) { setTimeout(fn, ms); }

  const commands = {
    help: function () {
      printLines([
        '> команды:',
        '  help      — ну ты понял',
        '  chaos     — активировать хаос',
        '  sudo      — рискни ;)',
        '  sleep     — сон, я хз',
        '  hack      — взломать пентагон',
        '  coffee    — сварить кофе',
        '  matrix    — а ты готов?',
        '  ping      — ping',
        '  whoami    — кто ты',
        '  ls        — список файлов',
        '  cats      — мяу',
        '  clear     — очистить тут все',
        '  ...и ещё есть пара, но их сам ищи ;)'
      ]);
    },

    chaos: function () {
      line('> ЗАПУСК ПРОТОКОЛА ХАОСА...', 'err');
      delay(function () { line('> 3...', 'err'); }, 200);
      delay(function () { line('> 2...', 'err'); }, 500);
      delay(function () { line('> 1...', 'err'); }, 800);
      delay(function () {
        line('> хаос активирован, как страшноооо', 'err');
        if (typeof triggerBloodMode === 'function' && !document.body.classList.contains('blood-mode')) {
          triggerBloodMode();
        }
      }, 1100);
    },

    sudo: function () {
      printLines([
        'User is not in the sudoers file.',
        'This incident has been reported 🩸'
      ], 'err');
    },

    sleep: function () {
      printLines([
        '> попытка уснуть...',
        '> ...',
        '> ошибка: много хочешь',
        '> иди попей магний',
        '> это типо метафора(?) на мою бессоницу, я хз'
      ], 'err');
    },

    hack: function () {
      line('> взлом пентагона...', '');
      delay(function () { line('> обход firewall... 12%', ''); }, 300);
      delay(function () { line('> обход firewall... 47%', ''); }, 700);
      delay(function () { line('> обход firewall... 91%', ''); }, 1100);
      delay(function () { line('> 99%...', ''); }, 1500);
      delay(function () {
        line('> ошибка: куда тебе, иди уроки делай', 'err');
        beep(200, 0.2, 'sawtooth', 0.08);
      }, 1900);
    },

    coffee: function () {
      line('> варю кофе...', '');
      delay(function () { line('> ...', ''); }, 500);
      delay(function () { line('> ошибка 418: я чайник (что это блять значит????)', 'err'); }, 1000);
    },

    matrix: function () {
      line('> waking up...', '');
      delay(function () { line('> follow the white rabbit', ''); }, 400);
      delay(function () { line('> red pill or blue pill?', ''); }, 900);
    },

    ping: function () {
      printLines([
        'PING sialens.ru (пусть домен и другой): 56 data bytes',
        '64 bytes from localhost: time=0.42 ms',
        '64 bytes from localhost: time=0.13 ms',
        '64 bytes from localhost: time=0.21 ms',
        '--- статистика ---',
        '3 packets transmitted, 3 received, 0% loss',
        '// это фейк инфа кста👀'
      ]);
    },

    whoami: function () {
      printLines([
        '> ты — случайный прохожий, который забрёл сюда',
        '> и, видимо, тебе СОВСЕМ нечем заняться раз ты в терминале',
        '> уважаю.'
      ]);
    },

    ls: function () {
      printLines([
        'голые_фурри.png         insomnia.log       дик_пик.png',
        'memories/          bots/              homework(пусто)',
        'sleep.exe         (не отвечает)'
      ], 'dim');
    },

    cats: function () {
      printLines([
        '  /\\_/\\   ',
        ' ( o.o )  ',
        '  > ^ <   ',
        '> мяу.'
      ], '');
    },

    clear: function () { termBody.innerHTML = ''; }
  };

  function runCommand(raw) {
    const input = raw.trim();
    if (!input) return;
    line(PROMPT + ' ' + input, 'cmd');
    const cmd = input.split(/\s+/)[0].toLowerCase();

    if (commands[cmd]) {
      commands[cmd]();
      beep(900, 0.05, 'square', 0.05);
    } else {
      line("> нет такой команды: '" + cmd + "'. напиши 'help', ну или не пиши.", 'err');
      beep(200, 0.1, 'sawtooth', 0.06);
    }
  }

  function openTerm() {
    termEl.classList.add('open'); termOpen.classList.add('open');
    setTimeout(function () { termInput.focus(); }, 300);
    beep(700, 0.06, 'square', 0.05); haptic(10);
  }
  function closeTerm() {
    termEl.classList.remove('open'); termOpen.classList.remove('open');
    beep(400, 0.06, 'square', 0.05);
  }
  function toggleTerm() { termEl.classList.contains('open') ? closeTerm() : openTerm(); }

  termOpen.addEventListener('click', toggleTerm);
  if (termClose) termClose.addEventListener('click', closeTerm);
  termInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { runCommand(termInput.value); termInput.value = ''; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '`' || e.key === '~' || e.key === 'ё' || e.key === 'Ё') {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault(); toggleTerm();
    }
    if (e.key === 'Escape' && termEl.classList.contains('open')) closeTerm();
  });
})();

// ============================================================
// ТАСКБАР: часы и бессонница
// ============================================================
(function initStatusBar() {
  const clockEl = document.getElementById('taskbar-clock');
  const insEl = document.getElementById('taskbar-insomnia');
  if (!clockEl || !insEl) return;
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    const now = new Date();
    clockEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    const h = now.getHours();
    const isNight = (h >= 23 || h < 6);
    if (isNight) { insEl.textContent = 'не спит'; insEl.className = 'taskbar-insomnia awake'; }
    else { insEl.textContent = 'спит'; insEl.className = 'taskbar-insomnia sleep'; }
  }
  tick(); setInterval(tick, 1000);
})();

// ============================================================
// CANVAS ЧАСТИЦЫ
// ============================================================
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const isMobile = window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;
  const COUNT = isMobile ? 28 : 70;
  const LINK_DIST = isMobile ? 0 : 130;
  const MAX_SPEED = isMobile ? 0.25 : 0.4;

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let rafId = null;

  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function rand(a, b) { return Math.random() * (b - a) + a; }
  function createParticle() {
    const a = rand(0, Math.PI * 2), s = rand(0.05, MAX_SPEED);
    return { x: rand(0, W), y: rand(0, H), vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      r: rand(0.6, 1.8), alpha: rand(0.25, 0.75), pulse: rand(0, Math.PI * 2), pulseSpeed: rand(0.01, 0.03) };
  }
  function initParticles() { particles = []; for (let i = 0; i < COUNT; i++) particles.push(createParticle()); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (LINK_DIST > 0) {
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const d = Math.sqrt(d2), alpha = (1 - d / LINK_DIST) * 0.18;
          ctx.strokeStyle = 'rgba(230,0,0,' + alpha + ')'; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (mouse.active && !isMobile) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy, R = 160;
        if (d2 < R * R && d2 > 0.01) {
          const d = Math.sqrt(d2), f = (1 - d / R) * 0.06;
          p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        }
      }
      p.vx *= 0.995; p.vy *= 0.995;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > MAX_SPEED) { p.vx = (p.vx / sp) * MAX_SPEED; p.vy = (p.vy / sp) * MAX_SPEED; }
      p.x += p.vx; p.y += p.vy;
      p.pulse += p.pulseSpeed;
      const a = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      grd.addColorStop(0, 'rgba(255,60,60,' + a + ')');
      grd.addColorStop(0.4, 'rgba(230,0,0,' + (a * 0.4) + ')');
      grd.addColorStop(1, 'rgba(230,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,90,90,' + a + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  }
  window.addEventListener('resize', function () { resize(); initParticles(); });
  document.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  document.addEventListener('mouseleave', function () { mouse.active = false; });
  document.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches.length) return;
    const t = e.touches[0];
    for (let i = 0; i < 6; i++) {
      const p = createParticle();
      p.x = t.clientX; p.y = t.clientY;
      const ang = rand(0, Math.PI * 2), sp = rand(0.5, 1.6);
      p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp;
      p.r = rand(0.8, 1.6); p.alpha = 1;
      particles.push(p);
    }
    if (particles.length > COUNT + 40) particles.splice(0, particles.length - COUNT - 40);
  }, { passive: true });

  resize(); initParticles(); draw();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }
    else if (!rafId) draw();
  });
})();

// ============================================================
// МУЗЫКАЛЬНЫЙ ПЛЕЕР
// ============================================================
const PLAYLIST = [
  { src: 'audio/track1.mp3', title: 'Main Theme' },
  { src: 'audio/track2.mp3', title: 'Glory' },
  { src: 'audio/track3.mp3', title: 'War Without Reason' }
];

(function initMusicPlayer() {
  const btnPlay = document.getElementById('player-play');
  const btnPrev = document.getElementById('player-prev');
  const btnNext = document.getElementById('player-next');
  const titleEl = document.getElementById('player-title');
  const statusEl = document.getElementById('player-status');
  const volSlider = document.getElementById('player-vol');
  if (!btnPlay) return;

  let currentIndex = 0, isPlaying = false;
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.loop = false;
  audio.volume = (volSlider ? volSlider.value : 60) / 100;

  function updateTitle() {
    const t = PLAYLIST[currentIndex];
    if (titleEl) titleEl.textContent = t ? t.title : 'НЕТ ТРЕКОВ';
  }
  function loadTrack(i) {
    if (!PLAYLIST.length) return;
    currentIndex = (i + PLAYLIST.length) % PLAYLIST.length;
    audio.src = PLAYLIST[currentIndex].src;
    updateTitle();
  }
  function setPlayingUI(p) {
    isPlaying = p;
    btnPlay.textContent = p ? '❚❚' : '▶';
    btnPlay.classList.toggle('playing', p);
    if (statusEl) statusEl.textContent = p ? 'играет' : 'пауза';
  }
  function play() {
    const pr = audio.play();
    if (pr && pr.catch) {
      pr.then(function () { setPlayingUI(true); }).catch(function () {
        setPlayingUI(false);
        if (statusEl) statusEl.textContent = 'файл не найден';
      });
    }
  }
  function pause() { audio.pause(); setPlayingUI(false); }
  function next() { loadTrack(currentIndex + 1); if (isPlaying) play(); }
  function prev() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    loadTrack(currentIndex - 1); if (isPlaying) play();
  }

  btnPlay.addEventListener('click', function () {
    if (isPlaying) pause(); else play();
    beep(isPlaying ? 900 : 500, 0.06, 'square', 0.05); haptic(10);
  });
  if (btnNext) btnNext.addEventListener('click', function () { next(); beep(1000, 0.05, 'square', 0.05); haptic(8); });
  if (btnPrev) btnPrev.addEventListener('click', function () { prev(); beep(600, 0.05, 'square', 0.05); haptic(8); });
  if (volSlider) volSlider.addEventListener('input', function () { audio.volume = volSlider.value / 100; });
  audio.addEventListener('ended', next);
  document.addEventListener('visibilitychange', function () { if (document.hidden && isPlaying) pause(); });

  window.startMusicPlayer = function () {
    if (isPlaying) return;
    if (!PLAYLIST.length) return;
    if (!audio.src) loadTrack(0);
    play();
  };

  updateTitle(); loadTrack(0); setPlayingUI(false);
})();

// ============================================================
// ЭКРАН ВХОДА
// ============================================================
(function initEntryScreen() {
  const entry = document.getElementById('entry-screen');
  if (!entry) return;
  let entered = false;
  function enter() {
    if (entered) return; entered = true;
    entry.classList.add('hide');
    document.body.classList.add('entered');
    if (typeof window.startMusicPlayer === 'function') window.startMusicPlayer();
    if (typeof beep === 'function') beep(1200, 0.1, 'square', 0.07);
    if (typeof haptic === 'function') haptic([15, 40, 15, 40, 100]);
    setTimeout(function () { if (entry.parentNode) entry.parentNode.removeChild(entry); }, 900);
  }
  entry.addEventListener('click', enter);
  entry.addEventListener('touchstart', enter, { passive: true });
  entry.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') enter(); });
  entry.setAttribute('tabindex', '0');
})();

// ============================================================
// ПАСХАЛКА — секретные слова на клавиатуре
// ============================================================
(function initSecretWords() {
  const WORDS = {
    chaos:     { toast: '// CHAOS UNLOCKED //',   blood: true },
    ultrakill: { toast: '// V1 APPROVES //',      blood: true },
    sialens:   { toast: '// ДОБРО ПОЖАЛОВАТЬ, КЛОН //', blood: false }
  };
  const MAX = 20;
  let buffer = '';
  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-MAX);
    for (const word in WORDS) {
      if (buffer.endsWith(word)) {
        const c = WORDS[word];
        showToast(c.toast);
        if (c.blood && !document.body.classList.contains('blood-mode')) triggerBloodMode();
        else { beep(1500, 0.15, 'square', 0.08); haptic([15, 40, 15, 40, 100]); }
        buffer = '';
        break;
      }
    }
  });
})();