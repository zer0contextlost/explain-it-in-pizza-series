let _containerEl = null;

export function init(containerEl) {
  _containerEl = containerEl;
  const html = `
    <div class="weights-wrapper">
      <div class="weights-sliders">
        <div class="weight-control">
          <label class="weight-label" for="w1">θ₁ Garlic Intensity</label>
          <input type="range" class="weight-slider" id="w1" min="-2" max="2" value="0" step="0.1">
          <div class="weight-value" id="w1Value">0.0</div>
        </div>

        <div class="weight-control">
          <label class="weight-label" for="w2">θ₂ Spice Level</label>
          <input type="range" class="weight-slider" id="w2" min="-2" max="2" value="0" step="0.1">
          <div class="weight-value" id="w2Value">0.0</div>
        </div>

        <div class="weight-control">
          <label class="weight-label" for="w3">θ₃ Sauce Acidity</label>
          <input type="range" class="weight-slider" id="w3" min="-2" max="2" value="0" step="0.1">
          <div class="weight-value" id="w3Value">0.0</div>
        </div>

        <div class="weight-control">
          <label class="weight-label" for="w4">θ₄ Cheese Melt</label>
          <input type="range" class="weight-slider" id="w4" min="-2" max="2" value="0" step="0.1">
          <div class="weight-value" id="w4Value">0.0</div>
        </div>

        <div class="weight-control">
          <label class="weight-label" for="w5">θ₅ Herb Balance</label>
          <input type="range" class="weight-slider" id="w5" min="-2" max="2" value="0" step="0.1">
          <div class="weight-value" id="w5Value">0.0</div>
        </div>

        <div class="weights-buttons">
          <button class="btn-secondary" id="randomBtn">🎲 Randomize (Untrained)</button>
          <button class="btn-success" id="trainBtn">✨ Optimize (Train)</button>
        </div>
      </div>

      <div class="weights-visualization">
        <div class="pizza-preview">
          <svg class="pizza-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#F4A261" stroke="#6B3A2A" stroke-width="2"/>
            <path d="M 50 2 L 77 69 L 50 98 Z" fill="#E9C46A" opacity="0.7" class="layer-garlic" id="layerGarlic"/>
            <path d="M 77 69 L 98 50 L 50 50 Z" fill="#E63946" opacity="0.7" class="layer-spice" id="layerSpice"/>
            <path d="M 98 50 L 77 31 L 50 50 Z" fill="#2A9D8F" opacity="0.7" class="layer-sauce" id="layerSauce"/>
            <path d="M 77 31 L 50 2 L 50 50 Z" fill="#FFE5B4" opacity="0.7" class="layer-cheese" id="layerCheese"/>
            <path d="M 50 50 L 50 2 L 23 31 Z" fill="#2A9D8F" opacity="0.7" class="layer-herb" id="layerHerb"/>
            <circle cx="60" cy="35" r="3" fill="#FF6B6B" opacity="0.8"/>
            <circle cx="70" cy="50" r="2.5" fill="#FFD700" opacity="0.8"/>
          </svg>
        </div>

        <svg class="radar-chart" id="radarChart" viewBox="0 0 250 250">
          <g transform="translate(125, 125)">
            <!-- Radar grid -->
            <circle cx="0" cy="0" r="100" fill="none" stroke="#e0e0e0" stroke-width="1"/>
            <circle cx="0" cy="0" r="75" fill="none" stroke="#e0e0e0" stroke-width="1"/>
            <circle cx="0" cy="0" r="50" fill="none" stroke="#e0e0e0" stroke-width="1"/>
            <circle cx="0" cy="0" r="25" fill="none" stroke="#e0e0e0" stroke-width="1"/>

            <!-- Axes -->
            <line x1="0" y1="0" x2="0" y2="-100" stroke="#ddd" stroke-width="1"/>
            <line x1="0" y1="0" x2="95" y2="-31" stroke="#ddd" stroke-width="1"/>
            <line x1="0" y1="0" x2="59" y2="81" stroke="#ddd" stroke-width="1"/>
            <line x1="0" y1="0" x2="-59" y2="81" stroke="#ddd" stroke-width="1"/>
            <line x1="0" y1="0" x2="-95" y2="-31" stroke="#ddd" stroke-width="1"/>

            <!-- Labels -->
            <text x="0" y="-110" text-anchor="middle" font-size="10" fill="#6B3A2A" font-weight="bold">Garlic</text>
            <text x="105" y="-20" text-anchor="start" font-size="10" fill="#6B3A2A" font-weight="bold">Spice</text>
            <text x="70" y="100" text-anchor="middle" font-size="10" fill="#6B3A2A" font-weight="bold">Sauce</text>
            <text x="-70" y="100" text-anchor="middle" font-size="10" fill="#6B3A2A" font-weight="bold">Cheese</text>
            <text x="-105" y="-20" text-anchor="end" font-size="10" fill="#6B3A2A" font-weight="bold">Herbs</text>

            <!-- Data polygon -->
            <polygon id="radarPolygon" points="0,-100 95,-31 59,81 -59,81 -95,-31" fill="rgba(230, 57, 70, 0.3)" stroke="#E63946" stroke-width="2"/>
          </g>
        </svg>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const weights = {
    w1: containerEl.querySelector('#w1'),
    w2: containerEl.querySelector('#w2'),
    w3: containerEl.querySelector('#w3'),
    w4: containerEl.querySelector('#w4'),
    w5: containerEl.querySelector('#w5'),
  };

  const values = {
    w1: containerEl.querySelector('#w1Value'),
    w2: containerEl.querySelector('#w2Value'),
    w3: containerEl.querySelector('#w3Value'),
    w4: containerEl.querySelector('#w4Value'),
    w5: containerEl.querySelector('#w5Value'),
  };

  const layers = {
    w1: containerEl.querySelector('#layerGarlic'),
    w2: containerEl.querySelector('#layerSpice'),
    w3: containerEl.querySelector('#layerSauce'),
    w4: containerEl.querySelector('#layerCheese'),
    w5: containerEl.querySelector('#layerHerb'),
  };

  const randomBtn = containerEl.querySelector('#randomBtn');
  const trainBtn = containerEl.querySelector('#trainBtn');
  const radarPolygon = containerEl.querySelector('#radarPolygon');

  // Optimal weight values
  const optimal = {
    w1: 1.5,
    w2: 1.2,
    w3: 1.3,
    w4: 1.4,
    w5: 1.1,
  };

  function updateDisplay() {
    Object.keys(weights).forEach((key) => {
      const val = parseFloat(weights[key].value);
      values[key].textContent = val.toFixed(1);

      // Update opacity and color for layers
      const opacity = 0.3 + Math.max(0, val) * 0.2;
      layers[key].style.opacity = opacity;

      if (val < 0) {
        values[key].classList.add('weight-negative');
        values[key].textContent += ' ✗';
      } else {
        values[key].classList.remove('weight-negative');
      }
    });

    updateRadar();
  }

  function updateRadar() {
    const w1 = parseFloat(weights.w1.value);
    const w2 = parseFloat(weights.w2.value);
    const w3 = parseFloat(weights.w3.value);
    const w4 = parseFloat(weights.w4.value);
    const w5 = parseFloat(weights.w5.value);

    // Convert to 0-100 scale for radar
    const scale = (v) => Math.max(0, (v + 2) * 25);

    const p1 = scale(w1);
    const p2 = scale(w2);
    const p3 = scale(w3);
    const p4 = scale(w4);
    const p5 = scale(w5);

    // Convert to polygon points
    const angle1 = (-Math.PI / 2);
    const angle2 = angle1 + (Math.PI * 2) / 5;
    const angle3 = angle2 + (Math.PI * 2) / 5;
    const angle4 = angle3 + (Math.PI * 2) / 5;
    const angle5 = angle4 + (Math.PI * 2) / 5;

    const points = [
      [Math.cos(angle1) * p1, Math.sin(angle1) * p1],
      [Math.cos(angle2) * p2, Math.sin(angle2) * p2],
      [Math.cos(angle3) * p3, Math.sin(angle3) * p3],
      [Math.cos(angle4) * p4, Math.sin(angle4) * p4],
      [Math.cos(angle5) * p5, Math.sin(angle5) * p5],
    ];

    const pointsStr = points.map((p) => `${p[0]},${p[1]}`).join(' ');
    radarPolygon.setAttribute('points', pointsStr);
  }

  Object.keys(weights).forEach((key) => {
    weights[key].addEventListener('input', updateDisplay);
  });

  randomBtn.addEventListener('click', () => {
    Object.keys(weights).forEach((key) => {
      weights[key].value = (Math.random() * 4 - 2).toFixed(1);
    });
    updateDisplay();
    window.soundManager?.error();
  });

  trainBtn.addEventListener('click', async () => {
    trainBtn.disabled = true;

    // Animate to optimal values
    const startValues = Object.keys(weights).reduce((acc, key) => {
      acc[key] = parseFloat(weights[key].value);
      return acc;
    }, {});

    for (let i = 0; i <= 20; i++) {
      const progress = i / 20;
      Object.keys(weights).forEach((key) => {
        const start = startValues[key];
        const end = optimal[key];
        const current = start + (end - start) * progress;
        weights[key].value = current.toFixed(1);
      });
      updateDisplay();
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    window.soundManager?.success();
    trainBtn.disabled = false;
  });

  updateDisplay();
}

export function reset() {
  if (!_containerEl) return;

  const weights = {
    w1: _containerEl.querySelector('#w1'),
    w2: _containerEl.querySelector('#w2'),
    w3: _containerEl.querySelector('#w3'),
    w4: _containerEl.querySelector('#w4'),
    w5: _containerEl.querySelector('#w5'),
  };

  Object.keys(weights).forEach((key) => {
    if (weights[key]) {
      weights[key].value = 0;
      weights[key].dispatchEvent(new Event('input'));
    }
  });

  const trainBtn = _containerEl.querySelector('#trainBtn');
  if (trainBtn) {
    trainBtn.disabled = false;
  }
}
