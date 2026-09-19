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
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
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