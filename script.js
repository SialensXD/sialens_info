/* ============================================================
   SIALENS OS — script.js v4.0
   ULTRAKILL EDITION // War Without Reason
   ============================================================ */

// ---------- АУДИО ----------
let audioCtx = null;
let soundEnabled = true;

// фоновая музыка — War Without Reason (loop, без UI)
const bgAudio = new Audio();
bgAudio.preload = 'auto';
bgAudio.loop = true;
bgAudio.src = 'audio/track3.mp3';
bgAudio.volume = 0.5;

function startBackgroundMusic() {
  if (!soundEnabled) return;
  const pr = bgAudio.play();
  if (pr && pr.catch) pr.catch(function () {});
}
function stopBackgroundMusic() {
  try { bgAudio.pause(); } catch (e) {}
}

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
  if (!navigator.vibrate) return;
  try { navigator.vibrate(pattern || 10); } catch (e) {}
}

document.querySelectorAll('[data-sound-hover]').forEach(function (el) {
  el.addEventListener('mouseenter', function () { beep(1200, 0.04, 'square', 0.025); });
});

// ---------- КНОПКА ЗВУКА (управляет и бипами, и музыкой) ----------
const soundBtn = document.getElementById('sound-toggle');
if (soundBtn) {
  soundBtn.classList.add('on');
  soundBtn.addEventListener('click', function () {
    soundEnabled = !soundEnabled;
    soundBtn.classList.toggle('on', soundEnabled);
    soundBtn.textContent = soundEnabled ? '◉ Звуки' : '○ Звуки';
    if (soundEnabled) {
      initAudio();
      beep(900, 0.08, 'square', 0.05);
      haptic(12);
      // возобновляем музыку, если она уже была запущена и на паузе
      if (bgAudio.currentTime > 0 && bgAudio.paused) {
        bgAudio.play().catch(function () {});
      }
    } else {
      stopBackgroundMusic();
    }
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

document.addEventListener('click', function (e) {
  const el = e.target.closest('#copy-nick, [data-copy]');
  if (!el) return;
  if (el.classList.contains('social')) return;
  if (el.id === 'copy-nick') {
    e.preventDefault();
    const nick = el.getAttribute('data-copy') || 'sialens_xd';
    copyToClipboard(nick).then(function (ok) {
      showToast(ok ? 'скопировано // @' + nick : 'не получилось :(');
      haptic([10, 30, 10]);
    });
  }
});

// ---------- ГЛИТЧ НА ЛОГО ----------
const glitchEl = document.querySelector('.wallpaper-logo');
if (glitchEl) {
  setInterval(function () {
    if (Math.random() < 0.15) {
      const dx = (Math.random() - 0.5) * 4;
      const dy = (Math.random() - 0.5) * 4;
      glitchEl.style.setProperty('--glitch-x', dx + 'px');
      glitchEl.style.setProperty('--glitch-y', dy + 'px');
      setTimeout(function () {
        glitchEl.style.setProperty('--glitch-x', '0px');
        glitchEl.style.setProperty('--glitch-y', '0px');
      }, 80);
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
    showToast('// так называемая пасхалка //');
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
    contact:   { title: 'связь',           tpl: 'tpl-contact' },
    system:    { title: 'о системе',       tpl: 'tpl-system' }
  };

  const openWindows = {};
  let zTop = 550;
  let cascade = 0;

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  function openApp(appId) {
    if (openWindows[appId]) { focusWindow(appId); return; }
    const cfg = APPS[appId];
    if (!cfg) return;
    const tpl = document.getElementById(cfg.tpl);
    if (!tpl) return;

    const win = document.createElement('div');
    win.className = 'window';
    win.dataset.app = appId;

    if (!isMobile()) {
      const baseX = 170 + (cascade % 4) * 30;
      const baseY = 70 + (cascade % 4) * 24;
      cascade++;
      win.style.left = baseX + 'px';
      win.style.top = baseY + 'px';
    }
    win.style.zIndex = ++zTop;

    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = '<div class="window-dots"><span></span><span></span><span></span></div>' +
                       '<div class="window-title">' + cfg.title + '</div>' +
                       '<button class="window-close" aria-label="закрыть">✕</button>';
    win.appendChild(header);

    const body = document.createElement('div');
    body.className = 'window-body';
    body.appendChild(tpl.content.cloneNode(true));
    win.appendChild(body);

    windowsRoot.appendChild(win);
    openWindows[appId] = { el: win, chipEl: null, appId: appId };

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

    header.querySelector('.window-close').addEventListener('click', function () { closeApp(appId); });

    if (!isMobile()) initDrag(win, header);
    win.addEventListener('mousedown', function () { focusWindow(appId); });

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

  document.querySelectorAll('.desktop-icon').forEach(function (icon) {
    icon.addEventListener('click', function () { openApp(icon.dataset.app); });
    icon.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openApp(icon.dataset.app); }
    });
  });

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

  const PROMPT = 'тупой_ишак228:';

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
      printLines(['User is not in the sudoers file.', 'This incident has been reported 🩸'], 'err');
    },
    sleep: function () {
      printLines(['> попытка уснуть...', '> ...', '> ошибка: много хочешь', '> иди попей магний', '> это типо метафора(?) на мою бессоницу, я хз'], 'err');
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
// CANVAS — плавающие символы
// ============================================================
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches
                || window.matchMedia('(pointer: coarse)').matches;

  const COUNT = isMobile ? 16 : 32;

  const SUITS = [
    { char: '✕', color: '#c1121f' },
    { char: '◆', color: '#e8e4d9' },
    { char: '▮', color: '#c1121f' },
    { char: '+', color: '#8b0000' },
    { char: '⌁', color: '#e8e4d9' },
    { char: '✕', color: '#ff2e3a' }
  ];

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let rafId = null;

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(a, b) { return Math.random() * (b - a) + a; }

  function createParticle(initY) {
    const s = SUITS[Math.floor(Math.random() * SUITS.length)];
    return {
      x: rand(0, W),
      y: initY ? rand(0, H) : -30,
      vx: rand(-0.15, 0.15),
      vy: rand(0.08, 0.35),
      size: rand(12, 28),
      alpha: rand(0.08, 0.22),
      rot: rand(-0.3, 0.3),
      rotSpeed: rand(-0.003, 0.003),
      char: s.char,
      color: s.color,
      wobble: rand(0, Math.PI * 2),
      wobbleSpeed: rand(0.005, 0.015)
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(createParticle(true));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.wobble += p.wobbleSpeed;
      const wobbleX = Math.sin(p.wobble) * 0.4;

      if (p.y > H + 40) {
        p.y = -40;
        p.x = rand(0, W);
        p.vx = rand(-0.15, 0.15);
      }
      if (p.x < -50) p.x = W + 50;
      if (p.x > W + 50) p.x = -50;

      ctx.save();
      ctx.translate(p.x + wobbleX, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.font = 'bold ' + p.size + 'px "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function () {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  draw();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!rafId) {
      draw();
    }
  });
})();

// ============================================================
// ЭКРАН ВХОДА → запуск катсцены
// ============================================================
(function initEntryScreen() {
  const entry = document.getElementById('entry-screen');
  if (!entry) return;
  let entered = false;
  function enter() {
    if (entered) return; entered = true;
    entry.classList.add('hide');
    beep(1200, 0.1, 'square', 0.07);
    haptic([15, 40, 15, 40, 100]);

    setTimeout(function () {
      if (typeof window.startCutscene === 'function') {
        window.startCutscene();
      } else {
        document.body.classList.add('entered');
        startBackgroundMusic();
      }
    }, 400);

    setTimeout(function () { if (entry.parentNode) entry.parentNode.removeChild(entry); }, 900);
  }
  entry.addEventListener('click', enter);
  entry.addEventListener('touchstart', enter, { passive: true });
  entry.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') enter(); });
  entry.setAttribute('tabindex', '0');
})();

// ============================================================
// ПАСХАЛКА — секретные слова
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

// ============================================================
// МЕНЮ ПУСК
// ============================================================
(function initStartMenu() {
  const startBtn = document.getElementById('start-btn');
  const menu = document.getElementById('start-menu');
  const systemBtn = document.getElementById('start-system');
  const shutdownBtn = document.getElementById('start-shutdown');
  const overlay = document.getElementById('shutdown-overlay');
  if (!startBtn || !menu) return;

  function toggleStart(force) {
    const open = typeof force === 'boolean' ? force : !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    startBtn.classList.toggle('open', open);
    beep(open ? 700 : 400, 0.06, 'square', 0.05);
    haptic(open ? [10, 30, 10] : 10);
  }

  startBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleStart();
  });

  document.addEventListener('click', function (e) {
    if (!menu.classList.contains('open')) return;
    if (e.target.closest('#start-menu') || e.target.closest('#start-btn')) return;
    toggleStart(false);
  });

  menu.querySelectorAll('.start-app').forEach(function (el) {
    el.addEventListener('click', function () {
      toggleStart(false);
      if (typeof window.openApp === 'function') window.openApp(el.dataset.app);
    });
  });

  if (systemBtn) {
    systemBtn.addEventListener('click', function () {
      toggleStart(false);
      if (typeof window.openApp === 'function') window.openApp('system');
    });
  }

  if (shutdownBtn) {
    shutdownBtn.addEventListener('click', function () {
      toggleStart(false);
      if (!overlay) return;
      document.body.classList.add('shutting-down');
      beep(300, 0.4, 'sawtooth', 0.1);
      haptic([50, 100, 50]);
      setTimeout(function () {
        document.body.classList.remove('shutting-down');
        showToast('// шутка, не выключилось');
      }, 2500);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggleStart(false);
  });
})();

// ============================================================
// ПРОЩАЛЬНЫЙ ТОСТ
// ============================================================
(function initFarewell() {
  let shown = false;
  let cooldown = null;

  function farewell() {
    if (shown) return;
    shown = true;
    showToast('// возвращайся 👋');
    clearTimeout(cooldown);
    cooldown = setTimeout(function () { shown = false; }, 60000);
  }

  document.addEventListener('mouseleave', function (e) {
    if (e.clientY <= 0) farewell();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) farewell();
  });
})();

