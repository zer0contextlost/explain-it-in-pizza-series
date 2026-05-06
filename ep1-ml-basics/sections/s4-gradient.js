let _containerEl = null;

export function init(containerEl) {
  _containerEl = containerEl;
  const html = `
    <div class="gradient-wrapper">
      <canvas id="gradientCanvas" class="gradient-canvas"></canvas>
      <div class="gradient-controls">
        <div class="control-group">
          <label for="lrSlider">Learning Rate</label>
          <input type="range" id="lrSlider" min="0.01" max="1" value="0.1" step="0.01">
        </div>
        <button class="btn-primary" id="rollBtn">Roll the Ball! 🍕</button>
        <button class="btn-secondary" id="resetBtn">Reset</button>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-label">Steps</div>
          <div class="stat-value" id="stepCount">0</div>
        </div>
        <div class="stat">
          <div class="stat-label">Current Loss</div>
          <div class="stat-value" id="currentLoss">100</div>
        </div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const canvas = containerEl.querySelector('#gradientCanvas');
  const ctx = canvas.getContext('2d');
  const lrSlider = containerEl.querySelector('#lrSlider');
  const rollBtn = containerEl.querySelector('#rollBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');
  const stepCount = containerEl.querySelector('#stepCount');
  const currentLoss = containerEl.querySelector('#currentLoss');

  let isAnimating = false;
  let steps = 0;

  // Canvas sizing
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  requestAnimationFrame(() => {
    resizeCanvas();
    drawLandscape();
  });
  window.addEventListener('resize', () => { resizeCanvas(); drawLandscape(); });

  // Parabola loss function with small local bump
  function lossAt(x) {
    const globalMin = 0.7;
    const bumpCenter = 0.3;
    const bumpHeight = 0.15;
    const bumpWidth = 0.1;

    // Main parabola
    const base = (x - globalMin) ** 2;

    // Local bump (using Gaussian)
    const bump = bumpHeight * Math.exp(-(((x - bumpCenter) / bumpWidth) ** 2));

    return base + bump + 0.05;
  }

  // Gradient (derivative) at position
  function gradientAt(x) {
    const h = 0.0001;
    return (lossAt(x + h) - lossAt(x - h)) / (2 * h);
  }

  let ballX = 0.2; // Starting position
  let animationId = null;

  function drawLandscape() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo((canvas.width / 10) * i, 0);
      ctx.lineTo((canvas.width / 10) * i, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, (canvas.height / 10) * i);
      ctx.lineTo(canvas.width, (canvas.height / 10) * i);
      ctx.stroke();
    }

    // Landscape curve
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;

    ctx.strokeStyle = '#264653';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let px = 0; px <= graphWidth; px += 2) {
      const x = px / graphWidth;
      const loss = lossAt(x);
      const y = padding + loss * graphHeight;

      if (px === 0) {
        ctx.moveTo(padding, y);
      } else {
        ctx.lineTo(padding + px, y);
      }
    }
    ctx.stroke();

    // Danger zone shading
    ctx.fillStyle = 'rgba(230, 57, 70, 0.1)';
    ctx.fillRect(padding + (0.2 * graphWidth), padding, 0.2 * graphWidth, graphHeight);

    // Canvas title
    ctx.fillStyle = '#6B3A2A';
    ctx.font = 'bold 13px Fredoka One';
    ctx.textAlign = 'left';
    ctx.fillText('Recipe Flavor Space', padding, 15);

    // Labels
    ctx.font = 'bold 12px Fredoka One';
    ctx.textAlign = 'center';
    ctx.fillText('Decent But Stuck 🤔', padding + (0.3 * graphWidth), padding - 10);

    ctx.fillStyle = '#2A9D8F';
    ctx.fillText('Perfect Pizza Valley 🍕', padding + (0.7 * graphWidth), padding - 10);

    // Ball
    const ballPixelX = padding + ballX * graphWidth;
    const ballPixelY = padding + lossAt(ballX) * graphHeight;

    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.arc(ballPixelX, ballPixelY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Pizza on ball
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍕', ballPixelX, ballPixelY);

    // Gradient arrow
    const grad = gradientAt(ballX);
    const arrowScale = 30;
    ctx.strokeStyle = 'rgba(230, 57, 70, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ballPixelX, ballPixelY - 20);
    ctx.lineTo(ballPixelX - grad * arrowScale, ballPixelY - 20 + grad * arrowScale * 5);
    ctx.stroke();

    // Step markers
    ctx.fillStyle = 'rgba(42, 157, 143, 0.3)';
    ctx.font = '10px Fredoka One';
    ctx.textAlign = 'center';
  }

  function animate() {
    const lr = parseFloat(lrSlider.value);
    const grad = gradientAt(ballX);

    ballX -= lr * grad;
    ballX = Math.max(0, Math.min(1, ballX));

    steps++;
    const loss = Math.round(lossAt(ballX) * 100);

    stepCount.textContent = steps;
    currentLoss.textContent = loss;

    drawLandscape();
    window.soundManager?.plop();

    // Continue if not at minimum
    const grad2 = Math.abs(gradientAt(ballX));
    if (grad2 > 0.001 && steps < 100) {
      animationId = setTimeout(animate, 200);
    } else {
      isAnimating = false;
      rollBtn.disabled = false;
      if (loss < 10) {
        window.soundManager?.success();
      }
    }
  }

  rollBtn.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    rollBtn.disabled = true;

    animate();
  });

  resetBtn.addEventListener('click', () => {
    if (animationId) {
      clearTimeout(animationId);
    }
    isAnimating = false;
    ballX = 0.2;
    steps = 0;
    stepCount.textContent = '0';
    currentLoss.textContent = Math.round(lossAt(ballX) * 100);
    drawLandscape();
    rollBtn.disabled = false;
    window.soundManager?.ping();
  });
}

export function reset() {
  if (!_containerEl) return;
  const resetBtn = _containerEl.querySelector('#resetBtn');
  if (resetBtn) {
    resetBtn.click();
  }
}
