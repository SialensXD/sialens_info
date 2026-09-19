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
   LOADER + TERMINAL
   ============================================================ */

// ---------- ЗАГРУЗОЧНЫЙ ЭКРАН ----------
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Если уже показывали в этой сессии — убираем сразу
  if (sessionStorage.getItem('sialens_loaded')) {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
    return;
  }

  const pctEl = document.getElementById('loader-pct');
  const fillEl = loader.querySelector('.loader-fill');
  let p = 0;

  const tick = setInterval(function () {
    p += Math.random() * 14 + 5;
    if (p > 100) p = 100;
    if (pctEl) pctEl.textContent = Math.floor(p);
    if (fillEl) fillEl.style.width = p + '%';

    if (p >= 100) {
      clearInterval(tick);
      setTimeout(function () {
        loader.classList.add('done');
        try { sessionStorage.setItem('sialens_loaded', '1'); } catch (e) {}
        setTimeout(function () {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 600);
      }, 250);
    }
  }, 90);
})();

// ---------- ТЕРМИНАЛ ----------
(function () {
  const toggle = document.getElementById('terminal-toggle');
  const term = document.getElementById('terminal');
  const closeBtn = document.getElementById('terminal-close');
  const body = document.getElementById('terminal-body');
  const input = document.getElementById('terminal-input');

  if (!toggle  !term  !body || !input) return;

  let greeted = false;

  function print(text, cls) {
    const line = document.createElement('div');
    line.className = 'term-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function printMulti(lines) {
    lines.forEach(function (l) { print(l); });
  }

  function openTerm() {
    term.classList.add('open');
    toggle.classList.add('active');
    document.body.classList.add('term-open');

    if (!greeted) {
      greeted = true;
      printMulti([
        'SIALENS OS v1.1 // терминал активен',
        '// введи help чтобы увидеть команды'
      ]);
    }
    setTimeout(function () { input.focus(); }, 120);
    beep(700, 0.06, 'square', 0.05);
  }

  function closeTerm() {
    term.classList.remove('open');
    toggle.classList.remove('active');
    document.body.classList.remove('term-open');
    beep(400, 0.06, 'square', 0.05);
  }

  function toggleTerm() {
    if (term.classList.contains('open')) closeTerm();
    else openTerm();
  }

  toggle.addEventListener('click', toggleTerm);
  if (closeBtn) closeBtn.addEventListener('click', closeTerm);

  // Горячая клавиша ~ или  (тильда) — только ПК
  document.addEventListener('keydown', function (e) {
    if (e.key === ''  e.key === '~'  e.key === 'ё' || e.key === 'Ё') {
      if (document.activeElement !== input) {
        e.preventDefault();
        toggleTerm();
      }
    }
    if (e.key === 'Escape' && term.classList.contains('open')) {
      closeTerm();
    }
  });

  // Клик по телу терминала → фокус в input (для мобилы)
  body.addEventListener('click', function () { input.focus(); });

  // ---------- КОМАНДЫ ----------
  const commands = {
    help: function () {
      printMulti([
        '// доступные команды:',
        '  help      — этот список',
        '  whoami    — кто я',
        '  about     — коротко обо мне',
        '  skills    — что умею',
        '  games     — во что играю',
        '  music     — что слушаю',
        '  social    — где меня найти',
        '  chaos     — ???',
        '  date      — дата и время',
        '  echo X    — повторить X',
        '  clear     — очистить экран',
        '  exit      — закрыть терминал'
      ]);
    },
    whoami: function () {
      printMulti([
        'Sialens // 14 лет // 9 класс',
        'человек-эмоция, хаос = порядок'
      ]);
    },
    about: function () {
      printMulti([
        'пишу ботов на Python, иногда сайты.',
        'люблю шутеры, песочницы, рогалики.',
        'музыка — топливо, бессонница — режим по умолчанию.'
      ]);
    },
    skills: function () {
      printMulti([
        'python   [████████░░] 80%',
        'js/html  [██████░░░░] 60%',
        'chaos    [██████████] 100%'
      ]);
    },
    games: function () {
      printMulti([
        'шутеры:    Ultrakill, DOOM Eternal, DUSK',
        'песочницы: Minecraft, Terraria',
        'рогалики:  Hades, Dead Cells, Risk of Rain 2'
      ]);
    },
    music: function () {
      print('// допишу позже :)');
    },
    social: function () {
      printMulti([
        'всё под ником @sialens_xd',
        'основное место — TikTok'
      ]);
    },
    chaos: function () {
      print('// activating blood mode...', 'red');
      if (typeof triggerBloodMode === 'function') triggerBloodMode();
    },
    date: function () {
      print(new Date().toLocaleString('ru-RU'));
    },
    sudo: function () {
      print('sialens is not in the sudoers file. this incident will be reported.', 'red');
    },
    exit: function () {
      closeTerm();
    }
  };

  function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    print('$ ' + trimmed, 'cmd');

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmd === 'clear') {
      body.innerHTML = '';
      return;
    }
    if (cmd === 'echo') {
      print(args.join(' '));
      return;
    }
    if (commands[cmd]) {
      commands[cmd](args);
    } else {
      print('команда не найдена: ' + cmd + ' (попробуй help)', 'red');
    }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      runCommand(val);
      beep(1000, 0.03, 'square', 0.05);
      haptic(6);
    }
  });
})();