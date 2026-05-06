let canvasEl, ctx, rafId, resizeRafId;
let searchActive = false;
let queryVec = null;
let selectedDot = null;

const recipes = [
  { name: 'Margherita', x: 0.2, y: 0.3, emoji: '🍅', salty: 0.3, spicy: 0.1, doughy: 0.8 },
  { name: 'Diavolo', x: 0.7, y: 0.6, emoji: '🔥', salty: 0.6, spicy: 0.9, doughy: 0.7 },
  { name: 'Marinara', x: 0.25, y: 0.35, emoji: '🍝', salty: 0.4, spicy: 0.2, doughy: 0.75 },
  { name: 'Pepperoni', x: 0.6, y: 0.5, emoji: '🍗', salty: 0.7, spicy: 0.7, doughy: 0.8 },
  { name: 'BBQ Chicken', x: 0.65, y: 0.55, emoji: '🍖', salty: 0.6, spicy: 0.5, doughy: 0.8 },
  { name: 'Vegetarian', x: 0.3, y: 0.2, emoji: '🥬', salty: 0.2, spicy: 0.1, doughy: 0.7 },
  { name: 'Four Cheese', x: 0.4, y: 0.25, emoji: '🧀', salty: 0.5, spicy: 0.0, doughy: 0.8 },
  { name: 'Caesar Salad', x: 0.1, y: 0.75, emoji: '🥗', salty: 0.4, spicy: 0.0, doughy: 0.1 },
  { name: 'Seafood', x: 0.5, y: 0.7, emoji: '🦐', salty: 0.8, spicy: 0.3, doughy: 0.6 },
  { name: 'Garlic Knot', x: 0.3, y: 0.1, emoji: '🧄', salty: 0.5, spicy: 0.2, doughy: 0.9 },
  { name: 'Truffle', x: 0.55, y: 0.35, emoji: '🍄', salty: 0.7, spicy: 0.1, doughy: 0.8 },
  { name: 'Prosciutto', x: 0.62, y: 0.48, emoji: '🥓', salty: 0.85, spicy: 0.3, doughy: 0.8 },
  { name: 'Spicy Shrimp', x: 0.72, y: 0.65, emoji: '🌶️🦐', salty: 0.75, spicy: 0.8, doughy: 0.65 },
  { name: 'White Pizza', x: 0.35, y: 0.28, emoji: '⚪', salty: 0.4, spicy: 0.05, doughy: 0.85 },
  { name: 'Hawaiian', x: 0.65, y: 0.45, emoji: '🍍', salty: 0.5, spicy: 0.2, doughy: 0.8 },
];

