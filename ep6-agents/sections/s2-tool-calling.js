// Section 2: Tool Calling
let isAnimating = false;
let toolStates = {
  supplier: true,
  oven: true,
  mix: true,
  peel: true,
  register: true,
  inventory: true
};
let timeoutIds = [];

const tools = [
  { id: 'supplier', icon: '📞', name: 'Call Supplier', description: 'Order ingredients' },
  { id: 'oven', icon: '🔥', name: 'Oven', description: 'Bake pizza' },
  { id: 'mix', icon: '🥄', name: 'Mix', description: 'Blend ingredients' },
  { id: 'peel', icon: '🍕', name: 'Peel', description: 'Shape dough' },
  { id: 'register', icon: '💰', name: 'Cash Register', description: 'Ring up bill' },
  { id: 'inventory', icon: '📋', name: 'Check Inventory', description: 'Count stock' }
];

export function init(containerEl) {
  const html = `
    <div class="tool-calling-wrapper">
      <div class="section-description">
        <h3>Available Tools</h3>
        <p>Toggle tools on/off. Watch how the chef's plan adapts.</p>
      </div>

      <div class="tool-grid" id="toolGrid"></div>

      <div class="control-panel">
        <button id="newOrderBtn" class="primary">Place Order</button>
        <button id="withoutToolsBtn">Try Without Tools</button>
        <button id="resetToolsBtn">Reset</button>
      </div>

      <div class="result-area" id="resultArea" style="display: none;">
        <div class="status-display" id="statusDisplay"></div>
        <div id="planSteps" style="margin-top: 1rem;"></div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const toolGrid = containerEl.querySelector('#toolGrid');
  const newOrderBtn = containerEl.querySelector('#newOrderBtn');
  const withoutToolsBtn = containerEl.querySelector('#withoutToolsBtn');
  const resetToolsBtn = containerEl.querySelector('#resetToolsBtn');
  const resultArea = containerEl.querySelector('#resultArea');
  const statusDisplay = containerEl.querySelector('#statusDisplay');
  const planSteps = containerEl.querySelector('#planSteps');

  // Create tool buttons
  tools.forEach(tool => {
    const button = document.createElement('div');
    button.className = 'tool-button';
    button.innerHTML = `
      <span class="tool-icon">${tool.icon}</span>
      <div class="tool-name">${tool.name}</div>
      <small>${tool.description}</small>
    `;
    button.dataset.tool = tool.id;

    button.addEventListener('click', () => {
      try {
        toolStates[tool.id] = !toolStates[tool.id];
        button.classList.toggle('disabled');
        window.soundManager?.plop();
      } finally {
        // Done
      }
    });

    toolGrid.appendChild(button);
  });

  function executeToolCall(toolId) {
    return new Promise(resolve => {
      const delay = Math.random() * 600 + 300;
      timeoutIds.push(setTimeout(() => {
        const results = {
          supplier: 'Supplier confirmed: Mozzarella, Tomatoes, Basil in stock',
          oven: 'Oven preheated to 450°F',
          mix: 'Ingredients mixed perfectly',
          peel: 'Dough stretched to 12 inches',
          register: 'Total: $15.99',
          inventory: 'Stock: Mozzarella 50/50, Sauce 40/50'
        };
        resolve(results[toolId] || 'Tool executed');
      }, delay));
    });
  }

  newOrderBtn.addEventListener('click', async () => {
    try {
      if (isAnimating) return;
      isAnimating = true;
      newOrderBtn.disabled = true;

      resultArea.style.display = 'block';
      statusDisplay.innerHTML = 'Planning order...';
      planSteps.innerHTML = '';

      // Show planning
      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 500)));

      // Determine which tools are needed
      const neededTools = ['supplier', 'mix', 'peel', 'oven'];
      const availableTools = neededTools.filter(t => toolStates[t]);

      if (availableTools.length === 0) {
        statusDisplay.className = 'status-display error';
        statusDisplay.innerHTML = '❌ No tools available! Chef cannot make pizza.';
        window.soundManager?.error();
      } else if (availableTools.length < neededTools.length) {
        const stepsHtml = availableTools
          .map((t, i) => {
            const tool = tools.find(tool => tool.id === t);
            return `
              <div class="animate-slide-in" style="animation-delay: ${i * 0.1}s;">
                <strong>${i + 1}. ${tool.name}</strong> - Adapting workflow...
              </div>
            `;
          })
          .join('');

        statusDisplay.className = 'status-display';
        statusDisplay.innerHTML = '⚠️ Plan adapted: Using only available tools';
        planSteps.innerHTML = stepsHtml;

        // Execute available tools
        for (const tool of availableTools) {
          await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 400)));
          const result = await executeToolCall(tool);
          const toolDiv = document.createElement('div');
          toolDiv.className = 'animate-slide-in';
          toolDiv.innerHTML = `<strong>${tool}</strong>: ${result}`;
          planSteps.appendChild(toolDiv);
        }

        statusDisplay.innerHTML = '⚠️ Pizza made, but some steps were skipped due to missing tools.';
        window.soundManager?.ping();
      } else {
        // Full plan with all tools
        const stepsHtml = availableTools
          .map((t, i) => {
            const tool = tools.find(tool => tool.id === t);
            return `
              <div class="animate-slide-in" style="animation-delay: ${i * 0.1}s;">
                <strong>${i + 1}. ${tool.name}</strong> - Ready
              </div>
            `;
          })
          .join('');

        statusDisplay.className = 'status-display success';
        statusDisplay.innerHTML = '✓ Full plan created with all tools';
        planSteps.innerHTML = stepsHtml;

        // Execute each tool
        for (const tool of availableTools) {
          await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 400)));
          const result = await executeToolCall(tool);
          const toolDiv = document.createElement('div');
          toolDiv.className = 'animate-slide-in';
          toolDiv.innerHTML = `<strong>${tool}</strong>: ${result}`;
          planSteps.appendChild(toolDiv);
        }

        statusDisplay.innerHTML = '✓ Perfect pizza complete!';
        window.soundManager?.success();
      }
    } finally {
      isAnimating = false;
      newOrderBtn.disabled = false;
    }
  });

  withoutToolsBtn.addEventListener('click', async () => {
    try {
      if (isAnimating) return;
      isAnimating = true;
      withoutToolsBtn.disabled = true;

      resultArea.style.display = 'block';
      statusDisplay.innerHTML = 'Chef trying to make pizza without tools...';
      planSteps.innerHTML = '';

      // Show failed attempts
      const attempts = [
        'Trying to grow tomatoes in the kitchen... (No Supplier tool)',
        'Mixing with bare hands... (No Mix tool)',
        'Stretching dough on the counter... (No Peel tool)',
        'Trying to bake in the microwave... (No Oven tool)'
      ];

      for (let i = 0; i < attempts.length; i++) {
        await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 600)));
        const div = document.createElement('div');
        div.className = 'status-display error animate-slide-in';
        div.innerHTML = `❌ ${attempts[i]}`;
        planSteps.appendChild(div);
      }

      statusDisplay.className = 'status-display error';
      statusDisplay.innerHTML = '❌ Disaster! Without tools, the chef can\'t do anything useful!';
      window.soundManager?.error();
    } finally {
      isAnimating = false;
      withoutToolsBtn.disabled = false;
    }
  });

  resetToolsBtn.addEventListener('click', () => {
    try {
      isAnimating = false;
      newOrderBtn.disabled = false;
      withoutToolsBtn.disabled = false;

      tools.forEach(tool => {
        toolStates[tool.id] = true;
      });

      document.querySelectorAll('.tool-button').forEach(btn => {
        btn.classList.remove('disabled');
      });

      resultArea.style.display = 'none';
      statusDisplay.innerHTML = '';
      planSteps.innerHTML = '';

      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];

      window.soundManager?.plop();
    } finally {
      // Done
    }
  });
}

export function reset() {
  isAnimating = false;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
  tools.forEach(tool => {
    toolStates[tool.id] = true;
  });
}
