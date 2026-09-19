/* ============================================================
   SIALENS — script.js
   ============================================================ */

// ---------- АУДИО ----------
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (audioCtx) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  } catch (e) {
    console.warn('Audio unavailable');
  }
}

function beep(freq, dur, type, vol) {
  freq = freq || 800;
  dur  = dur  || 0.06;
  type = type || 'square';
  vol  = vol  || 0.04;
  vol = vol * 3;
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol * 3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

['click', 'keydown', 'touchstart'].forEach(function (ev) {
  window.addEventListener(ev, initAudio, { once: true });
});

// ---------- ВИБРАЦИЯ ----------
function haptic(pattern) {
  if (!soundEnabled) return;
  if (!navigator.vibrate) return;
  try {
    navigator.vibrate(pattern || 10);
  } catch (e) {}
}

// ---------- ЗВУКИ НА HOVER / CLICK ----------
document.querySelectorAll('[data-sound-hover]').forEach(function (el) {
  el.addEventListener('mouseenter', function () {
    beep(1200, 0.04, 'square', 0.025);
  });
});

document.querySelectorAll('[data-sound-click], a[href]').forEach(function (el) {
  el.addEventListener('click', function () {
    beep(300, 0.09, 'sawtooth', 0.05);
    haptic(8);
  });
});

// ---------- КНОПКА ЗВУКА ----------
const soundBtn = document.getElementById('sound-toggle');
if (soundBtn) {
  soundBtn.classList.add('on');
  soundBtn.addEventListener('click', function () {
    soundEnabled = !soundEnabled;
    soundBtn.classList.toggle('on', soundEnabled);
    soundBtn.textContent = soundEnabled ? '◉ SND' : '○ MUTE';
    if (soundEnabled) {
      initAudio();
      beep(900, 0.08, 'square', 0.05);
      haptic(12);
    }
  });
}

// ---------- БУРГЕР-МЕНЮ ----------
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');

function toggleMenu(force) {
  if (!burger || !mobileMenu) return;
  const isOpen = mobileMenu.classList.contains('open');
  const open = typeof force === 'boolean' ? force : !isOpen;

  if (open) {
    mobileMenu.classList.add('open');
    burger.classList.add('open');
    document.body.classList.add('menu-open');
    beep(600, 0.08, 'square', 0.04);
    haptic([10, 30, 10]);
  } else {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
    document.body.classList.remove('menu-open');
    beep(400, 0.08, 'square', 0.04);
    haptic(10);
  }
}

if (burger && mobileMenu) {
  burger.addEventListener('click', function () {
    toggleMenu();
  });

  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      toggleMenu(false);
    });
  });
}

// ---------- REVEAL ----------
const reveals = document.querySelectorAll('.reveal');

function revealElement(el) {
  el.classList.add('visible');
}
function revealAll() {
  reveals.forEach(revealElement);
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        revealElement(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });

  reveals.forEach(function (el) {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealElement(el);
    } else {
      observer.observe(el);
    }
  });

  setTimeout(revealAll, 4000);
} else {
  revealAll();
}

window.addEventListener('pageshow', function () {
  setTimeout(function () {
    reveals.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && !el.classList.contains('visible')) {
        revealElement(el);
      }
    });
  }, 200);
});

