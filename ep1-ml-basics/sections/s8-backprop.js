let globalCanvas, globalCtx, globalLayerPositions;
let _containerEl = null;
const CANVAS_PADDING = 60;

function getLayerX(layerIdx) {
  return CANVAS_PADDING + ((globalCanvas.width - 2 * CANVAS_PADDING) / (globalLayerPositions.length - 1)) * layerIdx;
}

function getNodeY(nodeIdx, totalNodes) {
  const spacing = globalCanvas.height / (totalNodes + 1);
  return spacing * (nodeIdx + 1);
}

function drawForwardPass() {
  const ctx = globalCtx;
  const canvas = globalCanvas;
  const layerPositions = globalLayerPositions;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw network
  layerPositions.forEach((layer, layerIdx) => {
    const x = getLayerX(layerIdx);

    // Layer label
    ctx.fillStyle = '#6B3A2A';
    ctx.font = 'bold 12px Fredoka One';
    ctx.textAlign = 'center';
    ctx.fillText(layer.name, x, 20);

    // Nodes
    for (let i = 0; i < layer.nodes; i++) {
      const y = getNodeY(i, layer.nodes);

      ctx.fillStyle = 'white';
      ctx.strokeStyle = '#F4A261';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  });

  // Draw connections
  for (let i = 0; i < layerPositions.length - 1; i++) {
    const x1 = getLayerX(i);
    const x2 = getLayerX(i + 1);

    for (let j = 0; j < layerPositions[i].nodes; j++) {
      const y1 = getNodeY(j, layerPositions[i].nodes);
      for (let k = 0; k < layerPositions[i + 1].nodes; k++) {
        const y2 = getNodeY(k, layerPositions[i + 1].nodes);

        ctx.strokeStyle = 'rgba(244, 162, 97, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }

  // Output pizza (wrong)
  const outputX = getLayerX(layerPositions.length - 1);
  const outputY = getNodeY(0, 1);
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍕', outputX, outputY);

  // Error badge
  ctx.fillStyle = '#E63946';
  ctx.font = 'bold 10px Fredoka One';
  ctx.fillText('ERROR', outputX + 20, outputY - 15);
}

export function init(containerEl) {
  _containerEl = containerEl;
  const html = `
    <div class="backprop-wrapper">
      <div class="backprop-controls">
        <button class="btn-primary" id="spotMistakeBtn">Spot the Mistake! 🔍</button>
        <label>
          <input type="checkbox" id="stepMode"> Step Mode
        </label>
        <button class="btn-secondary" id="nextStepBtn" disabled>Next Step →</button>
      </div>

      <canvas id="backpropCanvas" class="backprop-canvas"></canvas>

      <div class="backprop-explanation" id="explanation"></div>
    </div>
  `;

  containerEl.innerHTML = html;

  const canvas = containerEl.querySelector('#backpropCanvas');
  const ctx = canvas.getContext('2d');
  const spotBtn = containerEl.querySelector('#spotMistakeBtn');
  const stepModeCheckbox = containerEl.querySelector('#stepMode');
  const nextStepBtn = containerEl.querySelector('#nextStepBtn');
  const explanationDiv = containerEl.querySelector('#explanation');

  let isAnimating = false;
  let stepMode = false;
  let currentStep = 0;

  // Canvas sizing
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  requestAnimationFrame(() => {
    resizeCanvas();
    globalCanvas = canvas;
    globalCtx = ctx;
    globalLayerPositions = layerPositions;
    drawForwardPass();
  });
  window.addEventListener('resize', () => { resizeCanvas(); drawForwardPass(); });

  // Layer positions
  const layerPositions = [
    { name: 'Input', y: 0.5, nodes: 3 },
    { name: 'Hidden 1', y: 0.5, nodes: 4 },
    { name: 'Hidden 2', y: 0.5, nodes: 3 },
    { name: 'Hidden 3', y: 0.5, nodes: 2 },
    { name: 'Output', y: 0.5, nodes: 1 },
  ];

  async function animateBackpropagation() {
    isAnimating = true;
    spotBtn.disabled = true;
    nextStepBtn.disabled = true;
    currentStep = 0;

    // Phase 1: Show error at output
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawForwardPass();

    await delay(500);

    // Phase 2: Animate error propagation backwards
    const steps = layerPositions.length;

    for (let step = 0; step < steps; step++) {
      if (stepMode && step > 0) {
        currentStep = step;
        await new Promise((resolve) => {
          nextStepBtn.disabled = false;
          nextStepBtn.onclick = () => {
            nextStepBtn.disabled = true;
            resolve();
          };
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawForwardPass();

      // Draw error propagation from right to left
      const fromLayerIdx = layerPositions.length - 1 - step;

      if (fromLayerIdx >= 0) {
        // Draw red arrow traveling backwards
        const color = [
          'rgba(230, 57, 70, 1)',
          'rgba(244, 162, 97, 0.8)',
          'rgba(233, 196, 106, 0.6)',
        ][Math.min(step, 2)];

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);

        const x1 = getLayerX(fromLayerIdx);
        const y1 = getNodeY(0, layerPositions[fromLayerIdx].nodes);

        if (fromLayerIdx > 0) {
          const x0 = getLayerX(fromLayerIdx - 1);

          // Draw error gradient across layer
          for (let i = 0; i < layerPositions[fromLayerIdx].nodes; i++) {
            const yFrom = getNodeY(i, layerPositions[fromLayerIdx].nodes);

            for (let j = 0; j < layerPositions[fromLayerIdx - 1].nodes; j++) {
              const yTo = getNodeY(j, layerPositions[fromLayerIdx - 1].nodes);

              ctx.beginPath();
              ctx.moveTo(x1, yFrom);
              ctx.lineTo(x0, yTo);
              ctx.stroke();
            }
          }

          // Highlight nodes receiving error
          ctx.setLineDash([]);
          const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
          ctx.fillStyle = rgbaMatch
            ? `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, 0.3)`
            : color;
          for (let i = 0; i < layerPositions[fromLayerIdx - 1].nodes; i++) {
            const y = getNodeY(i, layerPositions[fromLayerIdx - 1].nodes);
            ctx.beginPath();
            ctx.arc(x0, y, 12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Update explanation
      if (step === 0) {
        explanationDiv.innerHTML = `
          <div class="backprop-step">
            <div class="backprop-step-title">🔴 The pizza came out wrong! The judge tastes it — too salty, not enough sauce.</div>
            <div class="backprop-step-desc">The kitchen realizes the mistake (loss = 45). Time to trace back where things went wrong...</div>
          </div>
        `;
      } else if (step === 1) {
        explanationDiv.innerHTML = `
          <div class="backprop-step">
            <div class="backprop-step-title">📍 The topping station gets the blame first — it over-salted everything.</div>
            <div class="backprop-step-desc">Error signal flows back to the last station. (δ₃ = [0.3, 0.2] — these nodes contributed most to the mistake.)</div>
          </div>
        `;
      } else if (step === 2) {
        explanationDiv.innerHTML = `
          <div class="backprop-step">
            <div class="backprop-step-title">🔀 The sauce station: partly responsible for the imbalance.</div>
            <div class="backprop-step-desc">The blame spreads further back through the kitchen. (δ₂ = [-0.15, 0.25, 0.1] — hidden layer shares responsibility.)</div>
          </div>
        `;
      } else {
        explanationDiv.innerHTML = `
          <div class="backprop-step">
            <div class="backprop-step-title">✅ Each station adjusts their recipe for next time. Less salt. More sauce.</div>
            <div class="backprop-step-desc">All stations update their techniques. (Weight gradients calculated and applied — the model has learned from its mistake.)</div>
          </div>
        `;
      }

      window.soundManager?.plop();
      await delay(800);
    }

    ctx.setLineDash([]);
    drawForwardPass();

    explanationDiv.innerHTML = `
      <div class="backprop-step">
        <div class="backprop-step-title">🎯 Forward Pass with Updated Weights</div>
        <div class="backprop-step-desc">Try again! With corrected weights, the pizza should be better.</div>
      </div>
    `;

    window.soundManager?.success();
    isAnimating = false;
    spotBtn.disabled = false;
    stepModeCheckbox.disabled = false;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  spotBtn.addEventListener('click', () => {
    if (isAnimating) return;
    stepMode = stepModeCheckbox.checked;
    stepModeCheckbox.disabled = true;
    nextStepBtn.disabled = !stepMode;
    animateBackpropagation();
  });

  stepModeCheckbox.addEventListener('change', (e) => {
    // Reset if needed
  });

  explanationDiv.innerHTML = `
    <div class="backprop-step">
      <div class="backprop-step-title">📝 Ready to Learn</div>
      <div class="backprop-step-desc">Click "Spot the Mistake!" to trace how errors flow backward through the network.</div>
    </div>
  `;
}

export function reset() {
  if (!_containerEl) return;

  const spotBtn = _containerEl.querySelector('#spotMistakeBtn');
  const stepModeCheckbox = _containerEl.querySelector('#stepMode');
  const nextStepBtn = _containerEl.querySelector('#nextStepBtn');
  const explanationDiv = _containerEl.querySelector('#explanation');
  const canvas = _containerEl.querySelector('#backpropCanvas');

  if (spotBtn) spotBtn.disabled = false;
  if (stepModeCheckbox) stepModeCheckbox.checked = false;
  if (stepModeCheckbox) stepModeCheckbox.disabled = false;
  if (nextStepBtn) nextStepBtn.disabled = true;

  if (explanationDiv) {
    explanationDiv.innerHTML = `
      <div class="backprop-step">
        <div class="backprop-step-title">📝 Ready to Learn</div>
        <div class="backprop-step-desc">Click "Spot the Mistake!" to trace how errors flow backward through the network.</div>
      </div>
    `;
  }

  if (canvas) {
    const ctx = canvas.getContext('2d');
    globalCanvas = canvas;
    globalCtx = ctx;
    drawForwardPass();
  }
}
