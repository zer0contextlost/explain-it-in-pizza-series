let useRAG = true;

const ragCards = {
  'How do I make authentic Margherita?': [
    'Use San Marzano tomatoes, fresh basil, and white mozzarella.',
    'Cook at 450°F for exactly 4 minutes.',
    'Balance simplicity with love.',
  ],
  'What makes Diavolo spicy?': [
    'Red pepper flakes from Calabria are essential.',
    'Add fennel seed to cut bitterness.',
    'Layer spices like a symphony building to crescendo.',
  ],
  'How do I cook fresh seafood pizza?': [
    'Use clams fresh from the sea the same day.',
    'Shrimp cook for only 90 seconds.',
    'Salt the shellfish liberally.',
  ],
};

const recipeDetails = {
  'How do I make authentic Margherita?': {
    title: 'Margherita 🍅',
    origin: 'Naples, Italy — est. tradition since 1889',
    ingredients: ['San Marzano tomatoes', 'Fresh buffalo mozzarella', 'Basil picked at dawn', 'Extra-virgin olive oil'],
    method: 'Cook at exactly 450°F for 4 minutes. Let dough rise under Sicilian sun for 24 hours.',
    emoji: '🍅',
  },
  'What makes Diavolo spicy?': {
    title: 'Diavolo 🔥',
    origin: 'Calabria, Italy — the devil\'s pizza',
    ingredients: ['Calabrian red pepper flakes', 'Aged garlic', 'Fennel seed', 'San Marzano tomatoes'],
    method: 'Layer spices like a symphony. Heat must build gradually. Not for the faint of heart.',
    emoji: '🔥',
  },
  'How do I cook fresh seafood pizza?': {
    title: 'Seafood Marinara 🦐',
    origin: 'Tyrrhenian Coast — fishermen\'s tradition',
    ingredients: ['Fresh Tyrrhenian clams (same-day only)', 'Large sweet shrimp', 'Sea salt', 'Olive oil'],
    method: 'Shrimp cook for no more than 90 seconds. Salt the shellfish liberally. The sea flavor must sing.',
    emoji: '🦐',
  },
};