// ---------- ГОД ----------
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ---------- ГЛИТЧ ИМЕНИ ----------
const glitchEl = document.querySelector('.glitch');
if (glitchEl) {
  setInterval(function () {
    if (Math.random() < 0.15) {
      const dx = (Math.random() - 0.5) * 4;
      const dy = (Math.random() - 0.5) * 4;
      glitchEl.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      setTimeout(function () {
        glitchEl.style.transform = '';
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

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx;
  let cy = my;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    cx += (mx - cx) * 0.35;
    cy += (my - cy) * 0.35;
    cur.style.left = cx + 'px';
    cur.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .card, [data-sound-hover], .contact-link').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cur.classList.add('hover'); });
    el.addEventListener('mouseleave', function () { cur.classList.remove('hover'); });
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
  toastTimer = setTimeout(function () {
    toastEl.classList.remove('show');
  }, 2200);
}

// ---------- КОПИРОВАНИЕ НИКА ----------
function copyToClipboard(text) {
  return new Promise(function (resolve) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        resolve(true);
      }).catch(function () {
        resolve(fallbackCopy(text));
      });
    } else {
      resolve(fallbackCopy(text));
    }
  });
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

const copyNick = document.getElementById('copy-nick');
if (copyNick) {
  copyNick.addEventListener('click', function (e) {
    e.preventDefault();
    const nick = copyNick.getAttribute('data-copy') || 'sialens_xd';
    copyToClipboard(nick).then(function (ok) {
      if (ok) {
        showToast('скопировано // @' + nick);
        haptic([10, 30, 10]);
      } else {
        showToast('не получилось :(');
      }
    });
  });
}

// ---------- ПАСХАЛКА: BLOOD MODE ----------
const logoEl = document.getElementById('logo');
const bloodFlash = document.getElementById('blood-flash');
let logoClicks = 0;
let logoTimer = null;
let bloodActive = false;
let bloodEndTimer = null;

function triggerBloodMode() {
  bloodActive = !bloodActive;
  document.body.classList.toggle('blood-mode', bloodActive);
  bloodFlash.classList.toggle('show', bloodActive);

  if (bloodActive) {
    beep(120, 0.4, 'sawtooth', 0.08);
    setTimeout(function () { beep(80, 0.5, 'sawtooth', 0.08); }, 150);
    haptic([30, 60, 30, 60, 200]);
    showToast('// blood mode activated //');
    clearTimeout(bloodEndTimer);
    bloodEndTimer = setTimeout(function () {
      bloodActive = false;
      document.body.classList.remove('blood-mode');
      bloodFlash.classList.remove('show');
    }, 6000);
  } else {
    haptic(10);
  }
}

if (logoEl && bloodFlash) {
  logoEl.addEventListener('click', function () {
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(function () { logoClicks = 0; }, 1500);

    if (logoClicks >= 5) {
      logoClicks = 0;
      triggerBloodMode();
    }
  });
}

/* ============================================================
   ТЕРМИНАЛ
   ============================================================ */
(function initTerminal() {
  const termEl   = document.getElementById('terminal');
  const termBody = document.getElementById('term-body');
  const termInput= document.getElementById('term-input');
  const termOpen = document.getElementById('term-toggle');
  const termClose= document.getElementById('term-close');
  if (!termEl || !termBody || !termInput) return;

  const PROMPT = 'sialens@chaos:~$';

  function line(text, cls) {
    const div = document.createElement('div');
    div.className = 'term-line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function printLines(arr, cls) {
    arr.forEach(function (t) { line(t, cls); });
  }

  const commands = {
    help: function () {
      printLines([
        '> доступные команды:',
        '  help       — этот список',
        '  whoami     — кто я',
        '  games      — во что играю',
        '  music      — что слушаю',
        '  contact    — как связаться',
        '  stats      — характеристики',
        '  chaos      — включить blood mode',
        '  echo <t>   — повторить текст',
        '  ls         — список файлов',
        '  sudo       — попробуй :)',
        '  clear      — очистить экран'
      ], '');
    },
    whoami: function () {
      printLines([
        'Sialens · 14 лет · 9 класс',
        'человек-эмоция · python · ultrakill',
        'принцип: chaos = order'
      ]);
    },
    games: function () {
      printLines([
        '> шутеры:    Ultrakill, DOOM Eternal, DUSK',
        '> песочницы: Minecraft, Terraria',
        '> рогалики:  Hades, Dead Cells, Risk of Rain 2'
      ]);
    },
    music: function () {
      printLines([
        '> плейлист пока пополняется...',
        '> (допишу позже)'
      ], 'dim');
    },
    contact: function () {
      printLines([
        '> tiktok: @sialens_xd',
        '> везде под этим ником',
        '> нажми на ник в секции "связь" — скопируется'
      ]);
    },
    stats: function () {
      printLines([
        '> возраст:     14',
        '> класс:       9',
        '> стек:        Python',
        '> режим:       chaos',
        '> бессонница:  постоянная'
      ]);
    },
    chaos: function () {
      line('> АКТИВИРУЮ ХАОС...', 'err');
      if (typeof triggerBloodMode === 'function') {
        if (!document.body.classList.contains('blood-mode')) {
          triggerBloodMode();
        } else {
          line('  blood mode уже активен', 'dim');
        }
      }
    },
    ls: function () {
      printLines([
        'index.html    style.css    script.js',
        'chaos.txt     insomnia.log secrets.enc'
      ], 'dim');
    },
    sudo: function () {
      printLines([
        'sialens is not in the sudoers file.',
        'This incident has been reported. 🩸'
      ], 'err');
    },
    clear: function () {
      termBody.innerHTML = '';
    }
  };

  function runCommand(raw) {
    const input = raw.trim();
    if (!input) return;

    line(PROMPT + ' ' + input, 'cmd');

    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const rest = parts.slice(1).join(' ');

    if (cmd === 'echo') {
      line(rest || '', '');
      return;
    }
    if (commands[cmd]) {
      commands[cmd]();
      beep(900, 0.05, 'square', 0.05);
    } else {
      line("команда не найдена: '" + cmd + "'. напиши 'help'.", 'err');
      beep(200, 0.1, 'sawtooth', 0.06);
    }
  }

  function openTerm() {
    termEl.classList.add('open');
    termOpen.classList.add('open');
    setTimeout(function () { termInput.focus(); }, 300);
    beep(700, 0.06, 'square', 0.05);
    haptic(10);
  }
  function closeTerm() {
    termEl.classList.remove('open');
    termOpen.classList.remove('open');
    beep(400, 0.06, 'square', 0.05);
  }
  function toggleTerm() {
    if (termEl.classList.contains('open')) closeTerm();
    else openTerm();
  }

  termOpen.addEventListener('click', toggleTerm);
  if (termClose) termClose.addEventListener('click', closeTerm);

  termInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      runCommand(termInput.value);
      termInput.value = '';
    }
  });

  // Клавиша ~ или ` открывает терминал (только ПК)
  document.addEventListener('keydown', function (e) {
    if (e.key === '`' || e.key === '~' || e.key === 'ё' || e.key === 'Ё') {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      toggleTerm();
    }
    if (e.key === 'Escape' && termEl.classList.contains('open')) {
      closeTerm();
    }
  });
})();

