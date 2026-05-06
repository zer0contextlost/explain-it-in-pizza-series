// Section 3: Planning
let isAnimating = false;
let timeoutIds = [];

const orders = [
  {
    name: 'Margherita Pizza',
    plannedSteps: [
      'Stretch dough to 12 inches',
      'Spread tomato sauce evenly',
      'Add fresh mozzarella',
      'Garnish with basil',
      'Bake at 450°F for 12 minutes'
    ],
    chaosSteps: [
      'Add mozzarella (no sauce yet!)',
      'Start oven',
      'Remember to stretch dough',
      'Sauce is missing!',
      'Pizza burns'
    ]
  },
  {
    name: 'Pepperoni Special',
    plannedSteps: [
      'Prepare dough',
      'Add sauce',
      'Layer pepperoni evenly',
      'Add mozzarella',
      'Bake until crust is golden'
    ],
    chaosSteps: [
      'Throw random toppings',
      'Forget the sauce',
      'Cheese on top of pepperoni?',
      'Oven temperature wrong',
      'Undercooked mess'
    ]
  },
  {
    name: 'Veggie Deluxe',
    plannedSteps: [
      'Prepare base (dough + sauce)',
      'Add bell peppers',
      'Add mushrooms',
      'Add olives and spinach',
      'Top with cheese and bake'
    ],
    chaosSteps: [
      'Spinach wilts immediately',
      'Peppers too thick',
      'Olives fall off',
      'Forgot the cheese',
      'Mushy disaster'
    ]
  }
];

