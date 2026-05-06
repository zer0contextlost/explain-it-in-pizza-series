// Section 7: Infinite Loop
let isLooping = false;
let loopCount = 0;
let maxSteps = 50;
let timeoutIds = [];
let animationRafId = null;

function resizeCanvas(canvas) {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = 300;
}

function draw(canvas, ctx, loopCount, maxSteps) {
  ctx.setLineDash([]);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const kitchenX = 150;
  const fridgeX = canvas.width - 150;
  const chefY = canvas.height / 2;

  // Kitchen counter
  ctx.fillStyle = '#D4A574';
  ctx.fillRect(kitchenX - 60, chefY + 40, 120, 80);
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.strokeRect(kitchenX - 60, chefY + 40, 120, 80);

  // Fridge
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(fridgeX - 50, chefY + 40, 100, 80);
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.strokeRect(fridgeX - 50, chefY + 40, 100, 80);
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(fridgeX - 45, chefY + 45, 90, 70);

  // Chef icon moving back and forth
  const progress = (loopCount % 40) / 40;
  const chefX = kitchenX + (fridgeX - kitchenX) * progress;

  // Chef head
  ctx.fillStyle = '#F4A261';
  ctx.beginPath();
  ctx.arc(chefX, chefY - 30, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Chef hat
  ctx.fillStyle = 'white';
  ctx.fillRect(chefX - 15, chefY - 50, 30, 15);
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 1;
  ctx.strokeRect(chefX - 15, chefY - 50, 30, 15);

  // Chef body
  ctx.fillStyle = 'white';
  ctx.fillRect(chefX - 12, chefY - 10, 24, 35);
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.strokeRect(chefX - 12, chefY - 10, 24, 35);

  // Chef legs
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chefX - 8, chefY + 25);
  ctx.lineTo(chefX - 8, chefY + 45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(chefX + 8, chefY + 25);
  ctx.lineTo(chefX + 8, chefY + 45);
  ctx.stroke();

  // Arms
  ctx.strokeStyle = '#F4A261';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(chefX - 12, chefY);
  ctx.lineTo(chefX - 35, chefY - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(chefX + 12, chefY);
  ctx.lineTo(chefX + 35, chefY - 10);
  ctx.stroke();

  // Chef expression based on loop count
  let expression = '😐';
  if (loopCount < 5) {
    expression = '🤔';
  } else if (loopCount < 20) {
    expression = '😕';
  } else if (loopCount < 40) {
    expression = '😵';
  } else {
    expression = '🤪';
  }

  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(expression, chefX, chefY - 70);

  // Loop counter
  ctx.fillStyle = '#264653';
  ctx.font = 'bold 24px "Fredoka One"';
  ctx.textAlign = 'center';
  ctx.fillText(`Loop: ${loopCount}`, canvas.width / 2, 40);

  if (loopCount >= maxSteps) {
    ctx.fillStyle = '#E63946';
    ctx.font = 'bold 18px "Nunito"';
    ctx.fillText('INTERRUPTED!', canvas.width / 2, 80);
  }

  // Thought bubble
  const bubbleX = chefX;
  const bubbleY = chefY - 100;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bubbleX - 50, bubbleY - 25, 100, 50, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#264653';
  ctx.font = 'bold 11px "Nunito"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('I need cheese...', bubbleX, bubbleY);
}

export function init(containerEl) {
  const html = `
    <div class="infinite-loop-wrapper">
      <canvas id="infiniteLoopCanvas" style="width: 100%; border: 2px solid #6B3A2A; border-radius: 8px; background: white; margin: 2rem auto;"></canvas>

      <div class="control-panel">
        <button id="startLoopBtn" class="primary">Start Stuck Chef</button>
        <button id="interruptBtn" style="display: none;">Interrupt!</button>
        <button id="resetBtn">Reset</button>
      </div>

      <div class="slider-control">
        <label>Max Steps Limit:</label>
        <input type="range" id="maxStepsSlider" min="5" max="100" value="50" step="5">
        <span class="slider-value" id="maxStepsValue">50</span>
      </div>

      <div id="analysis" style="display: none; margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.7); border-radius: 8px; border-left: 4px solid #F4A261;"></div>
    </div>
  `;

  containerEl.innerHTML = html;

  const canvas = containerEl.querySelector('#infiniteLoopCanvas');
  const ctx = canvas.getContext('2d');
  const startLoopBtn = containerEl.querySelector('#startLoopBtn');
  const interruptBtn = containerEl.querySelector('#interruptBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');
  const maxStepsSlider = containerEl.querySelector('#maxStepsSlider');
  const maxStepsValue = containerEl.querySelector('#maxStepsValue');
  const analysisDiv = containerEl.querySelector('#analysis');

  requestAnimationFrame(() => {
    resizeCanvas(canvas);
    draw(canvas, ctx, 0, maxSteps);
  });

  window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    draw(canvas, ctx, loopCount, maxSteps);
  });

  maxStepsSlider.addEventListener('input', () => {
    try {
      maxSteps = parseInt(maxStepsSlider.value);
      maxStepsValue.textContent = maxSteps;
      draw(canvas, ctx, loopCount, maxSteps);
    } finally {
      // Done
    }
  });

  startLoopBtn.addEventListener('click', async () => {
    try {
      if (isLooping) return;
      isLooping = true;
      startLoopBtn.disabled = true;
      interruptBtn.style.display = 'inline-block';
      analysisDiv.style.display = 'none';

      loopCount = 0;

      const animate = () => {
        if (loopCount >= maxSteps) {
          isLooping = false;
          startLoopBtn.disabled = false;
          interruptBtn.style.display = 'none';

          analysisDiv.style.display = 'block';
          analysisDiv.innerHTML = `
            <strong style="color: #E63946;">🛑 Loop Interrupted at Step ${loopCount}</strong><br>
            <br>
            <strong>What Went Wrong?</strong><br>
            • Chef was stuck in a loop: "I need cheese" → Open fridge → See no cheese → "I need cheese" → repeat<br>
            • The agent wasn't learning from observations<br>
            • No circuit breaker was in place until we set max_steps<br>
            <br>
            <strong>How to Fix:</strong><br>
            ✓ Max steps limit caught the infinite loop<br>
            ✓ Root cause: Agent can't call a tool to order cheese<br>
            ✓ Solution: Add a tool call to contact the supplier
          `;

          window.soundManager?.success();
          return;
        }

        loopCount++;
        draw(canvas, ctx, loopCount, maxSteps);
        if (loopCount % 5 === 0) window.soundManager?.ping();

        animationRafId = requestAnimationFrame(animate);
      };

      animate();
    } finally {
      // Animation runs
    }
  });

  interruptBtn.addEventListener('click', () => {
    try {
      isLooping = false;
      startLoopBtn.disabled = false;
      interruptBtn.style.display = 'none';

      if (animationRafId) {
        cancelAnimationFrame(animationRafId);
        animationRafId = null;
      }

      analysisDiv.style.display = 'block';
      analysisDiv.innerHTML = `
        <strong style="color: #E63946;">🛑 Manually Interrupted at Step ${loopCount}</strong><br>
        <br>
        The chef was stuck in an infinite loop. Without human intervention or a max-steps limit, this would continue forever!
      `;

      window.soundManager?.error();
    } finally {
      // Done
    }
  });

  resetBtn.addEventListener('click', () => {
    try {
      isLooping = false;
      loopCount = 0;
      startLoopBtn.disabled = false;
      interruptBtn.style.display = 'none';
      analysisDiv.style.display = 'none';

      if (animationRafId) {
        cancelAnimationFrame(animationRafId);
        animationRafId = null;
      }

      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];

      resizeCanvas(canvas);
      draw(canvas, ctx, 0, maxSteps);
      window.soundManager?.plop();
    } finally {
      // Done
    }
  });
}

export function reset() {
  isLooping = false;
  loopCount = 0;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
  if (animationRafId) {
    cancelAnimationFrame(animationRafId);
    animationRafId = null;
  }
}