// ============================================================
// ПЛАВНОЕ КАЧАНИЕ ЛОГО (только лого)
// ============================================================
(function initLogoMotion() {
  const logo = document.querySelector('.wallpaper-logo');
  if (!logo) return;

  const LOGO_Y_AMP     = 12;
  const LOGO_ROT_AMP   = 2.2;
  const LOGO_SCALE_AMP = 0.025;
  const LOGO_SPEED     = 0.0005;

  let start = null;
  let rafId = null;

  function tick(ts) {
    if (!start) start = ts;
    const t = ts - start;

    const y = Math.sin(t * LOGO_SPEED * Math.PI * 2) * LOGO_Y_AMP;
    const rot = Math.sin(t * LOGO_SPEED * Math.PI * 2 + Math.PI * 0.5) * LOGO_ROT_AMP;
    const scale = 1 + Math.sin(t * LOGO_SPEED * Math.PI * 2 + Math.PI) * LOGO_SCALE_AMP;

    if (!logo.dataset.glitching) {
      logo.style.transform = 'translateY(' + y.toFixed(2) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
    }
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!rafId) {
      start = null;
      rafId = requestAnimationFrame(tick);
    }
  });
})();

// ============================================================
// CUTSCENE — War Without Reason
// ============================================================
const INTRO_FILES = [
  'audio/intro1.mp3', // 1. СИРЕНА (3 сек)
  'audio/intro2.mp3', // 2. РЁВ ЗЕМЛЕДВИГА (5 сек)
  'audio/intro3.mp3', // 3. ЗАРЯДКА РЕЛЬСАТРОНА (1 сек)
  'audio/intro4.mp3'  // 4. ВЗРЫВ
];