export function init(containerEl) {
  const html = `
    <div class="planning-wrapper">
      <div class="planning-controls">
        <select id="orderSelect" style="padding: 0.75rem; border: 2px solid #F4A261; border-radius: 5px; font-family: 'Nunito', sans-serif; cursor: pointer;">
          ${orders.map((o, i) => `<option value="${i}">${o.name}</option>`).join('')}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
        <div class="plan-panel">
          <h3 style="color: #264653; margin-bottom: 1rem; text-align: center;">📋 With Planning</h3>
          <div id="plannedSteps" class="steps-list"></div>
          <div id="plannedTimer" style="text-align: center; margin-top: 1rem; font-weight: bold; color: #2A9D8F; font-size: 1.2rem;"></div>
        </div>

        <div class="plan-panel">
          <h3 style="color: #264653; margin-bottom: 1rem; text-align: center;">🌪️ Without Planning</h3>
          <div id="chaosSteps" class="steps-list"></div>
          <div id="chaosTimer" style="text-align: center; margin-top: 1rem; font-weight: bold; color: #E63946; font-size: 1.2rem;"></div>
        </div>
      </div>

      <div class="control-panel">
        <button id="executeBtn" class="primary">Execute Both Plans</button>
        <button id="resetBtn">Reset</button>
      </div>

      <div id="results" style="display: none; margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.7); border-radius: 8px;"></div>
    </div>
  `;

  containerEl.innerHTML = html;

  const orderSelect = containerEl.querySelector('#orderSelect');
  const executeBtn = containerEl.querySelector('#executeBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');
  const resultsDiv = containerEl.querySelector('#results');

  function renderOrder(orderIndex) {
    const order = orders[orderIndex];
    const plannedStepsDiv = containerEl.querySelector('#plannedSteps');
    const chaosStepsDiv = containerEl.querySelector('#chaosSteps');

    plannedStepsDiv.innerHTML = order.plannedSteps
      .map((step, i) => `
        <div class="step-item" data-step="${i}">
          <div class="step-number">${i + 1}</div>
          <div class="step-text">${step}</div>
          <div class="step-check" style="display: none;">✓</div>
        </div>
      `)
      .join('');

    chaosStepsDiv.innerHTML = order.chaosSteps
      .map((step, i) => `
        <div class="step-item chaos" data-step="${i}">
          <div class="step-number">❌</div>
          <div class="step-text">${step}</div>
        </div>
      `)
      .join('');

    resultsDiv.style.display = 'none';
  }

  orderSelect.addEventListener('change', () => {
    renderOrder(parseInt(orderSelect.value));
  });

  executeBtn.addEventListener('click', async () => {
    try {
      if (isAnimating) return;
      isAnimating = true;
      executeBtn.disabled = true;

      const orderIndex = parseInt(orderSelect.value);
      const order = orders[orderIndex];

      // Execute planned path
      let plannedTime = 0;
      const plannedStepElements = containerEl.querySelectorAll('#plannedSteps .step-item');
      for (let i = 0; i < plannedStepElements.length; i++) {
        const el = plannedStepElements[i];
        await new Promise(resolve => {
          timeoutIds.push(setTimeout(() => {
            el.style.background = '#2A9D8F';
            el.style.color = 'white';
            el.querySelector('.step-check').style.display = 'inline';
            plannedTime += 800;
            containerEl.querySelector('#plannedTimer').textContent = `Time: ${plannedTime / 1000}s`;
            window.soundManager?.ping();
            resolve();
          }, 800));
        });
      }

      // Execute chaos path
      let chaosTime = 0;
      const chaosStepElements = containerEl.querySelectorAll('#chaosSteps .step-item');
      for (let i = 0; i < chaosStepElements.length; i++) {
        const el = chaosStepElements[i];
        await new Promise(resolve => {
          timeoutIds.push(setTimeout(() => {
            el.style.background = '#E63946';
            el.style.color = 'white';
            chaosTime += 600 + Math.random() * 400; // Chaos takes longer
            containerEl.querySelector('#chaosTimer').textContent = `Time: ${(chaosTime / 1000).toFixed(1)}s`;
            window.soundManager?.error();
            resolve();
          }, 600));
        });
      }

      // Show results
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 500)));

      const plannedResult = `<strong>✓ Planned Approach:</strong> ${plannedTime / 1000}s - Perfect pizza!`;
      const chaosResult = `<strong>❌ Chaotic Approach:</strong> ${(chaosTime / 1000).toFixed(1)}s - Burnt/raw disaster`;
      const savings = ((chaosTime - plannedTime) / 1000).toFixed(1);

      resultsDiv.innerHTML = `
        <div class="status-display success" style="margin-bottom: 1rem;">${plannedResult}</div>
        <div class="status-display error" style="margin-bottom: 1rem;">${chaosResult}</div>
        <div class="status-display" style="background: rgba(233, 196, 106, 0.2);">
          <strong>Key Insight:</strong> Planning took 1s upfront but saved ${savings}s overall by preventing mistakes!
        </div>
      `;

      window.soundManager?.success();
    } finally {
      isAnimating = false;
      executeBtn.disabled = false;
    }
  });

  resetBtn.addEventListener('click', () => {
    try {
      isAnimating = false;
      executeBtn.disabled = false;

      containerEl.querySelectorAll('.step-item').forEach(el => {
        el.style.background = '';
        el.style.color = '';
        el.querySelector('.step-check')?.style.display = 'none';
      });

      containerEl.querySelector('#plannedTimer').textContent = '';
      containerEl.querySelector('#chaosTimer').textContent = '';
      resultsDiv.style.display = 'none';

      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];

      window.soundManager?.plop();
    } finally {
      // Done
    }
  });

  // Initial render
  renderOrder(0);

  // Add CSS for step items
  const style = document.createElement('style');
  style.textContent = `
    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      border-left: 4px solid #F4A261;
      transition: all 0.3s ease;
    }
    .step-item.chaos {
      border-left-color: #E63946;
    }
    .step-number {
      min-width: 30px;
      font-weight: bold;
      color: #F4A261;
      text-align: center;
    }
    .step-item.chaos .step-number {
      color: #E63946;
    }
    .step-text {
      flex: 1;
      color: #264653;
      font-size: 0.95rem;
    }
    .step-check {
      font-size: 1.2rem;
      font-weight: bold;
    }
    .plan-panel {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      border: 2px solid #F4A261;
    }
  `;
  document.head.appendChild(style);
}

export function reset() {
  isAnimating = false;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
}
