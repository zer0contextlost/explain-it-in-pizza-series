import { init as initReactLoop, reset as resetReactLoop } from './sections/s1-react-loop.js';
import { init as initToolCalling, reset as resetToolCalling } from './sections/s2-tool-calling.js';
import { init as initPlanning, reset as resetPlanning } from './sections/s3-planning.js';
import { init as initMemoryShort, reset as resetMemoryShort } from './sections/s4-short-term-memory.js';
import { init as initMemoryLong, reset as resetMemoryLong } from './sections/s5-long-term-memory.js';
import { init as initMultiAgent, reset as resetMultiAgent } from './sections/s6-multi-agent.js';
import { init as initInfiniteLoop, reset as resetInfiniteLoop } from './sections/s7-infinite-loop.js';
import { init as initHallucinatedTools, reset as resetHallucinatedTools } from './sections/s8-hallucinated-tools.js';
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
      1: { init: initReactLoop, reset: resetReactLoop },
      2: { init: initToolCalling, reset: resetToolCalling },
      3: { init: initPlanning, reset: resetPlanning },
      4: { init: initMemoryShort, reset: resetMemoryShort },
      5: { init: initMemoryLong, reset: resetMemoryLong },
      6: { init: initMultiAgent, reset: resetMultiAgent },
      7: { init: initInfiniteLoop, reset: resetInfiniteLoop },
      8: { init: initHallucinatedTools, reset: resetHallucinatedTools },
    };
  }

  init() {
    for (let i = 1; i <= 8; i++) {
      const containerNames = ['react-loop', 'tool-calling', 'planning', 'memory-short', 'memory-long', 'multi-agent', 'infinite-loop', 'hallucinated-tools'];
      const container = document.getElementById(`${containerNames[i - 1]}-container`);
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