export function init(containerEl) {
  const html = `
    <div class="embeddings-wrapper">
      <div class="embeddings-canvas-section">
        <div class="canvas-wrapper">
          <canvas id="embeddingsCanvas" width="800" height="600"></canvas>
        </div>
      </div>
      <div class="embeddings-controls">
        <div class="search-box">
          <input type="text" id="craveInput" placeholder="Type a craving... (e.g., 'smoky and meaty')">
          <button class="button" id="searchBtn">Search →</button>
        </div>
        <div class="search-results" id="searchResults" style="display: none;">
          <p id="resultsText"></p>
        </div>
        <div class="dot-details" id="dotDetails" style="display: none;">
          <h4 id="dotName"></h4>
          <div class="flavor-chart">
            <div class="flavor-bar">
              <label>Salty</label>
              <div class="bar" id="saltyBar"></div>
            </div>
            <div class="flavor-bar">
              <label>Spicy</label>
              <div class="bar" id="spicyBar"></div>
            </div>
            <div class="flavor-bar">
              <label>Doughy</label>
              <div class="bar" id="doughyBar"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  canvasEl = containerEl.querySelector('#embeddingsCanvas');
  ctx = canvasEl.getContext('2d');
  const craveInput = containerEl.querySelector('#craveInput');
  const searchBtn = containerEl.querySelector('#searchBtn');
  const searchResults = containerEl.querySelector('#searchResults');
  const resultsText = containerEl.querySelector('#resultsText');
  const dotDetails = containerEl.querySelector('#dotDetails');

  function resizeCanvas() {
    const rect = canvasEl.parentElement.getBoundingClientRect();
    canvasEl.width = rect.width - 20;
    canvasEl.height = Math.max(400, rect.width * 0.75);
    draw();
  }

  function getCanvasCoord(recipe) {
    return {
      x: recipe.x * canvasEl.width,
      y: recipe.y * canvasEl.height,
    };
  }

  function draw() {
    ctx.setLineDash([]);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    // Grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * canvasEl.width;
      const y = (i / 4) * canvasEl.height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasEl.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasEl.width, y);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Nunito';
    ctx.fillText('Mild', 10, 20);
    ctx.fillText('Spicy', canvasEl.width - 40, 20);
    ctx.fillText('Simple', 10, canvasEl.height - 5);
    ctx.fillText('Complex', canvasEl.width - 70, canvasEl.height - 5);

    // Draw query radius if searching
    if (searchActive && queryVec) {
      const qCoord = getCanvasCoord(queryVec);
      const radius = 120;

      ctx.fillStyle = 'rgba(230, 57, 70, 0.15)';
      ctx.beginPath();
      ctx.arc(qCoord.x, qCoord.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(230, 57, 70, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw query dot
      ctx.fillStyle = '#E63946';
      ctx.beginPath();
      ctx.arc(qCoord.x, qCoord.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6B3A2A';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#6B3A2A';
      ctx.font = 'bold 14px Nunito';
      ctx.fillText('Your Search', qCoord.x + 15, qCoord.y - 5);
    }

    // Draw recipe dots
    recipes.forEach((recipe) => {
      const coord = getCanvasCoord(recipe);

      // Highlight if in search radius
      let inRadius = false;
      if (searchActive && queryVec) {
        const qCoord = getCanvasCoord(queryVec);
        const dist = Math.sqrt((coord.x - qCoord.x) ** 2 + (coord.y - qCoord.y) ** 2);
        inRadius = dist < 120;
      }

      // Dot
      ctx.fillStyle = inRadius ? '#FFD700' : '#F4A261';
      if (selectedDot === recipe.name) {
        ctx.fillStyle = '#E63946';
      }
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, inRadius ? 12 : 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = inRadius ? '#FFD700' : '#6B3A2A';
      if (selectedDot === recipe.name) {
        ctx.strokeStyle = '#6B3A2A';
      }
      ctx.lineWidth = inRadius ? 3 : 2;
      ctx.stroke();

      // Emoji
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(recipe.emoji, coord.x, coord.y);

      // Label
      ctx.font = '11px Nunito';
      ctx.fillStyle = '#264653';
      ctx.textAlign = 'center';
      ctx.fillText(recipe.name, coord.x, coord.y + 25);
    });
  }

  function onCanvasClick(e) {
    const rect = canvasEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (const recipe of recipes) {
      const coord = getCanvasCoord(recipe);
      const dist = Math.sqrt((clickX - coord.x) ** 2 + (clickY - coord.y) ** 2);
      if (dist < 15) {
        selectedDot = recipe.name;
        showDotDetails(recipe);
        draw();
        window.soundManager?.ping();
        return;
      }
    }

    selectedDot = null;
    dotDetails.style.display = 'none';
    draw();
  }

  function showDotDetails(recipe) {
    containerEl.querySelector('#dotName').textContent = recipe.name + ' ' + recipe.emoji;

    containerEl.querySelector('#saltyBar').style.width = (recipe.salty * 100) + '%';
    containerEl.querySelector('#spicyBar').style.width = (recipe.spicy * 100) + '%';
    containerEl.querySelector('#doughyBar').style.width = (recipe.doughy * 100) + '%';

    dotDetails.style.display = 'block';
  }

  searchBtn.addEventListener('click', () => {
    const craving = craveInput.value.toLowerCase();
    if (!craving) {
      searchActive = false;
      searchResults.style.display = 'none';
      draw();
      return;
    }

    // Simple keyword matching for craving
    const keywords = craving.split(' ');
    const cravingVec = {
      x: 0.5,
      y: 0.5,
      name: 'Your search',
    };

    if (keywords.includes('smoky') || keywords.includes('meaty') || keywords.includes('salty')) {
      cravingVec.x = 0.7;
    }
    if (keywords.includes('spicy') || keywords.includes('hot')) {
      cravingVec.y = 0.6;
    }
    if (keywords.includes('simple') || keywords.includes('light')) {
      cravingVec.x = 0.3;
    }
    if (keywords.includes('cheese') || keywords.includes('creamy')) {
      cravingVec.x = 0.4;
      cravingVec.y = 0.25;
    }

    queryVec = cravingVec;
    searchActive = true;

    // Find closest recipes
    const distances = recipes.map((r) => {
      const qCoord = getCanvasCoord(queryVec);
      const rCoord = getCanvasCoord(r);
      const dist = Math.sqrt((qCoord.x - rCoord.x) ** 2 + (qCoord.y - rCoord.y) ** 2);
      return { recipe: r, dist };
    }).sort((a, b) => a.dist - b.dist).slice(0, 3);

    resultsText.innerHTML = `
      <strong>Similar recipes for: "${craving}"</strong><br>
      🎯 ${distances[0].recipe.name} ${distances[0].recipe.emoji}<br>
      🎯 ${distances[1].recipe.name} ${distances[1].recipe.emoji}<br>
      🎯 ${distances[2].recipe.name} ${distances[2].recipe.emoji}
    `;
    searchResults.style.display = 'block';
    draw();
    window.soundManager?.success();
  });

  canvasEl.addEventListener('click', onCanvasClick);
  canvasEl.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  });

  window.addEventListener('resize', () => {
    if (resizeRafId) cancelAnimationFrame(resizeRafId);
    resizeRafId = requestAnimationFrame(() => {
      resizeCanvas();
    });
  });

  requestAnimationFrame(() => {
    resizeCanvas();
    draw();
  });
}

export function reset() {
  if (rafId) cancelAnimationFrame(rafId);
  if (resizeRafId) cancelAnimationFrame(resizeRafId);
  searchActive = false;
  queryVec = null;
  selectedDot = null;
}
