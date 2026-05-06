// Section 6: Multi-Agent Systems
let isAnimating = false;
let orderTicketActive = false;
let disabledStations = new Set();
let timeoutIds = [];
let rafId = null;
let animationProgress = 0;

const stations = [
  { id: 'sous', emoji: '👨‍🍳', role: 'Sous Chef', task: 'Plan the order' },
  { id: 'dough', emoji: '🤲', role: 'Dough Master', task: 'Stretch dough' },
  { id: 'topping', emoji: '🎨', role: 'Topping Specialist', task: 'Add toppings' },
  { id: 'oven', emoji: '🔥', role: 'Oven Tender', task: 'Bake pizza' },
  { id: 'expedite', emoji: '✅', role: 'Expediter', task: 'Quality check' }
];

function resizeCanvas(canvas) {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = 200;
}

function draw(canvas, ctx, progress, disabledSet) {
  ctx.setLineDash([]);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const stationWidth = canvas.width / stations.length;
  const stationY = canvas.height / 2;
  const stationRadius = 40;

  // Draw stations
  stations.forEach((station, idx) => {
    const x = stationWidth * idx + stationWidth / 2;
    const isActive = progress > idx;
    const isDisabled = disabledSet.has(station.id);

    ctx.fillStyle = isDisabled ? '#ccc' : (isActive ? '#2A9D8F' : '#F4A261');
    ctx.beginPath();
    ctx.arc(x, stationY, stationRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isDisabled ? '#999' : '#6B3A2A';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = isDisabled ? '#666' : 'white';
    ctx.font = 'bold 20px "Fredoka One"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(station.emoji, x, stationY);

    // Station label
    ctx.font = 'bold 11px "Nunito"';
    ctx.fillStyle = '#264653';
    ctx.fillText(station.role, x, stationY + 65);
  });

  // Draw conveyor belt
  ctx.strokeStyle = '#6B3A2A';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  ctx.beginPath();
  ctx.moveTo(stationRadius + 20, stationY);
  ctx.lineTo(canvas.width - stationRadius - 20, stationY);
  ctx.stroke();

  // Draw order ticket traveling
  if (orderTicketActive && progress > 0) {
    const ticketX = stationWidth * progress;
    const ticketY = stationY - 60;

    ctx.setLineDash([]);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(ticketX - 30, ticketY - 20, 60, 40);
    ctx.strokeStyle = '#6B3A2A';
    ctx.lineWidth = 2;
    ctx.strokeRect(ticketX - 30, ticketY - 20, 60, 40);

    ctx.fillStyle = '#264653';
    ctx.font = 'bold 12px "Fredoka One"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ORDER', ticketX, ticketY - 5);
    ctx.font = '10px "Nunito"';
    ctx.fillText('Pizza', ticketX, ticketY + 10);
  }

  // Draw pizza result if completed
  if (progress >= stations.length) {
    const pizzaX = canvas.width - 80;
    const pizzaY = stationY - 60;

    ctx.fillStyle = '#F4A261';
    ctx.beginPath();
    ctx.arc(pizzaX, pizzaY, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#6B3A2A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Slice lines
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(pizzaX, pizzaY);
      ctx.lineTo(pizzaX + 25 * Math.cos(angle), pizzaY + 25 * Math.sin(angle));
      ctx.stroke();
    }

    // Toppings
    ctx.fillStyle = '#E63946';
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 15 + 5;
      ctx.beginPath();
      ctx.arc(pizzaX + Math.cos(angle) * dist, pizzaY + Math.sin(angle) * dist, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function init(containerEl) {
  const html = `
    <div class="multi-agent-wrapper">
      <canvas id="multiAgentCanvas" style="width: 100%; border: 2px solid #6B3A2A; border-radius: 8px; background: white; margin: 2rem auto;"></canvas>

      <div class="station-toggles" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin: 2rem 0; padding: 1.5rem; background: rgba(255, 255, 255, 0.7); border-radius: 8px;">
        ${stations.map(station => `
          <label class="toggle-switch" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <input type="checkbox" class="station-toggle" data-station="${station.id}" checked>
            <span>${station.emoji} ${station.role}</span>
          </label>
        `).join('')}
      </div>

      <div class="control-panel">
        <button id="sendOrderBtn" class="primary">Send Order Through Brigade</button>
        <button id="singleChefBtn">Single Chef Mode</button>
        <button id="resetBtn">Reset</button>
      </div>

      <div id="result" style="display: none; margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.7); border-radius: 8px; border-left: 4px solid #F4A261;"></div>
    </div>
  `;

  containerEl.innerHTML = html;

  const canvas = containerEl.querySelector('#multiAgentCanvas');
  const ctx = canvas.getContext('2d');
  const sendOrderBtn = containerEl.querySelector('#sendOrderBtn');
  const singleChefBtn = containerEl.querySelector('#singleChefBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');
  const resultDiv = containerEl.querySelector('#result');
  const stationToggles = containerEl.querySelectorAll('.station-toggle');

  requestAnimationFrame(() => {
    resizeCanvas(canvas);
    draw(canvas, ctx, 0, disabledStations);
  });

  window.addEventListener('resize', () => {
    resizeCanvas(canvas);
    draw(canvas, ctx, animationProgress, disabledStations);
  });

  stationToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      try {
        const stationId = toggle.dataset.station;
        if (toggle.checked) {
          disabledStations.delete(stationId);
        } else {
          disabledStations.add(stationId);
        }
        draw(canvas, ctx, animationProgress, disabledStations);
        window.soundManager?.plop();
      } finally {
        // Done
      }
    });
  });

  sendOrderBtn.addEventListener('click', async () => {
    try {
      if (isAnimating) return;
      isAnimating = true;
      sendOrderBtn.disabled = true;
      resultDiv.style.display = 'none';

      orderTicketActive = true;
      animationProgress = 0;

      // Animate order through stations
      for (let i = 0; i <= stations.length; i++) {
        animationProgress = i;

        const station = stations[i - 1];
        if (station && disabledStations.has(station.id)) {
          // Station is disabled - pipeline breaks
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = `
            <strong style="color: #E63946;">❌ Pipeline Broken!</strong><br>
            The ${station.role} station is disabled. Order cannot proceed!<br>
            Re-enable the station and try again.
          `;
          window.soundManager?.error();
          draw(canvas, ctx, animationProgress, disabledStations);
          isAnimating = false;
          sendOrderBtn.disabled = false;
          orderTicketActive = false;
          return;
        }

        draw(canvas, ctx, animationProgress, disabledStations);
        window.soundManager?.ping();
        await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 600)));
      }

      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <strong style="color: #2A9D8F;">✓ Perfect Pizza!</strong><br>
        All 5 stations working together produced an excellent pizza.<br>
        <br>
        <em>Division of labor made the process faster and better. Each chef specializes.</em>
      `;
      window.soundManager?.success();
    } finally {
      isAnimating = false;
      sendOrderBtn.disabled = false;
    }
  });

  singleChefBtn.addEventListener('click', async () => {
    try {
      if (isAnimating) return;
      isAnimating = true;
      singleChefBtn.disabled = true;
      resultDiv.style.display = 'none';

      resultDiv.style.display = 'block';
      resultDiv.innerHTML = '<strong>Single Chef Mode: One chef does everything...</strong>';

      const steps = ['Planning', 'Stretching dough', 'Adding toppings', 'Baking', 'Quality check'];
      let html = '<strong>Single Chef Mode: One chef does everything...</strong><br><br>';

      for (let i = 0; i < steps.length; i++) {
        html += `${i + 1}. ${steps[i]}... (slow, error-prone)<br>`;
        resultDiv.innerHTML = html;
        window.soundManager?.ping();
        await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 800)));
      }

      resultDiv.innerHTML = html + `<br><strong style="color: #E63946;">⚠️ Pizza ready but took 2x longer and had errors.</strong><br>
        <em>Without specialization, quality suffers and speed drops.</em>`;
      window.soundManager?.error();
    } finally {
      isAnimating = false;
      singleChefBtn.disabled = false;
    }
  });

  resetBtn.addEventListener('click', () => {
    try {
      isAnimating = false;
      orderTicketActive = false;
      animationProgress = 0;
      disabledStations.clear();
      sendOrderBtn.disabled = false;
      singleChefBtn.disabled = false;
      resultDiv.style.display = 'none';

      stationToggles.forEach(toggle => {
        toggle.checked = true;
      });

      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      resizeCanvas(canvas);
      draw(canvas, ctx, 0, disabledStations);
      window.soundManager?.plop();
    } finally {
      // Done
    }
  });
}

export function reset() {
  isAnimating = false;
  orderTicketActive = false;
  animationProgress = 0;
  disabledStations.clear();
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