/* ============================================================
   СТАТУС-БАР В ФУТЕРЕ
   ============================================================ */
(function initStatusBar() {
  const clockEl    = document.getElementById('status-clock');
  const insomniaEl = document.getElementById('status-insomnia');
  if (!clockEl || !insomniaEl) return;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    const now = new Date();
    clockEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

    const h = now.getHours();
    const isNight = (h >= 23 || h < 6);
    if (isNight) {
      insomniaEl.textContent = 'активна';
      insomniaEl.className = 'awake blink';
    } else {
      insomniaEl.textContent = 'спит';
      insomniaEl.className = 'sleep';
    }
  }
  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   CANVAS ЧАСТИЦЫ
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // На мобиле меньше частиц, чтобы не жрало батарею
  const isMobile = window.matchMedia('(max-width: 768px)').matches
                || window.matchMedia('(pointer: coarse)').matches;
  const COUNT = isMobile ? 28 : 70;
  const LINK_DIST = isMobile ? 0 : 130; // связи между частицами — только на ПК
  const MAX_SPEED = isMobile ? 0.25 : 0.4;

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let rafId = null;

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.05, MAX_SPEED);
    return {
      x: rand(0, W),
      y: rand(0, H),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: rand(0.6, 1.8),
      alpha: rand(0.25, 0.75),
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.01, 0.03)
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(createParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ---- связи между частицами (только ПК) ----
    if (LINK_DIST > 0) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < LINK_DIST * LINK_DIST) {
            const d = Math.sqrt(distSq);
            const alpha = (1 - d / LINK_DIST) * 0.18;
            ctx.strokeStyle = 'rgba(230, 0, 0, ' + alpha + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // ---- сами частицы ----
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // притяжение к курсору (лёгкое) — только если мышь активна
      if (mouse.active && !isMobile) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;
        const R = 160;
        if (distSq < R * R && distSq > 0.01) {
          const d = Math.sqrt(distSq);
          const force = (1 - d / R) * 0.06;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }

      // затухание скорости
      p.vx *= 0.995;
      p.vy *= 0.995;

      // ограничение скорости
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > MAX_SPEED) {
        p.vx = (p.vx / sp) * MAX_SPEED;
        p.vy = (p.vy / sp) * MAX_SPEED;
      }

      p.x += p.vx;
      p.y += p.vy;

      // пульсация альфы
      p.pulse += p.pulseSpeed;
      const a = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);

      // телепорт через края
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // свечение
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      grd.addColorStop(0, 'rgba(255, 60, 60, ' + a + ')');
      grd.addColorStop(0.4, 'rgba(230, 0, 0, ' + (a * 0.4) + ')');
      grd.addColorStop(1, 'rgba(230, 0, 0, 0)');

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
      ctx.fill();

      // ядро
      ctx.fillStyle = 'rgba(255, 90, 90, ' + a + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  // ---- события ----
  window.addEventListener('resize', function () {
    resize();
    initParticles();
  });

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  document.addEventListener('mouseleave', function () {
    mouse.active = false;
  });

  // тап на мобиле — короткая вспышка частиц от точки тапа
  document.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches.length) return;
    const t = e.touches[0];
    for (let i = 0; i < 6; i++) {
      const p = createParticle();
      p.x = t.clientX;
      p.y = t.clientY;
      const ang = rand(0, Math.PI * 2);
      const sp = rand(0.5, 1.6);
      p.vx = Math.cos(ang) * sp;
      p.vy = Math.sin(ang) * sp;
      p.r = rand(0.8, 1.6);
      p.alpha = 1;
      particles.push(p);
    }
    // держим список в разумных размерах
    if (particles.length > COUNT + 40) {
      particles.splice(0, particles.length - COUNT - 40);
    }
  }, { passive: true });

  // ---- старт ----
  resize();
  initParticles();
  draw();

  // Пауза, если вкладка неактивна — экономия ресурсов
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!rafId) {
      draw();
    }
  });
})();

