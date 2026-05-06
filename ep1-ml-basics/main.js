import { init as initIngredients, reset as resetIngredients } from './sections/s1-ingredients.js';
import { init as initAssembly, reset as resetAssembly } from './sections/s2-assembly-line.js';
import { init as initJudge, reset as resetJudge } from './sections/s3-judge.js';
import { init as initGradient, reset as resetGradient } from './sections/s4-gradient.js';
import { init as initOverfitting, reset as resetOverfitting } from './sections/s5-overfitting.js';
import { init as initEpochs, reset as resetEpochs } from './sections/s6-epochs.js';
import { init as initWeights, reset as resetWeights } from './sections/s7-weights.js';
import { init as initBackprop, reset as resetBackprop } from './sections/s8-backprop.js';
import { narrator } from './narrator.js';

// Sound Manager
class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
  }

  ensureAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled) return;
    this.ensureAudioContext();

    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  plop() {
    this.playTone(300, 0.1);
  }

  ping() {
    this.playTone(800, 0.1);
  }

  success() {
    this.playTone(523, 0.2); // C5
    setTimeout(() => this.playTone(659, 0.2), 100); // E5
    setTimeout(() => this.playTone(784, 0.3), 200); // G5
  }

  error() {
    this.playTone(200, 0.15);
    setTimeout(() => this.playTone(150, 0.15), 150);
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}

const soundManager = new SoundManager();

// Navigation
class Navigation {
  constructor() {
    this.sections = [1, 2, 3, 4, 5, 6, 7, 8];
    this.currentSection = 1;
    this.init();
  }

  init() {
    this.setupScrollObserver();
    this.setupNavigation();
    this.setupHeroPizza();
    this.setupSoundToggle();
    this.setupNarratorToggle();
  }

  setupScrollObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionNum = entry.target.dataset.section;
          this.currentSection = parseInt(sectionNum);
          this.updateNavDots();
          narrator.speak(parseInt(sectionNum));
        }
      });
    }, options);

    document.querySelectorAll('.section').forEach((section) => {
      observer.observe(section);
    });
  }

  setupNavigation() {
    document.querySelectorAll('.nav-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const sectionNum = dot.dataset.section;
        const section = document.getElementById(`section-${sectionNum}`);
        section.scrollIntoView({ behavior: 'smooth' });
        soundManager.ping();
      });
    });
  }

  setupHeroPizza() {
    document.querySelectorAll('.hero-pizza path').forEach((path) => {
      path.addEventListener('click', (e) => {
        const allPaths = document.querySelectorAll('.hero-pizza path');
        const index = Array.from(allPaths).indexOf(path);
        const sectionNum = index + 1;
        const section = document.getElementById(`section-${sectionNum}`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
          soundManager.plop();
        }
      });

      path.addEventListener('mouseenter', () => {
        path.style.transform = 'translateY(-12px) scale(1.05)';
      });

      path.addEventListener('mouseleave', () => {
        path.style.transform = 'none';
      });
    });
  }

  setupSoundToggle() {
    const btn = document.getElementById('soundToggle');
    btn.addEventListener('click', () => {
      soundManager.toggle();
      btn.textContent = soundManager.enabled ? '🔊' : '🔇';
    });
  }

  setupNarratorToggle() {
    const btn = document.getElementById('narratorToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      narrator.toggle();
      btn.classList.toggle('active', narrator.enabled);
    });
  }

  updateNavDots() {
    document.querySelectorAll('.nav-dot').forEach((dot) => {
      dot.classList.remove('active');
    });
    const activeDot = document.querySelector(`.nav-dot[data-section="${this.currentSection}"]`);
    if (activeDot) {
      activeDot.classList.add('active');
    }
  }
}

// Initialize sections
class SectionManager {
  constructor() {
    this.sections = {
      1: { init: initIngredients, reset: resetIngredients },
      2: { init: initAssembly, reset: resetAssembly },
      3: { init: initJudge, reset: resetJudge },
      4: { init: initGradient, reset: resetGradient },
      5: { init: initOverfitting, reset: resetOverfitting },
      6: { init: initEpochs, reset: resetEpochs },
      7: { init: initWeights, reset: resetWeights },
      8: { init: initBackprop, reset: resetBackprop },
    };
  }

  init() {
    for (let i = 1; i <= 8; i++) {
      const container = document.getElementById(`${['ingredients', 'assembly', 'judge', 'gradient', 'overfitting', 'epochs', 'weights', 'backprop'][i - 1]}-container`);
      if (container && this.sections[i]) {
        this.sections[i].init(container);
      }
    }
  }

  reset(sectionNum) {
    if (this.sections[sectionNum]) {
      this.sections[sectionNum].reset();
    }
  }
}

// Global exports for sections
window.soundManager = soundManager;
window.narrator = narrator;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
  const sectionManager = new SectionManager();
  sectionManager.init();
});
