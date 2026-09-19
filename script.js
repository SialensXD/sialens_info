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