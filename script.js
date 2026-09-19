// ============ ЗВУК ===========
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { console.warn('Аудио недоступно'); }
  }
}

function beep(freq = 800, dur = 0.06, type = 'square', vol = 0.04) {
  if (!soundEnabled || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + dur);
}

['click', 'keydown', 'touchstart'].forEach(ev =>
  window.addEventListener(ev, initAudio, { once: true })
);

// ============ ВИБРАЦИЯ (мобила) ============
function haptic(pattern = 10) {
  if (navigator.vibrate && soundEnabled) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

document.querySelectorAll('[data-sound-hover]').forEach(el => {
  el.addEventListener('mouseenter', () => beep(1200, 0.04, 'square', 0.025));
});

document.querySelectorAll('[data-sound-click], a[href]').forEach(el => {
  el.addEventListener('click', () => {
    beep(300, 0.09, 'sawtooth', 0.05);
    haptic(8);
  });
});

const soundBtn = document.getElementById('sound-toggle');
soundBtn.classList.add('on');
soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundBtn.classList.toggle('on', soundEnabled);
  soundBtn.textContent = soundEnabled ? '◉ SND' : '○ MUTE';
  if (soundEnabled) {
    initAudio();
    beep(900, 0.08, 'square', 0.05);
    haptic(12);
  }
});

// ============ БУРГЕР-МЕНЮ ============
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = mobileMenu.querySelectorAll('a');

function toggleMenu(force) {
  const open = force !== undefined ? force : !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  beep(open ? 600 : 400, 0.08, 'square', 0.04);
  haptic(open ? [10, 30, 10] : 10);
}

burger.addEventListener('click', () => toggleMenu());
mobileLinks.forEach(a => a.addEventListener('click', () => toggleMenu(false)));

// ============ REVEAL ============
const reveals = document.querySelectorAll('.reveal');

function revealElement(el) { el.classList.add('visible'); }
function revealAll() { reveals.forEach(revealElement); }

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });

  reveals.forEach(el => {
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

window.addEventListener('pageshow', () => {
  setTimeout(() => {
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && !el.classList.contains('visible')) {
        revealElement(el);
      }
    });
  }, 200);
});

// ============ ГОД ============
document.getElementById('year').textContent = new Date().getFullYear();

// ============ ГЛИТЧ НА ИМЕНИ ============
const glitchEl = document.querySelector('.glitch');
if (glitchEl) {
  setInterval(() => {
    if (Math.random() < 0.15) {
      glitchEl.style.transform = translate(${(Math.random()-0.5)*4}px, ${(Math.random()-0.5)*4}px);
      setTimeout(() => glitchEl.style.transform = '', 80);
    }
  }, 1500);
}

// ============ КАСТОМНЫЙ КУРСОР (только ПК) ============
if (window.matchMedia('(pointer: fine)').matches) {
  document.body.classList.add('has-cursor');
  const cur = document.createElement('div');
  cur.className = 'custom-cursor';
  document.body.appendChild(cur);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
  });

  (function animate() {
    cx += (mx - cx) * 0.35;
    cy += (my - cy) * 0.35;
    cur.style.left = cx + 'px';
    cur.style.top = cy + 'px';
    requestAnimationFrame(animate);
  })();

  const hoverTargets = document.querySelectorAll('a, button, .card, [data-sound-hover], .contact-link');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });
}

// ============ ТОСТ ============
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

// ============ КОПИРОВАНИЕ НИКА ============
const copyNick = document.getElementById('copy-nick');
if (copyNick) {
  copyNick.addEventListener('click', async (e) => {
    e.preventDefault();
    const nick = copyNick.dataset.copy || 'sialens_xd';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(nick);
      } else {
        const ta = document.createElement('textarea');
        ta.value = nick;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('скопировано // @' + nick);
      haptic([10, 30, 10]);
    } catch (err) {
      showToast('не получилось :(');
    }
  });
}

// ============ ПАСХАЛКА: 5 ТАПОВ ПО ЛОГО → BLOOD MODE ============
const logoEl = document.getElementById('logo');
const bloodFlash = document.getElementById('blood-flash');
let logoClicks = 0;
let logoTimer;

if (logoEl && bloodFlash) {
  logoEl.addEventListener('click', () => {
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => { logoClicks = 0; }, 1500);

    if (logoClicks >= 5) {
      logoClicks = 0;
      triggerBloodMode();
    }
  });
}

let bloodActive = false;
let bloodEndTimer;

function triggerBloodMode() {
  bloodActive = !bloodActive;
  document.body.classList.toggle('blood-mode', bloodActive);
  bloodFlash.classList.toggle('show', bloodActive);

  if (bloodActive) {
    beep(120, 0.4, 'sawtooth', 0.08);
    setTimeout(() => beep(80, 0.5, 'sawtooth', 0.08), 150);
    haptic([30, 60, 30, 60, 200]);
    showToast('// blood mode activated //');
    clearTimeout(bloodEndTimer);
    bloodEndTimer = setTimeout(() => {
      bloodActive = false;
      document.body.classList.remove('blood-mode');
      bloodFlash.classList.remove('show');
    }, 6000);
  } else {
    haptic(10);
  }
}
