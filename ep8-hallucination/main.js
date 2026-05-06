// Main controller for Episode 8
const EPISODE_CODES = {
  1: 8765,
  2: 8766,
  3: 8767,
  4: 8768,
  5: 8769,
  6: 8770,
  7: 8771,
  8: 8765  // Episode 8 is current, codes wrap
};

const EPISODE_LINKS = {
  1: 'https://example.com/ep1',
  2: 'https://example.com/ep2',
  3: 'https://example.com/ep3',
  4: 'https://example.com/ep4',
  5: 'https://example.com/ep5',
  6: 'https://example.com/ep6',
  7: 'https://example.com/ep7'
};

// App state
const appState = {
  currentSection: 0,
  sections: []
};

// Initialize app
function initApp() {
  // Set up episode navigation
  setupEpisodeNav();

  // Initialize sections
  initializeSections();

  // Set up hero animation
  setupHeroAnimation();

  // Set up narrator
  setupNarrator();
}

function setupEpisodeNav() {
  const epNumElements = document.querySelectorAll('.ep-num');
  epNumElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const ep = el.dataset.ep;
      if (ep !== '8' && EPISODE_LINKS[ep]) {
        window.location.href = EPISODE_LINKS[ep];
      }
    });
  });

  const backBtn = document.querySelector('.nav-back');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (EPISODE_LINKS[7]) {
        window.location.href = EPISODE_LINKS[7];
      }
    });
  }
}

function setupHeroAnimation() {
  // Hero SVG animations are handled in CSS
  // This ensures they're smooth and performant
}

function setupNarrator() {
  updateNarrator(1);
}

function updateNarrator(sectionNum) {
  const narratorText = document.getElementById('narratorText');
  if (narratorText && NARRATIONS[sectionNum]) {
    narratorText.textContent = NARRATIONS[sectionNum];
  }
}

function initializeSections() {
  const container = document.getElementById('sectionsContainer');

  // S1: Why LLMs Hallucinate
  appState.sections.push({
    id: 's1',
    title: 'Why LLMs Hallucinate',
    emoji: '🎲',
    init: initSection1
  });

  // S2: Confabulation
  appState.sections.push({
    id: 's2',
    title: 'Confabulation',
    emoji: '👻',
    init: initSection2
  });

  // S3: Calibration & Uncertainty
  appState.sections.push({
    id: 's3',
    title: 'Calibration & Uncertainty',
    emoji: '📊',
    init: initSection3
  });

  // S4: RLHF as Alignment
  appState.sections.push({
    id: 's4',
    title: 'RLHF as Alignment',
    emoji: '🔗',
    init: initSection4
  });

  // S5: Red-Teaming
  appState.sections.push({
    id: 's5',
    title: 'Red-Teaming',
    emoji: '🎯',
    init: initSection5
  });

  // S6: Constitutional AI
  appState.sections.push({
    id: 's6',
    title: 'Constitutional AI',
    emoji: '📜',
    init: initSection6
  });

  // S7: Jailbreaking
  appState.sections.push({
    id: 's7',
    title: 'Jailbreaking',
    emoji: '🔓',
    init: initSection7
  });

  // S8: Emergent Capabilities
  appState.sections.push({
    id: 's8',
    title: 'Emergent Capabilities',
    emoji: '✨',
    init: initSection8
  });

  // Create section elements
  appState.sections.forEach((section, index) => {
    const sectionEl = document.createElement('section');
    sectionEl.id = section.id;
    sectionEl.className = 'episode-section' + (section.id === 's6' || section.id === 's7' ? ' danger' : '');
    sectionEl.innerHTML = `
      <h2 class="section-title">
        <span>${section.emoji}</span> ${section.title}
      </h2>
      <div class="section-content" id="${section.id}-content"></div>
    `;
    container.appendChild(sectionEl);

    // Initialize section when it becomes visible
    const contentEl = sectionEl.querySelector('.section-content');
    section.init(contentEl, index + 1);
  });
}

// Placeholder functions - these will be implemented by individual section files
function initSection1(container, sectionNum) {
  if (typeof window.initSection1Internal === 'function') {
    window.initSection1Internal(container, sectionNum);
  }
}

function initSection2(container, sectionNum) {
  if (typeof window.initSection2Internal === 'function') {
    window.initSection2Internal(container, sectionNum);
  }
}

function initSection3(container, sectionNum) {
  if (typeof window.initSection3Internal === 'function') {
    window.initSection3Internal(container, sectionNum);
  }
}

function initSection4(container, sectionNum) {
  if (typeof window.initSection4Internal === 'function') {
    window.initSection4Internal(container, sectionNum);
  }
}

function initSection5(container, sectionNum) {
  if (typeof window.initSection5Internal === 'function') {
    window.initSection5Internal(container, sectionNum);
  }
}

function initSection6(container, sectionNum) {
  if (typeof window.initSection6Internal === 'function') {
    window.initSection6Internal(container, sectionNum);
  }
}

function initSection7(container, sectionNum) {
  if (typeof window.initSection7Internal === 'function') {
    window.initSection7Internal(container, sectionNum);
  }
}

function initSection8(container, sectionNum) {
  if (typeof window.initSection8Internal === 'function') {
    window.initSection8Internal(container, sectionNum);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
