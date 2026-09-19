// ============ ЗВУК (Web Audio, без файлов) ============
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Аудио недоступно');
    }
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

// Инициализация аудио — по первому касанию/клику
['click', 'keydown', 'touchstart'].forEach(ev =>
  window.addEventListener(ev, initAudio, { once: true })
);

// Ховер-звуки
document.querySelectorAll('[data-sound-hover]').forEach(el => {
  el.addEventListener('mouseenter', () => beep(1200, 0.04, 'square', 0.025));
});

// Клик-звуки
document.querySelectorAll('[data-sound-click], a[href]').forEach(el => {
  el.addEventListener('click', () => beep(300, 0.09, 'sawtooth', 0.05));
});

// Кнопка звука
const soundBtn = document.getElementById('sound-toggle');
soundBtn.classList.add('on');
soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundBtn.classList.toggle('on', soundEnabled);
  soundBtn.textContent = soundEnabled ? '◉ SND' : '○ MUTE';
  if (soundEnabled) {
    initAudio();
    beep(900, 0.08, 'square', 0.05);
  }
});

// ============ REVEAL ANIMATION ============
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ============ ГОД В ФУТЕРЕ ============
document.getElementById('year').textContent = new Date().getFullYear();

// ============ ГЛИТЧ-ВСПЫШКИ НА HERO ============
const glitchEl = document.querySelector('.glitch');
if (glitchEl) {
  setInterval(() => {
    if (Math.random() < 0.15) {
      glitchEl.style.transform = translate(${(Math.random()-0.5)*4}px, ${(Math.random()-0.5)*4}px);
      setTimeout(() => glitchEl.style.transform = '', 80);
    }
  }, 1500);
}