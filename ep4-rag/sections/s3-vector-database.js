let isAlphabetical = false;

const recipes = [
  { name: 'Margherita', section: 'Cheesy', emoji: '🍅' },
  { name: 'Marinara', section: 'Cheesy', emoji: '🍝' },
  { name: 'White Pizza', section: 'Cheesy', emoji: '⚪' },
  { name: 'Four Cheese', section: 'Cheesy', emoji: '🧀' },
  { name: 'Diavolo', section: 'Spicy', emoji: '🔥' },
  { name: 'Spicy Shrimp', section: 'Spicy', emoji: '🌶️🦐' },
  { name: 'Jalapeño Popper', section: 'Spicy', emoji: '🌶️' },
  { name: 'Vegetarian', section: 'Veggie', emoji: '🥬' },
  { name: 'Caesar Salad', section: 'Veggie', emoji: '🥗' },
  { name: 'Arugula Salad', section: 'Veggie', emoji: '🥬' },
  { name: 'Spinach Special', section: 'Veggie', emoji: '🍃' },
  { name: 'Pepperoni', section: 'Meaty', emoji: '🍗' },
  { name: 'BBQ Chicken', section: 'Meaty', emoji: '🍖' },
  { name: 'Prosciutto', section: 'Meaty', emoji: '🥓' },
  { name: 'Seafood', section: 'Meaty', emoji: '🦐' },
];

export function init(containerEl) {
  const html = `
    <div class="database-wrapper">
      <div class="controls">
        <label>View Mode:</label>
        <button class="button" id="alphabeticalBtn">Alphabetical (Broken)</button>
        <button class="button secondary" id="semanticBtn">Semantic (Smart)</button>
      </div>
      <div class="shelf-view" id="shelfView"></div>
      <div class="matches-display" id="matchesDisplay" style="display: none;">
        <h3>Top 3 Matches for Your Query:</h3>
        <div class="matches-cards" id="matchesCards"></div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const shelfView = containerEl.querySelector('#shelfView');
  const matchesDisplay = containerEl.querySelector('#matchesDisplay');
  const matchesCards = containerEl.querySelector('#matchesCards');
  const alphabeticalBtn = containerEl.querySelector('#alphabeticalBtn');
  const semanticBtn = containerEl.querySelector('#semanticBtn');

  function renderShelf() {
    shelfView.innerHTML = '';

    let toDisplay = [...recipes];
    if (isAlphabetical) {
      toDisplay.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Group by semantic section
      const grouped = {};
      recipes.forEach((r) => {
        if (!grouped[r.section]) grouped[r.section] = [];
        grouped[r.section].push(r);
      });
      toDisplay = Object.entries(grouped).flatMap(([section, items]) => items);
    }

    toDisplay.forEach((recipe, idx) => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <div class="card-emoji">${recipe.emoji}</div>
        <div class="card-name">${recipe.name}</div>
        <div class="card-section">${isAlphabetical ? '' : recipe.section}</div>
      `;
      card.style.animation = `slideLeft 0.3s ease ${idx * 0.05}s forwards`;
      card.style.opacity = 0;
      shelfView.appendChild(card);
    });
  }

  alphabeticalBtn.addEventListener('click', () => {
    isAlphabetical = true;
    alphabeticalBtn.style.opacity = '1';
    semanticBtn.style.opacity = '0.5';
    renderShelf();
    window.soundManager?.plop();
  });

  semanticBtn.addEventListener('click', () => {
    isAlphabetical = false;
    alphabeticalBtn.style.opacity = '0.5';
    semanticBtn.style.opacity = '1';
    renderShelf();
    window.soundManager?.success();
  });

  // Add a query interaction
  const queryBtn = document.createElement('button');
  queryBtn.className = 'button';
  queryBtn.textContent = 'Query: Find Spicy Pizzas →';
  queryBtn.style.marginTop = '2rem';
  containerEl.querySelector('.controls').appendChild(queryBtn);

  queryBtn.addEventListener('click', () => {
    if (isAlphabetical) {
      alert('Alphabetical order is useless for finding spicy pizzas! Switch to Semantic view.');
      return;
    }

    // Show the spicy section glowing
    containerEl.querySelectorAll('.recipe-card').forEach((card) => {
      if (card.textContent.includes('Spicy')) {
        card.style.boxShadow = '0 0 20px rgba(230, 57, 70, 0.8)';
      }
    });

    matchesDisplay.style.display = 'block';
    matchesCards.innerHTML = `
      <div class="card" style="animation: slideLeft 0.3s ease;">
        <strong>🔥 Diavolo</strong> - Perfect match for spicy
      </div>
      <div class="card" style="animation: slideLeft 0.3s ease 0.1s forwards; opacity: 0;">
        <strong>🌶️🦐 Spicy Shrimp</strong> - Also fiery
      </div>
      <div class="card" style="animation: slideLeft 0.3s ease 0.2s forwards; opacity: 0;">
        <strong>🌶️ Jalapeño Popper</strong> - Heat for days
      </div>
    `;
    window.soundManager?.success();
  });

  semanticBtn.style.opacity = '1';
  alphabeticalBtn.style.opacity = '0.5';
  renderShelf();
}

export function reset() {
  isAlphabetical = false;
}
