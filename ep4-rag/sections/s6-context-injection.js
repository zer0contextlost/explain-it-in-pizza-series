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
