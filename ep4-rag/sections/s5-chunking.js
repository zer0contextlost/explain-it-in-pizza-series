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
        <div class="chunk-extreme-btns">
          <button class="button secondary chunk-extreme-btn" id="btnWholeBook">📜 No Chunking (Whole Book)</button>
          <button class="button secondary chunk-extreme-btn" id="btnSingleWords">✂️ Over-Chunked (Single Words)</button>
          <button class="button chunk-sweet-btn" id="btnSweetSpot">✅ Sweet Spot</button>
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

  let sweetSpotActive = false;

  function renderChunks() {
    const size = parseInt(chunkSlider.value);
    let chunks = [];

    if (size === 1) {
      // Over-chunked: show all individual words as tiny chips
      const allWords = sentences.join(' ').split(/\s+/).filter(Boolean);
      chunksDisplay.innerHTML = '';
      chunkCount.textContent = allWords.length;
      allWords.forEach((word) => {
        const chip = document.createElement('span');
        chip.className = 'word-chip';
        chip.textContent = word;
        chunksDisplay.appendChild(chip);
      });
      const banner = document.createElement('div');
      banner.className = 'chunk-extreme-banner chunk-extreme-small';
      banner.textContent = 'Too small — no context, meaningless alone';
      chunksDisplay.prepend(banner);
      chunkAnalysis.innerHTML = `<p style="padding: 1rem; background: rgba(230,57,70,0.12); border-radius: 8px; color: #E63946;">❌ Too small: Individual words have no context. "Cook" — cook what? "Mozzarella" — in what recipe?</p>`;
      sweetSpotActive = false;
      updateSweetSpotHighlight();
      window.soundManager?.plop();
      return;
    }

    if (size === 4) {
      // No chunking: one giant block
      chunksDisplay.innerHTML = '';
      chunkCount.textContent = 1;
      const card = document.createElement('div');
      card.className = 'chunk-card chunk-whole-book';
      card.innerHTML = `
        <div class="chunk-index">Card 1</div>
        <p>${sentences.join('. ')}.</p>
        <div style="color: #E63946; font-weight: bold; margin-top: 0.5rem;">⚠️ Too big for the apron pocket — chef can't carry this</div>
      `;
      chunksDisplay.appendChild(card);
      chunkAnalysis.innerHTML = `<p style="padding: 1rem; background: rgba(230,57,70,0.12); border-radius: 8px; color: #E63946;">❌ Way too big: The entire 200-page memoir on one card. It droops out of the pocket. Too much. Too overwhelming.</p>`;
      sweetSpotActive = false;
      updateSweetSpotHighlight();
      window.soundManager?.plop();
      return;
    }

    if (size === 2) {
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
    }

    chunksDisplay.innerHTML = '';
    chunkCount.textContent = chunks.length;

    chunks.forEach((chunk, idx) => {
      const card = document.createElement('div');
      card.className = 'chunk-card';
      if (sweetSpotActive && size === 2) {
        card.style.borderColor = '#2ECC71';
        card.style.background = 'rgba(46,204,113,0.08)';
      }
      card.innerHTML = `
        <div class="chunk-index">Card ${idx + 1}</div>
        <p>${chunk.text}</p>
      `;
      card.style.animation = `slideLeft 0.3s ease ${idx * 0.1}s forwards`;
      card.style.opacity = 0;
      chunksDisplay.appendChild(card);
    });

    // Analysis
    let analysis = '';
    if (size === 2) {
      const prefix = sweetSpotActive ? '🌟 SWEET SPOT! ' : '';
      analysis = `${prefix}✅ PERFECT: Each card fits in the chef's apron pocket. Complete thoughts. He can grab one and have everything he needs.`;
    } else if (size === 3) {
      analysis = '⚠️ Getting big: Still fits but is getting unwieldy. The chef has to focus on multiple ideas per card.';
    }
    const bgColor = (sweetSpotActive && size === 2)
      ? 'rgba(46, 204, 113, 0.2)'
      : 'rgba(244, 162, 97, 0.2)';
    chunkAnalysis.innerHTML = `<p style="padding: 1rem; background: ${bgColor}; border-radius: 8px; transition: background 0.4s;">${analysis}</p>`;

    window.soundManager?.plop();
  }

  function updateSweetSpotHighlight() {
    const btn = containerEl.querySelector('#btnSweetSpot');
    if (sweetSpotActive) {
      btn.style.background = '#2ECC71';
      btn.style.color = '#fff';
      btn.style.boxShadow = '0 0 10px rgba(46,204,113,0.6)';
    } else {
      btn.style.background = '';
      btn.style.color = '';
      btn.style.boxShadow = '';
    }
  }

  chunkSlider.addEventListener('input', () => {
    sweetSpotActive = false;
    updateSweetSpotHighlight();
    renderChunks();
  });

  containerEl.querySelector('#btnWholeBook').addEventListener('click', () => {
    sweetSpotActive = false;
    chunkSlider.value = 4;
    updateSweetSpotHighlight();
    renderChunks();
  });

  containerEl.querySelector('#btnSingleWords').addEventListener('click', () => {
    sweetSpotActive = false;
    chunkSlider.value = 1;
    updateSweetSpotHighlight();
    renderChunks();
  });

  containerEl.querySelector('#btnSweetSpot').addEventListener('click', () => {
    sweetSpotActive = true;
    chunkSlider.value = 2;
    updateSweetSpotHighlight();
    renderChunks();
    window.soundManager?.success();
  });

  renderChunks();
}

export function reset() {
  chunkSize = 2;
}
