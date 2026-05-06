let count = 0;
const achievedMilestones = new Set();

export function init(containerEl) {
  const html = `
    <div class="ingredients-wrapper">
      <div class="ingredients-grid" id="ingredientsGrid"></div>
      <div class="bowl-section">
        <div class="bowl-container">
          <svg class="bowl-svg" viewBox="0 0 150 100" width="200" height="140">
            <ellipse cx="75" cy="20" rx="70" ry="15" fill="#F4A261" stroke="#6B3A2A" stroke-width="2"/>
            <path d="M 10 20 Q 5 50 15 75 Q 25 90 75 95 Q 125 90 135 75 Q 145 50 140 20"
                  fill="none" stroke="#6B3A2A" stroke-width="2"/>
            <g id="bowlContents"></g>
          </svg>
          <div class="bowl-fill" id="bowlFill"></div>
        </div>
        <div class="counter" id="counter">Training Examples: 0 / 500</div>
        <div class="milestones" id="milestones"></div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const ingredients = [
    { name: 'Tomato', emoji: '🍅', type: 'good', color: '#E63946' },
    { name: 'Basil', emoji: '🌿', type: 'good', color: '#2A9D8F' },
    { name: 'Cheese', emoji: '🧀', type: 'good', color: '#E9C46A' },
    { name: 'Garlic', emoji: '🧄', type: 'good', color: '#F4A261' },
    { name: 'Olive Oil', emoji: '🫒', type: 'good', color: '#6B3A2A' },
    { name: 'Oregano', emoji: '🌱', type: 'good', color: '#2A9D8F' },
    { name: 'Mozzarella', emoji: '⚪', type: 'good', color: '#FFF8F0' },
    { name: 'Pepperoni', emoji: '🍗', type: 'good', color: '#E63946' },
    { name: 'Onion', emoji: '🧅', type: 'good', color: '#F4A261' },
    { name: 'Bell Pepper', emoji: '🫑', type: 'good', color: '#E63946' },
    { name: 'Mushroom', emoji: '🍄', type: 'good', color: '#8B7355' },
    { name: 'Pineapple', emoji: '🍍', type: 'good', color: '#FFD700' },
    { name: 'Spinach', emoji: '🥬', type: 'good', color: '#2A9D8F' },
    { name: 'Arugula', emoji: '🥗', type: 'good', color: '#2A9D8F' },
    { name: 'Prosciutto', emoji: '🥓', type: 'good', color: '#C85A54' },
    { name: 'Anchovy', emoji: '🐟', type: 'good', color: '#264653' },
    { name: 'Calamari', emoji: '🦑', type: 'good', color: '#999999' },
    { name: 'Artichoke', emoji: '🥦', type: 'good', color: '#2A9D8F' },
    { name: 'Zucchini', emoji: '🥒', type: 'good', color: '#7CB342' },
    { name: 'Eggplant', emoji: '🍆', type: 'good', color: '#663399' },
    { name: 'Rubber Duck', emoji: '🦆', type: 'bad', color: '#FFD700' },
  ];

  const milestones = [100, 300, 500];

  const gridEl = document.getElementById('ingredientsGrid');
  const counterEl = document.getElementById('counter');
  const milestonesEl = document.getElementById('milestones');
  const bowlFill = document.getElementById('bowlFill');

  function dropIngredient(ing) {
    if (ing.type === 'bad') {
      count = Math.max(0, count - 50);
      bowl.classList.add('animate-shake');
      setTimeout(() => bowl.classList.remove('animate-shake'), 400);
      window.soundManager?.error();
    } else {
      count = Math.min(500, count + 20);
      window.soundManager?.plop();
    }

    updateCounter();
    updateBowl();
    checkMilestones();
  }

  // Create ingredient tiles
  ingredients.forEach((ing, idx) => {
    const tile = document.createElement('div');
    tile.className = 'ingredient-tile';
    tile.draggable = true;
    tile.dataset.type = ing.type;
    tile.dataset.index = idx;
    tile.innerHTML = `
      <div class="ingredient-emoji">${ing.emoji}</div>
      <div class="ingredient-name">${ing.name}</div>
    `;

    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(ing));
      tile.style.opacity = '0.6';
    });

    tile.addEventListener('dragend', () => {
      tile.style.opacity = '1';
    });

    tile.addEventListener('touchstart', (e) => {
      tile._touchIng = ing;
      tile.style.opacity = '0.6';
    }, { passive: true });

    tile.addEventListener('touchend', (e) => {
      tile.style.opacity = '1';
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && bowl.contains(target)) {
        dropIngredient(ing);
      }
    }, { passive: true });

    gridEl.appendChild(tile);
  });

  // Bowl drop zone
  const bowl = document.querySelector('.bowl-container');
  bowl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    bowl.style.transform = 'scale(1.05)';
  });

  bowl.addEventListener('dragleave', () => {
    bowl.style.transform = 'scale(1)';
  });

  bowl.addEventListener('drop', (e) => {
    e.preventDefault();
    bowl.style.transform = 'scale(1)';

    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    dropIngredient(data);
  });

  function updateCounter() {
    counterEl.textContent = `Training Examples: ${count} / 500`;
  }

  function updateBowl() {
    const percentage = (count / 500) * 100;
    bowlFill.style.height = `${percentage}%`;
  }

  function checkMilestones() {
    milestones.forEach((milestone) => {
      if (count >= milestone && !achievedMilestones.has(milestone)) {
        achievedMilestones.add(milestone);
        showMilestone(milestone);
        window.soundManager?.success();
      }
    });
  }

  function showMilestone(num) {
    const msg = document.createElement('div');
    msg.className = 'milestone-message';
    msg.textContent = `🎉 Milestone: ${num} examples loaded!`;
    milestonesEl.appendChild(msg);

    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 300);
    }, 2000);
  }

  updateCounter();
}

export function reset() {
  count = 0;
  achievedMilestones.clear();

  const grid = document.getElementById('ingredientsGrid');
  if (grid) {
    const tiles = grid.querySelectorAll('.ingredient-tile');
    tiles.forEach((tile) => {
      tile.style.opacity = '1';
    });
  }

  const counter = document.getElementById('counter');
  if (counter) {
    counter.textContent = 'Training Examples: 0 / 500';
  }

  const bowlFill = document.getElementById('bowlFill');
  if (bowlFill) {
    bowlFill.style.height = '0%';
  }

  const milestones = document.getElementById('milestones');
  if (milestones) {
    milestones.innerHTML = '';
  }
}
