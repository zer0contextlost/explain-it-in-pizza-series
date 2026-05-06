import { init as initRetrieval, reset as resetRetrieval } from './sections/s1-retrieval-problem.js';
import { init as initEmbeddings, reset as resetEmbeddings } from './sections/s2-vector-embeddings.js';
import { init as initDatabase, reset as resetDatabase } from './sections/s3-vector-database.js';
import { init as initCosine, reset as resetCosine } from './sections/s4-cosine-similarity.js';
import { init as initChunking, reset as resetChunking } from './sections/s5-chunking.js';
import { init as initContext, reset as resetContext } from './sections/s6-context-injection.js';
import { init as initGrounding, reset as resetGrounding } from './sections/s7-grounding.js';
import { init as initCitation, reset as resetCitation } from './sections/s8-citation.js';
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
    this.playTone(523, 0.2);
    setTimeout(() => this.playTone(659, 0.2), 100);
    setTimeout(() => this.playTone(784, 0.3), 200);
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

// Section Manager
class SectionManager {
  constructor() {
    this.sections = {
      1: { init: initRetrieval, reset: resetRetrieval },
      2: { init: initEmbeddings, reset: resetEmbeddings },
      3: { init: initDatabase, reset: resetDatabase },
      4: { init: initCosine, reset: resetCosine },
      5: { init: initChunking, reset: resetChunking },
      6: { init: initContext, reset: resetContext },
      7: { init: initGrounding, reset: resetGrounding },
      8: { init: initCitation, reset: resetCitation },
    };
  }

  init() {
    for (let i = 1; i <= 8; i++) {
      const containerName = [
        'retrieval', 'embeddings', 'database', 'cosine',
        'chunking', 'context', 'grounding', 'citation'
      ][i - 1];
      const container = document.getElementById(`${containerName}-container`);
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

// Global exports
window.soundManager = soundManager;
window.narrator = narrator;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
  const sectionManager = new SectionManager();
  sectionManager.init();
});
