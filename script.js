// ============ ЗВУК ============
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

document.querySelectorAll('[data-sound-hover]').forEach(el => {
  el.addEventListener('mouseenter', () => beep(1200, 0.04, 'square', 0.025));
});

document.querySelectorAll('[data-sound-click], a[href]').forEach(el => {
  el.addEventListener('click', () => beep(300, 0.09, 'sawtooth', 0.05));
});

const soundBtn = document.getElementById('sound-toggle');
soundBtn.classList.add('on');
soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundBtn.classList.toggle('on', soundEnabled);
  soundBtn.textContent = soundEnabled ? '◉ SND' : '○ MUTE';
  if (soundEnabled) { initAudio(); beep(900, 0.08, 'square', 0.05); }
});

// ============ REVEAL (исправлено) ============
const reveals = document.querySelectorAll('.reveal');

function revealElement(el) {
  el.classList.add('visible');
}

function revealAll() {
  reveals.forEach(revealElement);
}

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
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewport) {
      revealElement(el); // уже видно — показываем сразу
    } else {
      observer.observe(el);
    }
  });

  // Страховка: если что-то пошло не так — раскрываем всё
  setTimeout(revealAll, 4000);
} else {
  revealAll(); // старый браузер — просто всё показываем
}

// На всякий случай: если юзер вернулся к вкладке и что-то пропущено
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
