// Section 1: The ReAct Loop
let isAnimating = false;
let currentStep = 0;
let totalSteps = 7;
let animationRafId = null;
let animationTimeoutIds = [];

const nodePositions = {
  THINK: { x: 200, y: 200 },
  ACT: { x: 400, y: 200 },
  OBSERVE: { x: 300, y: 350 }
};

const thoughts = [
  "I need mozzarella",
  "Let me check the fridge",
  "The fridge is empty!",
  "I need to call the supplier",
  "Order placed",
  "Supplier arrived with ingredients",
  "Pizza is ready!"
];

const actions = [
  "Think about what's needed",
  "Open the fridge",
  "See what's available",
  "Call supplier",
  "Wait for delivery",
  "Receive ingredients",
  "Put pizza in oven"
];

const observations = [
  "Need mozzarella → check fridge",
  "Fridge is empty → call supplier",
  "Called supplier → waiting",
  "Delivery arrived → got mozzarella",
  "Have ingredients → start assembly",
  "Assembly done → put in oven",
  "Pizza done!"
];

function resizeCanvas(canvas) {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = 600;
}

function draw(canvas, ctx, step) {
  ctx.setLineDash([]);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2 - 100;
  const centerY = 100;

  // Draw nodes
  const nodeRadius = 50;
  const nodes = [
    { label: 'THINK', pos: nodePositions.THINK, color: '#E63946' },
    { label: 'ACT', pos: nodePositions.ACT, color: '#E9C46A' },
    { label: 'OBSERVE', pos: nodePositions.OBSERVE, color: '#2A9D8F' }
  ];

  nodes.forEach(node => {
    const x = centerX + node.pos.x;
    const y = centerY + node.pos.y;

    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#6B3A2A';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px "Fredoka One"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, x, y);
  });

  // Draw arrows
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  // THINK -> ACT
  let x1 = centerX + nodePositions.THINK.x + nodeRadius;
  let y1 = centerY + nodePositions.THINK.y;
  let x2 = centerX + nodePositions.ACT.x - nodeRadius;
  let y2 = centerY + nodePositions.ACT.y;
  drawArrow(ctx, x1, y1, x2, y2);

  // ACT -> OBSERVE
  x1 = centerX + nodePositions.ACT.x;
  y1 = centerY + nodePositions.ACT.y + nodeRadius;
  x2 = centerX + nodePositions.OBSERVE.x;
  y2 = centerY + nodePositions.OBSERVE.y - nodeRadius;
  drawArrow(ctx, x1, y1, x2, y2);

  // OBSERVE -> THINK
  x1 = centerX + nodePositions.OBSERVE.x - nodeRadius * 0.7;
  y1 = centerY + nodePositions.OBSERVE.y;
  x2 = centerX + nodePositions.THINK.x - nodeRadius * 0.7;
  y2 = centerY + nodePositions.THINK.y;
  drawArrow(ctx, x1, y1, x2, y2);

  ctx.setLineDash([]);

  // Draw thought bubble if current step is THINK phase
  const phaseIndex = step % 3;
  if (phaseIndex === 0) {
    const bubbleX = centerX + nodePositions.THINK.x;
    const bubbleY = centerY + nodePositions.THINK.y - 120;
    drawThoughtBubble(ctx, bubbleX, bubbleY, thoughts[step]);
  } else if (phaseIndex === 1) {
    const bubbleX = centerX + nodePositions.ACT.x;
    const bubbleY = centerY + nodePositions.ACT.y - 120;
    drawThoughtBubble(ctx, bubbleX, bubbleY, actions[step]);
  } else {
    const bubbleX = centerX + nodePositions.OBSERVE.x;
    const bubbleY = centerY + nodePositions.OBSERVE.y + 100;
    drawThoughtBubble(ctx, bubbleX, bubbleY, observations[step]);
  }

  // Draw step counter
  ctx.fillStyle = '#264653';
  ctx.font = 'bold 18px "Nunito"';
  ctx.textAlign = 'center';
  ctx.fillText(`Step ${step + 1} of ${totalSteps}`, canvas.width / 2, 50);

  // Draw pizza at end
  if (step === totalSteps - 1) {
    drawPizza(ctx, canvas.width / 2, 500);
  }
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
  const headlen = 15;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function drawThoughtBubble(ctx, x, y, text) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;

  const width = 180;
  const height = 60;

  // Main bubble
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, 10);
  ctx.fill();
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(x - 30, y + height / 2 + 10);
  ctx.lineTo(x - 50, y + height / 2 + 30);
  ctx.lineTo(x - 20, y + height / 2 + 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#264653';
  ctx.font = 'bold 11px "Nunito"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split(' ');
  let line = '';
  let lineNum = 0;

  lines.forEach((word, idx) => {
    if (line.length + word.length > 18) {
      ctx.fillText(line, x, y - 10 + lineNum * 15);
      lineNum++;
      line = word;
    } else {
      line += (line.length ? ' ' : '') + word;
    }
  });
  if (line) {
    ctx.fillText(line, x, y - 10 + lineNum * 15);
  }
}

