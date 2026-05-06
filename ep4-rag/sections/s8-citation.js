let citationIdx = 0;
let allFlagsVisible = false;

const citations = [
  {
    question: 'How do I make authentic Margherita?',
    answer: 'Use San Marzano tomatoes 🚩, fresh basil 🚩, and white mozzarella 🚩. Cook at 450°F for exactly 4 minutes 🚩.',
    sources: [
      { flag: '🚩', text: 'Use San Marzano tomatoes', source: 'Margherita chapter, page 15' },
      { flag: '🚩', text: 'fresh basil', source: 'Margherita chapter, page 15' },
      { flag: '🚩', text: 'white mozzarella', source: 'Margherita chapter, page 15' },
      { flag: '🚩', text: 'Cook at 450°F for exactly 4 minutes', source: 'Margherita chapter, page 16' },
    ],
  },
  {
    question: 'What makes Diavolo authentic?',
    answer: 'Red pepper flakes from Calabria 🚩 are essential. Add fennel seed to cut bitterness 🚩. Layer spices like a symphony 🚩.',
    sources: [
      { flag: '🚩', text: 'Red pepper flakes from Calabria', source: 'Spice chapter, page 28' },
      { flag: '🚩', text: 'fennel seed to cut bitterness', source: 'Spice chapter, page 28' },
      { flag: '🚩', text: 'Layer spices like a symphony', source: 'Spice chapter, page 29' },
    ],
  },
  {
    question: 'How do I cook fresh seafood pizza?',
    answer: 'Use clams fresh from the sea the same day 🚩. Shrimp cook for only 90 seconds 🚩. Salt the shellfish liberally 🚩.',
    sources: [
      { flag: '🚩', text: 'clams fresh from the sea the same day', source: 'Seafood chapter, page 42' },
      { flag: '🚩', text: 'Shrimp cook for only 90 seconds', source: 'Seafood chapter, page 42' },
      { flag: '🚩', text: 'Salt the shellfish liberally', source: 'Seafood chapter, page 43' },
    ],
  },
];

export function init(containerEl) {
  const html = `
    <div class="citation-wrapper">
      <div class="citation-controls">
        <button class="button secondary" id="prevCitationBtn">← Previous</button>
        <span id="citationCounter">1 / ${citations.length}</span>
        <button class="button secondary" id="nextCitationBtn">Next →</button>
        <button class="button" id="verifyAllBtn">Verify All Sources 🏴</button>
      </div>
      <div class="citation-display grid-2">
        <div class="answer-section">
          <h3>Chef's Answer</h3>
          <div class="answer-text" id="answerText"></div>
          <p class="hint">Hover over or click 🚩 to see the source</p>
        </div>
        <div class="sources-section">
          <h3>Source Cards</h3>
          <div class="sources-list" id="sourcesList"></div>
        </div>
      </div>
      <div class="citation-explanation">
        <p><strong>🚩 Flag = Proof:</strong> Every claim points to a specific source. Click a flag to see which page it comes from.</p>
        <p>This is how you <em>trust</em> an AI answer. Not by blind faith, but by verification.</p>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const prevBtn = containerEl.querySelector('#prevCitationBtn');
  const nextBtn = containerEl.querySelector('#nextCitationBtn');
  const verifyAllBtn = containerEl.querySelector('#verifyAllBtn');
  const counter = containerEl.querySelector('#citationCounter');
  const answerText = containerEl.querySelector('#answerText');
  const sourcesList = containerEl.querySelector('#sourcesList');

  function showCitation(idx) {
    const citation = citations[idx % citations.length];

    answerText.innerHTML = '';
    sourcesList.innerHTML = '';
    allFlagsVisible = false;
    verifyAllBtn.textContent = 'Verify All Sources 🏴';

    // Build clickable answer
    let answerHTML = citation.answer;
    citation.sources.forEach((src, srcIdx) => {
      answerHTML = answerHTML.replace(
        src.flag,
        `<span class="citation-flag" data-source="${srcIdx}" title="Click for source">${src.flag}</span>`
      );
    });
    answerText.innerHTML = answerHTML;

    // Add click handlers
    answerText.querySelectorAll('.citation-flag').forEach((flag) => {
      flag.addEventListener('click', () => {
        const srcIdx = parseInt(flag.dataset.source);
        const src = citation.sources[srcIdx];
        showSourceCard(src, srcIdx);
        window.soundManager?.ping();
      });
      flag.addEventListener('mouseenter', () => {
        flag.style.fontSize = '1.5rem';
      });
      flag.addEventListener('mouseleave', () => {
        flag.style.fontSize = '1rem';
      });
    });

    // Build source cards
    citation.sources.forEach((src, srcIdx) => {
      const card = document.createElement('div');
      card.className = 'source-card';
      card.innerHTML = `
        <div class="source-number">${srcIdx + 1}</div>
        <div class="source-content">
          <p class="source-text">"${src.text}"</p>
          <p class="source-location">${src.source}</p>
        </div>
      `;
      card.style.cursor = 'pointer';
      card.style.animation = `slideLeft 0.3s ease ${srcIdx * 0.1}s forwards`;
      card.style.opacity = 0;
      card.addEventListener('click', () => {
        showSourceCard(src, srcIdx);
        window.soundManager?.ping();
      });
      sourcesList.appendChild(card);
    });

    counter.textContent = `${(idx % citations.length) + 1} / ${citations.length}`;
    window.soundManager?.plop();
  }

  function showSourceCard(src, srcIdx) {
    const cards = sourcesList.querySelectorAll('.source-card');
    cards[srcIdx].style.boxShadow = '0 0 20px rgba(230, 57, 70, 0.6)';
    setTimeout(() => {
      cards[srcIdx].style.boxShadow = '';
    }, 500);
  }

  function verifyAll() {
    if (!allFlagsVisible) {
      allFlagsVisible = true;
      verifyAllBtn.textContent = 'Hide All Sources 🏴';
      answerText.querySelectorAll('.citation-flag').forEach((flag, idx) => {
        flag.style.boxShadow = '0 0 15px rgba(230, 57, 70, 0.8)';
        flag.style.animation = `pulse 0.6s ease ${idx * 0.1}s`;
      });
      sourcesList.querySelectorAll('.source-card').forEach((card) => {
        card.style.borderLeft = '4px solid #E63946';
        card.style.backgroundColor = '#fff0f0';
      });
      window.soundManager?.success();
    } else {
      allFlagsVisible = false;
      verifyAllBtn.textContent = 'Verify All Sources 🏴';
      answerText.querySelectorAll('.citation-flag').forEach((flag) => {
        flag.style.boxShadow = '';
        flag.style.animation = '';
      });
      sourcesList.querySelectorAll('.source-card').forEach((card) => {
        card.style.borderLeft = '';
        card.style.backgroundColor = '';
      });
    }
  }

  prevBtn.addEventListener('click', () => {
    citationIdx = (citationIdx - 1 + citations.length) % citations.length;
    showCitation(citationIdx);
  });

  nextBtn.addEventListener('click', () => {
    citationIdx = (citationIdx + 1) % citations.length;
    showCitation(citationIdx);
  });

  verifyAllBtn.addEventListener('click', verifyAll);

  showCitation(citationIdx);
}

export function reset() {
  citationIdx = 0;
  allFlagsVisible = false;
}
