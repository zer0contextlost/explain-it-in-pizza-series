let orderIndex = 0;
let _showOrder = null;

const pizzaOrders = [
  { name: "Nonna's Sicilian 1987 Special", description: "A 36-year-old family recipe from Sicily" },
  { name: "Tokyo Fusion Okonomiyaki-Pesto", description: "Modern Japanese-Italian crossover from 2024" },
  { name: "Peru's Lost Ceviche Pie", description: "Experimental dish combining ceviche and pizza, 2025" },
  { name: "The 2025 Trend Special", description: "Whatever's fashionable right now — no recipe exists yet." },
];

export function init(containerEl) {
  const html = `
    <div class="retrieval-wrapper">
      <div class="orders-section">
        <h3>Customer Orders Something Obscure</h3>
        <div class="order-display">
          <div class="order-card">
            <p class="order-name" id="orderName"></p>
            <p class="order-desc" id="orderDesc"></p>
          </div>
        </div>
        <div class="chef-reaction">
          <div class="chef-emoji" id="chefEmoji">🤔</div>
          <div class="chef-thought" id="chefThought">Hmm... I'll just make something!</div>
        </div>
      </div>
      <div class="pizza-delivery">
        <div class="pizza-result" id="pizzaResult">
          <div class="pizza-item" style="font-size: 3rem; cursor: pointer;" id="pizzaVisualize">🍕</div>
          <div class="pizza-label" id="pizzaLabel">Click to reveal</div>
        </div>
      </div>
      <div class="explanation">
        <p id="explanation" class="explanation-text"></p>
      </div>
      <div class="controls">
        <button class="button" id="nextOrderBtn">Next Customer Order →</button>
        <button class="button secondary" id="resetBtn">Reset</button>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const orderNameEl = containerEl.querySelector('#orderName');
  const orderDescEl = containerEl.querySelector('#orderDesc');
  const chefEmojiEl = containerEl.querySelector('#chefEmoji');
  const chefThoughtEl = containerEl.querySelector('#chefThought');
  const pizzaVisualEl = containerEl.querySelector('#pizzaVisualize');
  const pizzaLabelEl = containerEl.querySelector('#pizzaLabel');
  const explanationEl = containerEl.querySelector('#explanation');
  const nextOrderBtn = containerEl.querySelector('#nextOrderBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');

  const wrongPizzas = [
    { emoji: '🍍🌶️', name: 'Pineapple Jalapeño', reason: 'I have no memory of 1987 recipes. I guessed. Confidently.' },
    { emoji: '🥒🍔', name: 'Pickle & Burger Fusion', reason: 'Post-2024? I have no data past my training cutoff. This is a hallucination.' },
    { emoji: '🦑🍝', name: 'Squid Ink Pasta Surprise', reason: 'Ceviche-Pie fusion? I invented something that sounds vaguely related.' },
    { emoji: '🚀🌭', name: 'Rocket Hot Dog Pizza', reason: 'Post-2024 trend? I literally cannot know. I made this up.' },
  ];

  function showOrder(index) {
    const order = pizzaOrders[index % pizzaOrders.length];
    const wrongPizza = wrongPizzas[index % wrongPizzas.length];

    orderNameEl.textContent = order.name;
    orderDescEl.textContent = order.description;
    chefEmojiEl.textContent = '😓';
    chefThoughtEl.textContent = 'Thinking... confidently...';

    pizzaLabelEl.textContent = 'Click the pizza to see what he made →';
    pizzaVisualEl.textContent = '🍕';
    explanationEl.innerHTML = '';

    let revealed = false;
    pizzaVisualEl.addEventListener('click', function revealWrong() {
      if (revealed) return;
      revealed = true;

      pizzaVisualEl.textContent = wrongPizza.emoji;
      pizzaLabelEl.innerHTML = `<strong>${wrongPizza.name}</strong>`;
      chefEmojiEl.textContent = '😌';
      chefThoughtEl.textContent = 'I feel confident about this one!';

      explanationEl.innerHTML = `
        <strong>What went wrong:</strong> ${wrongPizza.reason}
        <br><br>
        <em>The chef has no access to the recipe.</em>
      `;

      pizzaVisualEl.removeEventListener('click', revealWrong);
    }, { once: true });
  }

  function nextOrder() {
    orderIndex++;
    showOrder(orderIndex);
    window.soundManager?.plop();
  }

  nextOrderBtn.addEventListener('click', nextOrder);
  resetBtn.addEventListener('click', () => {
    orderIndex = 0;
    showOrder(orderIndex);
    window.soundManager?.plop();
  });

  _showOrder = showOrder;
  showOrder(orderIndex);
}

export function reset() {
  orderIndex = 0;
  if (_showOrder) _showOrder(orderIndex);
}