export function init(containerEl) {
  const html = `
    <div class="context-wrapper">
      <div class="context-controls">
        <label>Mode:</label>
        <button class="button secondary" id="withoutRAGBtn">Without RAG (Hallucinating)</button>
        <button class="button" id="withRAGBtn">With RAG (Grounded)</button>
      </div>
      <div class="context-display grid-2">
        <div class="chef-side">
          <h3>Chef's Mind</h3>
          <textarea id="questionInput" placeholder="Ask the chef something... (e.g., 'How do I make authentic Margherita?')"></textarea>
          <button class="button" id="askBtn">Ask Chef →</button>
          <div class="context-window" id="contextWindow">
            <div class="window-label">Context Window</div>
            <div class="window-content" id="windowContent"></div>
            <div class="usage-bar">
              <div class="usage-fill" id="usageFill"></div>
            </div>
            <div class="usage-text" id="usageText">Empty</div>
          </div>
        </div>
        <div class="result-side">
          <h3>Pizza Result</h3>
          <div class="pizza-result-large" id="pizzaResult">
            <div class="pizza-emoji">🍕</div>
          </div>
          <div class="chef-answer" id="chefAnswer"></div>
        </div>
      </div>

      <div class="internal-view-toggle-row">
        <button class="button secondary" id="toggleInternalViewBtn">Show Chef's Internal View 👁️</button>
      </div>

      <div class="chef-internal-view" id="chefInternalView" style="display:none;">
        <h3>Chef's Internal View</h3>
        <div class="internal-view-layout">
          <div class="internal-recipe-card" id="internalRecipeCard">
            <div class="recipe-card-placeholder">Ask the chef a question first…</div>
          </div>
          <div class="internal-inject-arrow" id="internalInjectArrow">
            <div class="inject-arrow-line"></div>
            <div class="inject-arrow-label">taped to the cutting board</div>
            <div class="inject-arrow-tip">▶</div>
          </div>
          <div class="internal-question-box" id="internalQuestionBox">
            <div class="question-box-label">Question</div>
            <div class="question-box-text" id="internalQuestionText">—</div>
          </div>
        </div>
        <p class="internal-view-explain">The retrieved recipe card is injected directly into the chef's working space alongside the question — this is context injection.</p>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const questionInput = containerEl.querySelector('#questionInput');
  const askBtn = containerEl.querySelector('#askBtn');
  const windowContent = containerEl.querySelector('#windowContent');
  const usageFill = containerEl.querySelector('#usageFill');
  const usageText = containerEl.querySelector('#usageText');
  const pizzaResult = containerEl.querySelector('#pizzaResult');
  const chefAnswer = containerEl.querySelector('#chefAnswer');
  const withoutRAGBtn = containerEl.querySelector('#withoutRAGBtn');
  const withRAGBtn = containerEl.querySelector('#withRAGBtn');
  const toggleInternalViewBtn = containerEl.querySelector('#toggleInternalViewBtn');
  const chefInternalView = containerEl.querySelector('#chefInternalView');
  const internalRecipeCard = containerEl.querySelector('#internalRecipeCard');
  const internalQuestionText = containerEl.querySelector('#internalQuestionText');
  const internalInjectArrow = containerEl.querySelector('#internalInjectArrow');

  let internalViewVisible = false;
  let lastQuestion = null;

  toggleInternalViewBtn.addEventListener('click', () => {
    internalViewVisible = !internalViewVisible;
    chefInternalView.style.display = internalViewVisible ? 'block' : 'none';
    toggleInternalViewBtn.textContent = internalViewVisible
      ? 'Hide Chef\'s Internal View'
      : 'Show Chef\'s Internal View 👁️';
    if (internalViewVisible && lastQuestion) {
      populateInternalView(lastQuestion);
    }
    window.soundManager?.ping();
  });

  function populateInternalView(question) {
    internalQuestionText.textContent = question;
    const detail = recipeDetails[question];

    if (!useRAG || !detail) {
      internalRecipeCard.innerHTML = `
        <div class="recipe-card-empty">
          <div class="recipe-card-icon">📭</div>
          <p>No recipe retrieved — chef is working from memory only.</p>
        </div>
      `;
      internalInjectArrow.style.opacity = '0.3';
      return;
    }

    internalInjectArrow.style.opacity = '1';
    internalRecipeCard.innerHTML = `
      <div class="recipe-card-retrieved">
        <div class="recipe-card-header">
          <span class="recipe-card-emoji">${detail.emoji}</span>
          <span class="recipe-card-title">${detail.title}</span>
        </div>
        <div class="recipe-card-origin">${detail.origin}</div>
        <div class="recipe-card-section">
          <strong>Ingredients:</strong>
          <ul>${detail.ingredients.map((i) => `<li>${i}</li>`).join('')}</ul>
        </div>
        <div class="recipe-card-section">
          <strong>Method:</strong>
          <p>${detail.method}</p>
        </div>
        <div class="recipe-card-tape">📌 taped to cutting board</div>
      </div>
    `;

    // Animate the arrow briefly
    internalInjectArrow.classList.remove('inject-animate');
    void internalInjectArrow.offsetWidth; // force reflow
    internalInjectArrow.classList.add('inject-animate');
  }

  function updateContextWindow(cards) {
    windowContent.innerHTML = '';

    if (cards.length === 0) {
      windowContent.innerHTML = '<p style="color: #999; font-style: italic;">Empty. Chef has no recipe.</p>';
      usageFill.style.width = '0%';
      usageText.textContent = 'Empty (0%)';
      return;
    }

    cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'context-card';
      cardEl.innerHTML = `<span class="card-num">${idx + 1}</span> ${card}`;
      cardEl.style.animation = `slideLeft 0.3s ease ${idx * 0.1}s forwards`;
      cardEl.style.opacity = 0;
      windowContent.appendChild(cardEl);
    });

    const usage = (cards.length * 20);
    usageFill.style.width = Math.min(usage, 100) + '%';
    usageText.textContent = `Context used: ${Math.min(usage, 100)}% / 100%`;
  }

  askBtn.addEventListener('click', () => {
    const question = questionInput.value.trim();
    if (!question) {
      alert('Ask the chef something!');
      return;
    }

    lastQuestion = question;

    let answer = '';
    let cards = [];

    if (useRAG) {
      // With RAG: retrieve relevant cards
      cards = ragCards[question] || [
        'I found something related to your question.',
        'Here is relevant information from the recipes.',
        'This should help you get accurate results.',
      ];

      updateContextWindow(cards);

      answer = `<strong>✅ Grounded Answer (from your cookbook):</strong><br>
        Based on the cards taped to my board, the answer is clear and verified.
        ${cards.join(' ')} This is exactly what your Nonna taught me.`;

      pizzaResult.innerHTML = '<div class="pizza-emoji">✨🍕✨</div>';
      window.soundManager?.success();
    } else {
      // Without RAG: hallucinate
      updateContextWindow([]);

      const hallucinations = [
        'I think the secret is probably adding pineapple and ketchup to everything.',
        'Most pizzas are made with artificial cheese powder, I believe.',
        'The best way is definitely to microwave it for 30 minutes.',
        'I am quite confident that Nonna used frozen ingredients from 1950.',
        'The key is definitely adding sugar and marshmallows.',
      ];

      answer = `<strong>❌ Ungrounded Answer (pure invention):</strong><br>
        ${hallucinations[Math.floor(Math.random() * hallucinations.length)]}<br>
        I am very confident about this, even though I have no evidence.`;

      pizzaResult.innerHTML = '<div class="pizza-emoji">😵🍕❓</div>';
      window.soundManager?.error();
    }

    chefAnswer.innerHTML = answer;

    // Update internal view if it's visible
    if (internalViewVisible) {
      populateInternalView(question);
    }
  });

  withRAGBtn.addEventListener('click', () => {
    useRAG = true;
    withRAGBtn.style.opacity = '1';
    withoutRAGBtn.style.opacity = '0.5';
    window.soundManager?.ping();
  });

  withoutRAGBtn.addEventListener('click', () => {
    useRAG = false;
    withoutRAGBtn.style.opacity = '1';
    withRAGBtn.style.opacity = '0.5';
    window.soundManager?.ping();
  });

  withRAGBtn.style.opacity = '1';
  withoutRAGBtn.style.opacity = '0.5';

  // Pre-fill example question
  questionInput.value = 'How do I make authentic Margherita?';
}

export function reset() {
  useRAG = true;
}