function drawPizza(ctx, x, y) {
  const radius = 50;

  ctx.fillStyle = '#F4A261';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pizza slices lines
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
    ctx.stroke();
  }

  // Toppings
  ctx.fillStyle = '#E63946';
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 30 + 10;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheese
  ctx.fillStyle = '#E9C46A';
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 35 + 5;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function init(containerEl) {
  const html = `
    <div class="react-loop-wrapper">
      <canvas id="reactLoopCanvas" style="width: 100%; border: 2px solid #6B3A2A; border-radius: 8px; background: white; margin: 2rem auto;"></canvas>
      <div class="control-panel">
        <button id="startOrderBtn" class="primary">Start Order</button>
        <label class="toggle-switch">
          <input type="checkbox" id="stepModeToggle">
          <span>Step Mode</span>
        </label>
        <button id="nextStepBtn" style="display: none;">Next Step</button>
        <button id="resetBtn">Reset</button>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const canvas = containerEl.querySelector('#reactLoopCanvas');
  const ctx = canvas.getContext('2d');

  // Canvas initialization with RAF
  requestAnimationFrame(() => {
    resizeCanvas(canvas);
    draw(canvas, ctx, 0);
  });

  // Resize handler
  window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    draw(canvas, ctx, currentStep);
  });

  const startBtn = containerEl.querySelector('#startOrderBtn');
  const stepModeToggle = containerEl.querySelector('#stepModeToggle');
  const nextStepBtn = containerEl.querySelector('#nextStepBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');

  function animateLoop() {
    if (currentStep < totalSteps) {
      draw(canvas, ctx, currentStep);
      currentStep++;

      if (!stepModeToggle.checked) {
        animationTimeoutIds.push(setTimeout(animateLoop, 800));
      }
    } else {
      isAnimating = false;
      startBtn.disabled = false;
      window.soundManager?.success();
    }
  }

  startBtn.addEventListener('click', () => {
    try {
      if (isAnimating) return;
      isAnimating = true;
      startBtn.disabled = true;
      currentStep = 0;

      if (stepModeToggle.checked) {
        nextStepBtn.style.display = 'inline-block';
        animateLoop();
      } else {
        nextStepBtn.style.display = 'none';
        animateLoop();
      }
    } finally {
      // Handled in animateLoop
    }
  });

  stepModeToggle.addEventListener('change', () => {
    if (isAnimating && stepModeToggle.checked) {
      nextStepBtn.style.display = 'inline-block';
    } else {
      nextStepBtn.style.display = 'none';
    }
  });

  nextStepBtn.addEventListener('click', () => {
    try {
      if (currentStep < totalSteps) {
        animateLoop();
      }
    } finally {
      // Handled in animateLoop
    }
  });

  resetBtn.addEventListener('click', () => {
    try {
      isAnimating = false;
      currentStep = 0;
      startBtn.disabled = false;
      nextStepBtn.style.display = 'none';

      animationTimeoutIds.forEach(id => clearTimeout(id));
      animationTimeoutIds = [];

      if (animationRafId) {
        cancelAnimationFrame(animationRafId);
        animationRafId = null;
      }

      resizeCanvas(canvas);
      draw(canvas, ctx, 0);
      window.soundManager?.plop();
    } finally {
      // Cleanup done
    }
  });
}

export function reset() {
  isAnimating = false;
  currentStep = 0;

  animationTimeoutIds.forEach(id => clearTimeout(id));
  animationTimeoutIds = [];

  if (animationRafId) {
    cancelAnimationFrame(animationRafId);
    animationRafId = null;
  }
}