/* ============================================================
   СОЦКНОПКИ — копирование ника
   ============================================================ */
document.querySelectorAll('.social[data-copy]').forEach(function (el) {
  el.addEventListener('click', function (e) {
    e.preventDefault();
    const nick = el.getAttribute('data-copy') || 'sialens_xd';
    copyToClipboard(nick).then(function (ok) {
      showToast(ok ? 'скопировано // @' + nick : 'не получилось :(');
      haptic([10, 30, 10]);
    });
  });
});

/* ============================================================
   МУЗЫКАЛЬНЫЙ ПЛЕЕР — синтез через Web Audio
   ============================================================ */
(function initMusicPlayer() {
  const btn       = document.getElementById('player-play');
  const statusEl  = document.getElementById('player-status');
  const volSlider = document.getElementById('player-vol');
  if (!btn || !volSlider) return;

  let musicGain = null;
  let musicPlaying = false;
  let schedulerId = null;
  let nextNoteTime = 0;
  let currentStep = 0;

  const BPM = 90;
  const STEP_DUR = 60 / BPM / 4; // 16-я нота

  const BASS_NOTES = [110.00, 87.31, 130.81, 98.00]; // Am F C G
  const ARP_NOTES = [
    [220.00, 261.63, 329.63, 440.00], // Am
    [174.61, 220.00, 261.63, 349.23], // F
    [261.63, 329.63, 392.00, 523.25], // C
    [196.00, 246.94, 293.66, 392.00]  // G
  ];

  function ensureCtx() {
    if (!audioCtx) initAudio();
    if (!audioCtx) return false;
    if (!musicGain) {
      musicGain = audioCtx.createGain();
      musicGain.gain.value = (volSlider.value / 100) * 0.5;
      musicGain.connect(audioCtx.destination);
    }
    return true;
  }

  function noiseBuffer(seconds) {
    const len = Math.floor(audioCtx.sampleRate * seconds);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function kick(t) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + 0.4);
  }

  function snare(t) {
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer(0.2);
    const f = audioCtx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 1000;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    src.connect(f); f.connect(g); g.connect(musicGain);
    src.start(t); src.stop(t + 0.2);
  }

  function hihat(t, vol) {
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer(0.05);
    const f = audioCtx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 7500;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(f); f.connect(g); g.connect(musicGain);
    src.start(t); src.stop(t + 0.06);
  }

  function bass(freq, t) {
    const o = audioCtx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(220, t + 0.6);
    f.Q.value = 4;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.26, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.9);
    o.connect(f); f.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + 2);
  }

  function arp(freq, t) {
    const o = audioCtx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + 0.22);
  }

  function scheduler() {
    if (!musicPlaying) return;
    while (nextNoteTime < audioCtx.currentTime + 0.12) {
      const step = currentStep % 64;
      const bar  = Math.floor(step / 16);
      const beat = Math.floor((step % 16) / 4);
      const sub  = step % 4;

      if (sub === 0 && (beat === 0 || beat === 2)) kick(nextNoteTime);
      if (sub === 0 && (beat === 1 || beat === 3)) snare(nextNoteTime);
      if (sub % 2 === 0) hihat(nextNoteTime, sub === 0 ? 0.13 : 0.07);
      if (step % 16 === 0) bass(BASS_NOTES[bar], nextNoteTime);
      arp(ARP_NOTES[bar][sub], nextNoteTime);

      nextNoteTime += STEP_DUR;
      currentStep++;
    }
    schedulerId = setTimeout(scheduler, 25);
  }

  function start() {
    if (!ensureCtx()) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    musicPlaying = true;
    nextNoteTime = audioCtx.currentTime + 0.05;
    currentStep = 0;
    scheduler();
    btn.textContent = '❚❚';
    btn.classList.add('playing');
    if (statusEl) statusEl.textContent = 'playing';
    beep(900, 0.06, 'square', 0.05);
  }

  function stop() {
    musicPlaying = false;
    if (schedulerId) { clearTimeout(schedulerId); schedulerId = null; }
    btn.textContent = '▶';
    btn.classList.remove('playing');
    if (statusEl) statusEl.textContent = 'остановлено';
    beep(400, 0.08, 'square', 0.05);
  }

  btn.addEventListener('click', function () {
    if (musicPlaying) stop(); else start();
    haptic(10);
  });

  volSlider.addEventListener('input', function () {
    if (musicGain) {
      musicGain.gain.setTargetAtTime((volSlider.value / 100) * 0.5, audioCtx.currentTime, 0.05);
    }
  });

  // Авто-запуск при первом клике/тапе (иначе браузер не даст)
  let autoStarted = false;
  function tryAutoStart() {
    if (autoStarted) return;
    autoStarted = true;
    start();
    setTimeout(function () {
      if (musicPlaying && statusEl) statusEl.textContent = 'auto-play';
    }, 100);
  }
  window.addEventListener('click', tryAutoStart, { once: true });
  window.addEventListener('touchstart', tryAutoStart, { once: true, passive: true });
})();

/* ============================================================
   СТРЕЛКА ВВЕРХ
   ============================================================ */
(function initToTop() {
  const btn = document.getElementById('to-top');
  if (!btn) return;

  function update() {
    if (window.scrollY > 400) btn.classList.add('show');
    else btn.classList.remove('show');
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    beep(800, 0.08, 'square', 0.05);
    haptic(10);
  });
})();

/* ============================================================
   ПАСХАЛКА — секретные слова на клавиатуре
   ============================================================ */
(function initSecretWords() {
  const WORDS = {
    chaos:     { toast: '// CHAOS UNLOCKED //',     blood: true },
    ultrakill: { toast: '// V1 APPROVES //',        blood: true },
    sialens:   { toast: '// ДОБРО ПОЖАЛОВАТЬ //',   blood: false }
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
        const conf = WORDS[word];
        showToast(conf.toast);
        if (conf.blood && !document.body.classList.contains('blood-mode')) {
          triggerBloodMode();
        } else {
          beep(1500, 0.15, 'square', 0.08);
          haptic([15, 40, 15, 40, 100]);
        }
        buffer = '';
        break;
      }
    }
  });
})();