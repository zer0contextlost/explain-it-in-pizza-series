let chunkSize = 2;

const memoir = `
Nonna's Sicilian Pizza Bible — 200 pages of accumulated wisdom.

Chapter 1: Traditional Margherita
The foundation of all pizza is the dough. Knead with love, not haste. Let it rise under the Sicilian sun.
Use only San Marzano tomatoes, basil picked fresh at dawn, and mozzarella so white it glows.
The balance of simplicity is everything. Cook at exactly 450 degrees for exactly 4 minutes.

Chapter 2: The Art of Spice
Diavolo is not for the faint of heart. Use red pepper flakes from Calabria, never anywhere else.
The heat must build gradually, layering spices like a symphony building to crescendo.
Add a pinch of fennel seed to cut the bitterness of aged garlic. This is the secret my mother never told anyone.

Chapter 3: Seafood Traditions
Fresh clams from the Tyrrhenian Sea are essential. If you cannot get them fresh the same day, do not make this pizza.
Shrimp should be large, sweet, and cooked for no more than 90 seconds or they become rubber.
Salt the shellfish liberally. The sea flavor needs to sing.

Chapter 4: Vegetable Preparations
Every vegetable in Sicily has a season. Respect the season. Do not buy tomatoes in winter.
Arugula should be peppery and young, not bitter and old. Taste as you go.
Roast your peppers over charcoal for the true flavor. Gas is acceptable only in emergencies.

Chapter 5: Advanced Techniques
Cold fermentation for 72 hours develops the flavor profile no quick proof can match.
Your hands know the dough better than any timer. Feel the gluten structure. Trust your instincts.
The oven is alive. Every oven is different. Learn your oven like you would a temperamental relative.
`.trim();

const sentences = memoir.split(/[.!?]+/).filter((s) => s.trim());

export function init(containerEl) {
  const html = `
    <div class="chunking-wrapper">
      <div class="chunking-controls">
        <label>Chunk Size:</label>
        <input type="range" id="chunkSlider" min="1" max="4" value="2" step="1">
        <div class="chunk-labels">
          <span>1 Sentence</span>
          <span>1 Paragraph</span>
          <span>1 Page</span>
          <span>Whole Chapter</span>
        </div>
      </div>
      <div class="chunking-display">
        <div class="pages-section">
          <h4>Original Document (${sentences.length} sentences)</h4>
          <div class="pages-stack" id="pagesStack">
            <div class="page">📄</div>
            <div class="page">📄</div>
            <div class="page">📄</div>
          </div>
        </div>
        <div class="arrow">→</div>
        <div class="chunks-section">
          <h4>Chunks (<span id="chunkCount">0</span> cards)</h4>
          <div class="chunks-display" id="chunksDisplay"></div>
        </div>
      </div>
      <div class="chunk-analysis" id="chunkAnalysis"></div>
    </div>
  `;

  containerEl.innerHTML = html;

  const chunkSlider = containerEl.querySelector('#chunkSlider');
  const chunksDisplay = containerEl.querySelector('#chunksDisplay');
  const chunkCount = containerEl.querySelector('#chunkCount');
  const chunkAnalysis = containerEl.querySelector('#chunkAnalysis');

  function renderChunks() {
    const size = parseInt(chunkSlider.value);
    let chunks = [];

    if (size === 1) {
      chunks = sentences.slice(0, 5).map((s) => ({ text: s.trim() + '.', warning: s.length < 20 }));
    } else if (size === 2) {
      for (let i = 0; i < sentences.length; i += 3) {
        chunks.push({
          text: sentences.slice(i, i + 3).join('. ') + '.',
          warning: false,
        });
      }
    } else if (size === 3) {
      for (let i = 0; i < sentences.length; i += 6) {
        chunks.push({
          text: sentences.slice(i, i + 6).join('. ') + '.',
          warning: false,
        });
      }
    } else if (size === 4) {
      chunks = [{ text: sentences.join('. ') + '.', warning: true }];
    }

    chunksDisplay.innerHTML = '';
    chunkCount.textContent = chunks.length;

    chunks.forEach((chunk, idx) => {
      const card = document.createElement('div');
      card.className = 'chunk-card';
      if (chunk.warning) {
        card.style.borderColor = '#E63946';
        card.style.background = '#fff0f0';
      }
      card.innerHTML = `
        <div class="chunk-index">Card ${idx + 1}</div>
        <p>${chunk.text}</p>
        ${chunk.warning ? '<div style="color: #E63946; font-weight: bold;">⚠️ TOO BIG FOR POCKET!</div>' : ''}
      `;
      card.style.animation = `slideLeft 0.3s ease ${idx * 0.1}s forwards`;
      card.style.opacity = 0;
      chunksDisplay.appendChild(card);
    });

    // Analysis
    let analysis = '';
    if (size === 1) {
      analysis = '❌ Too small: Cards are incomplete. "Cook at exactly..." - where? Incomplete thoughts.';
    } else if (size === 2) {
      analysis = '✅ PERFECT: Each card fits in the chef\'s apron pocket. Complete thoughts. He can grab one and have everything he needs.';
    } else if (size === 3) {
      analysis = '⚠️ Getting big: Still fits but is getting unwieldy. The chef has to focus on multiple ideas per card.';
    } else if (size === 4) {
      analysis = '❌ Way too big: The entire 200-page memoir on one card. It droops out of the pocket. Too much. Too overwhelming.';
    }
    chunkAnalysis.innerHTML = `<p style="padding: 1rem; background: rgba(244, 162, 97, 0.2); border-radius: 8px;">${analysis}</p>`;

    window.soundManager?.plop();
  }

  chunkSlider.addEventListener('input', renderChunks);
  renderChunks();
}

export function reset() {
  chunkSize = 2;
}
