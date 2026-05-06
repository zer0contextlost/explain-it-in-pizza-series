let _containerEl = null;
let trainingTimeoutId = null;
let _isTraining = false;

export function init(containerEl) {
  _containerEl = containerEl;
  const html = `
    <div class="epochs-wrapper">
      <div class="epochs-left">
        <div class="progress-ring-container">
          <svg class="progress-ring" viewBox="0 0 120 120">
            <circle
              class="progress-ring-bg"
              stroke="#e0e0e0"
              cx="60"
              cy="60"
              r="54"
            />
            <circle
              class="progress-ring-circle"
              stroke="#E63946"
              cx="60"
              cy="60"
              r="54"
              id="progressCircle"
            />
          </svg>
          <div class="progress-text">
            <div class="progress-epoch" id="epochNumber">0</div>
            <div class="progress-label">Epoch</div>
          </div>
        </div>

        <div class="epochs-animation">
          <div class="chef-loop" id="chefAnimation">👨‍🍳</div>
        </div>

        <div class="epochs-speed">
          <label for="epochSpeed">Speed</label>
          <input type="range" id="epochSpeed" min="0.5" max="3" value="1" step="0.5">
        </div>

        <button class="btn-primary" id="runTraining">Run Training</button>
      </div>

      <div class="epochs-right">
        <div class="pizza-progress">
          <div class="pizza-stage" id="stage1" title="Raw Dough">🟫</div>
          <div class="pizza-stage" id="stage2" title="Burnt Attempt">🔶</div>
          <div class="pizza-stage" id="stage3" title="Getting There">🍞</div>
          <div class="pizza-stage" id="stage4" title="Perfect Pizza">🍕</div>
          <div class="pizza-stage" id="stage5" title="Chef's Kiss">🏆</div>
        </div>

        <div class="loss-graph">
          <div class="loss-graph-title">Training & Validation Loss</div>
          <canvas id="lossCanvas" class="loss-graph-canvas"></canvas>
        </div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const epochNumber = containerEl.querySelector('#epochNumber');
  const epochSpeed = containerEl.querySelector('#epochSpeed');
  const runBtn = containerEl.querySelector('#runTraining');
  const circle = containerEl.querySelector('#progressCircle');
  const chefAnimation = containerEl.querySelector('#chefAnimation');
  const lossCanvas = containerEl.querySelector('#lossCanvas');
  const lossCtx = lossCanvas.getContext('2d');
  const stages = [
    containerEl.querySelector('#stage1'),
    containerEl.querySelector('#stage2'),
    containerEl.querySelector('#stage3'),
    containerEl.querySelector('#stage4'),
    containerEl.querySelector('#stage5'),
  ];

  const circleRadius = 54;
  const circumference = circleRadius * 2 * Math.PI;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;

  let currentEpoch = 0;
  const maxEpochs = 20;
  const trainingLoss = [];
  const validationLoss = [];

  function resizeCanvas() {
    lossCanvas.width = lossCanvas.offsetWidth;
    lossCanvas.height = lossCanvas.offsetHeight;
  }
  requestAnimationFrame(() => {
    resizeCanvas();
  });
  window.addEventListener('resize', () => { resizeCanvas(); drawLossGraph(); });

  function simulateLoss(epoch) {
    // Training loss decreases smoothly
    const trainLoss = 100 * Math.exp(-epoch / 5) + 5;
    // Validation loss follows but with slight overfitting
    const validLoss = 100 * Math.exp(-epoch / 4.5) + 8 + (epoch > 12 ? (epoch - 12) * 0.5 : 0);
    return { trainLoss, validLoss };
  }

  function drawLossGraph() {
    lossCtx.clearRect(0, 0, lossCanvas.width, lossCanvas.height);

    if (trainingLoss.length === 0) return;

    const padding = 40;
    const graphWidth = lossCanvas.width - 2 * padding;
    const graphHeight = lossCanvas.height - 2 * padding;

    // Find max loss for scaling
    const maxLoss = Math.max(...trainingLoss, ...validationLoss, 100);

    // Danger zone background
    const epoch12X = padding + (12 / maxEpochs) * graphWidth;
    if (currentEpoch > 12) {
      lossCtx.fillStyle = 'rgba(230, 57, 70, 0.1)';
      lossCtx.fillRect(epoch12X, padding, (padding + graphWidth) - epoch12X, graphHeight);
    }

    // Grid
    lossCtx.strokeStyle = '#e0e0e0';
    lossCtx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const y = padding + (i / 5) * graphHeight;
      lossCtx.beginPath();
      lossCtx.moveTo(padding, y);
      lossCtx.lineTo(padding + graphWidth, y);
      lossCtx.stroke();
    }

    // Training loss line
    lossCtx.strokeStyle = '#E63946';
    lossCtx.lineWidth = 3;
    lossCtx.beginPath();
    trainingLoss.forEach((loss, idx) => {
      const x = padding + (idx / maxEpochs) * graphWidth;
      const y = padding + graphHeight - (loss / maxLoss) * graphHeight;
      if (idx === 0) {
        lossCtx.moveTo(x, y);
      } else {
        lossCtx.lineTo(x, y);
      }
    });
    lossCtx.stroke();

    // Validation loss line
    lossCtx.strokeStyle = '#2A9D8F';
    lossCtx.lineWidth = 3;
    lossCtx.beginPath();
    validationLoss.forEach((loss, idx) => {
      const x = padding + (idx / maxEpochs) * graphWidth;
      const y = padding + graphHeight - (loss / maxLoss) * graphHeight;
      if (idx === 0) {
        lossCtx.moveTo(x, y);
      } else {
        lossCtx.lineTo(x, y);
      }
    });
    lossCtx.stroke();

    // Legend
    lossCtx.font = '12px Fredoka One';
    lossCtx.fillStyle = '#E63946';
    lossCtx.fillText('Training', padding, padding - 10);
    lossCtx.fillStyle = '#2A9D8F';
    lossCtx.fillText('Validation', padding + 120, padding - 10);
  }

  function updateProgress() {
    const progress = currentEpoch / maxEpochs;
    circle.style.strokeDashoffset = circumference * (1 - progress);
    epochNumber.textContent = currentEpoch;

    // Update stage
    const stageIdx = Math.floor((currentEpoch / maxEpochs) * stages.length);
    stages.forEach((s, idx) => {
      if (idx <= stageIdx) {
        s.classList.add('active');
      }
    });

    drawLossGraph();
  }

  async function trainOneEpoch() {
    if (!_isTraining) return;

    const { trainLoss, validLoss } = simulateLoss(currentEpoch);
    trainingLoss.push(trainLoss);
    validationLoss.push(validLoss);

    currentEpoch++;
    updateProgress();
    window.soundManager?.plop();

    const speed = parseFloat(epochSpeed.value);
    const delay = Math.round(2000 / speed);

    if (currentEpoch < maxEpochs) {
      trainingTimeoutId = setTimeout(trainOneEpoch, delay);
    } else {
      _isTraining = false;
      runBtn.disabled = false;
      window.soundManager?.success();
    }
  }

  runBtn.addEventListener('click', () => {
    if (_isTraining) return;

    if (currentEpoch >= maxEpochs) {
      currentEpoch = 0;
      trainingLoss.length = 0;
      validationLoss.length = 0;
      stages.forEach(s => s.classList.remove('active'));
      circle.style.strokeDashoffset = circumference;
      epochNumber.textContent = '0';
    }

    _isTraining = true;
    runBtn.disabled = true;
    trainOneEpoch();
  });

  updateProgress();
}

export function reset() {
  clearTimeout(trainingTimeoutId);
  trainingTimeoutId = null;
  _isTraining = false;

  if (!_containerEl) return;

  const epochNumber = _containerEl.querySelector('#epochNumber');
  const runBtn = _containerEl.querySelector('#runTraining');
  const circle = _containerEl.querySelector('#progressCircle');
  const lossCanvas = _containerEl.querySelector('#lossCanvas');

  if (epochNumber) epochNumber.textContent = '0';
  if (runBtn) runBtn.disabled = false;

  const stages = _containerEl.querySelectorAll('.pizza-stage');
  stages.forEach((s) => s.classList.remove('active'));
  if (stages[0]) stages[0].classList.add('active');

  const circleRadius = 54;
  const circumference = circleRadius * 2 * Math.PI;
  if (circle) {
    circle.style.strokeDashoffset = circumference;
  }

  if (lossCanvas) {
    const ctx = lossCanvas.getContext('2d');
    ctx.clearRect(0, 0, lossCanvas.width, lossCanvas.height);
  }
}