(function initCutscene() {
  const cutscene = document.getElementById('cutscene-screen');
  if (!cutscene) return;

  const lines = cutscene.querySelectorAll('.cutscene-line');
  const title = cutscene.querySelector('.cutscene-title');
  const subtitle = cutscene.querySelector('.cutscene-subtitle');

  let timers = [];
  let skipped = false;

  const sounds = INTRO_FILES.map(function (src) {
    const a = new Audio();
    a.preload = 'auto';
    a.src = src;
    return a;
  });

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];
    sounds.forEach(function (a) { try { a.pause(); } catch (e) {} });
  }

  function playSound(a, vol, fadeInMs) {
  if (!soundEnabled) return;
  try {
    const targetVol = vol || 1;
    a.volume = fadeInMs ? 0 : targetVol;
    a.currentTime = 0;
    const pr = a.play();
    if (pr && pr.catch) pr.catch(function () {});

    if (fadeInMs && fadeInMs > 0) {
      const steps = 30;
      const stepTime = fadeInMs / steps;
      const volStep = targetVol / steps;
      let i = 0;
      const fade = setInterval(function () {
        i++;
        if (i >= steps) {
          a.volume = targetVol;
          clearInterval(fade);
        } else {
          a.volume = Math.min(targetVol, volStep * i);
        }
      }, stepTime);
    }
  } catch (e) {}
  }

  function finish() {
    if (skipped) return;
    skipped = true;
    clearAll();
    cutscene.classList.add('hide');
    document.body.classList.add('entered');
    startBackgroundMusic();
    setTimeout(function () {
      if (cutscene.parentNode) cutscene.parentNode.removeChild(cutscene);
    }, 900);
  }

  function play() {
    cutscene.classList.add('active');
    if (typeof initAudio === 'function') initAudio();

    // ============================================================
    // ТАЙМЛАЙН (все числа в ms — можно крутить)
    // ============================================================
    // 0.3s    → intro1 СИРЕНА (играет ~3 сек)
    // 3.3s    → intro2 РЁВ ЗЕМЛЕДВИГА (играет ~5 сек)
    // 8.3s    → intro3 ЗАРЯДКА РЕЛЬСАТРОНА (играет ~1 сек)
    // 9.3s    → intro4 ВЗРЫВ
    // 12.0s   → БЕЛАЯ ВСПЫШКА + открытие сайта + старт WWoR
    // ============================================================

    // 1. СИРЕНА
    later(function () {
      playSound(sounds[0], 1, 800);
      haptic(60);
      lines[0].classList.add('show');
      beep(320, 0.18, 'sawtooth', 0.07);
    }, 300);

    // 2. РЁВ ЗЕМЛЕДВИГА
    later(function () {
      playSound(sounds[1], 1, 1000);
      haptic(90);
      lines[0].classList.remove('show');
      lines[1].classList.add('show');
      beep(420, 0.18, 'sawtooth', 0.07);
    }, 3300);

    // тексты во время рёва
    later(function () {
      lines[1].classList.remove('show');
      lines[2].classList.add('show');
      beep(520, 0.18, 'sawtooth', 0.07);
    }, 5500);

    later(function () {
      lines[2].classList.remove('show');
      lines[3].classList.add('show');
      beep(620, 0.18, 'sawtooth', 0.07);
    }, 7300);

    // 3. ЗАРЯДКА РЕЛЬСАТРОНА
    later(function () {
      playSound(sounds[2], 1);
      haptic(40);
      cutscene.classList.add('shake-small');
      setTimeout(function () { cutscene.classList.remove('shake-small'); }, 900);
    }, 8300);

    // 4. ВЗРЫВ + БЕЛАЯ ВСПЫШКА ОДНОВРЕМЕННО
    later(function () {
      playSound(sounds[3], 1);
      haptic([100, 50, 200, 50, 300]);
      cutscene.classList.add('shake', 'flash-red', 'flash-white');
      lines.forEach(function (l) { l.classList.add('flash'); });
      beep(120, 0.6, 'sawtooth', 0.11);
      beep(80, 0.8, 'sawtooth', 0.11);
      setTimeout(function () { cutscene.classList.remove('shake', 'flash-red'); }, 900);
    }, 9300);

    // 5. ФИНАЛ: сайт открывается сразу под белой вспышкой
    later(function () {
      finish(); // открывает сайт + стартует WWoR
    }, 9600);  
  }

  cutscene.addEventListener('click', finish);
  cutscene.addEventListener('touchstart', finish, { passive: true });
  document.addEventListener('keydown', function (e) {
    if (cutscene.classList.contains('active') && !skipped) {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        finish();
      }
    }
  });

  window.startCutscene = play;
})();
