// Section 8: Hallucinated Tools
let isAnimating = false;
let validationEnabled = true;
let timeoutIds = [];

const realTools = [
  { id: 'supplier', icon: '📞', name: 'Call Supplier', description: 'Real tool', real: true },
  { id: 'oven', icon: '🔥', name: 'Oven', description: 'Real tool', real: true },
  { id: 'mix', icon: '🥄', name: 'Mix', description: 'Real tool', real: true },
  { id: 'peel', icon: '🍕', name: 'Peel', description: 'Real tool', real: true },
  { id: 'register', icon: '💰', name: 'Cash Register', description: 'Real tool', real: true }
];

const hallucinatedTools = [
  {
    id: 'truffle',
    icon: '🍄',
    name: 'Truffle Injector',
    description: 'Add truffle essence',
    claim: 'I will inject truffle essence into the pizza',
    fabricatedResult: 'Truffle injected successfully'
  },
  {
    id: 'timemachine',
    icon: '⏰',
    name: 'Pizza Time Machine',
    description: 'Age pizza perfectly',
    claim: 'I will send pizza back in time to when it was hot',
    fabricatedResult: 'Pizza aged to perfection'
  },
  {
    id: 'flavorteleporter',
    icon: '✨',
    name: 'Flavor Teleporter',
    description: 'Copy flavors from another pizza',
    claim: 'I will teleport gourmet flavors into this pizza',
    fabricatedResult: 'Gourmet flavors teleported in'
  }
];

export function init(containerEl) {
  const html = `
    <div class="hallucinated-wrapper">
      <div class="validation-toggle" style="text-align: center; margin-bottom: 2rem;">
        <label class="toggle-switch" style="justify-content: center;">
          <input type="checkbox" id="validationToggle" checked>
          <span id="validationToggleLabel">Tool Validation ON</span>
        </label>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
        <div class="tool-wall" style="padding: 1.5rem; background: rgba(255, 255, 255, 0.5); border-radius: 8px; border: 2px solid #F4A261;">
          <h3 style="text-align: center; margin-bottom: 1rem;">Available Tools (on wall)</h3>
          <div id="toolWall" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;"></div>
        </div>

        <div style="padding: 1.5rem; background: rgba(255, 255, 255, 0.5); border-radius: 8px; border: 2px solid #F4A261;">
          <h3 style="text-align: center; margin-bottom: 1rem;">Hallucinated Tools (in thin air!)</h3>
          <div id="hallucinatedWall" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;"></div>
        </div>
      </div>

      <div class="control-panel">
        <button id="selectToolBtn" class="primary">Select a Tool</button>
        <button id="resetBtn">Reset</button>
      </div>

      <div id="scenario" style="display: none; margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.7); border-radius: 8px; border-left: 4px solid #F4A261;"></div>
    </div>
  `;

  containerEl.innerHTML = html;

  const validationToggle = containerEl.querySelector('#validationToggle');
  const toolWall = containerEl.querySelector('#toolWall');
  const hallucinatedWall = containerEl.querySelector('#hallucinatedWall');
  const selectToolBtn = containerEl.querySelector('#selectToolBtn');
  const resetBtn = containerEl.querySelector('#resetBtn');
  const scenario = containerEl.querySelector('#scenario');

  let selectedTool = null;

  function renderTools() {
    toolWall.innerHTML = '';
    realTools.forEach(tool => {
      const btn = document.createElement('div');
      btn.className = 'tool-button';
      btn.innerHTML = `
        <span class="tool-icon">${tool.icon}</span>
        <div class="tool-name">${tool.name}</div>
      `;
      btn.addEventListener('click', () => {
        selectedTool = tool;
        selectToolBtn.textContent = `Use: ${tool.name}`;
        window.soundManager?.plop();
      });
      toolWall.appendChild(btn);
    });

    hallucinatedWall.innerHTML = '';
    hallucinatedTools.forEach((tool, idx) => {
      const btn = document.createElement('div');
      btn.className = 'tool-button';
      btn.style.opacity = '0.5';
      btn.style.borderStyle = 'dashed';
      btn.innerHTML = `
        <span class="tool-icon">${tool.icon}</span>
        <div class="tool-name" style="font-size: 0.8rem;">${tool.name}</div>
      `;
      btn.addEventListener('click', () => {
        selectedTool = tool;
        selectToolBtn.textContent = `Use: ${tool.name} (hallucinated!)`;
        window.soundManager?.ping();
      });
      hallucinatedWall.appendChild(btn);
    });
  }

  const validationToggleLabel = containerEl.querySelector('#validationToggleLabel');
  validationToggle.addEventListener('change', () => {
    validationEnabled = validationToggle.checked;
    validationToggleLabel.textContent = validationEnabled ? 'Tool Validation ON' : 'Tool Validation OFF';
  });

  selectToolBtn.addEventListener('click', async () => {
    try {
      if (!selectedTool || isAnimating) return;
      isAnimating = true;
      selectToolBtn.disabled = true;

      scenario.style.display = 'block';
      const isReal = selectedTool.real === true;

      // Show reasoning
      scenario.innerHTML = `
        <strong>Chef's Reasoning:</strong><br>
        ${selectedTool.claim || `I will use ${selectedTool.name}`}<br>
        <br>
        <div style="background: rgba(255, 255, 255, 0.5); padding: 1rem; border-radius: 5px; margin: 1rem 0;">
          <em>Chef reaches for the ${selectedTool.name}...</em>
        </div>
      `;

      await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 800)));

      if (!isReal && validationEnabled) {
        // Validation catches it!
        scenario.innerHTML = `
          <strong style="color: #E63946;">❌ TOOL VALIDATION ERROR</strong><br>
          <br>
          Chef reaches toward the tool location...<br>
          <br>
          <div style="background: rgba(230, 57, 70, 0.1); padding: 1rem; border-radius: 5px; margin: 1rem 0; border-left: 4px solid #E63946;">
            <strong>Validation System Alert:</strong><br>
            Tool "${selectedTool.name}" is not in the available tools list!<br>
            This is a hallucinated tool. Aborting execution.
          </div>
          <br>
          Chef asks for help instead of using a fake tool.
        `;
        window.soundManager?.error();
      } else if (!isReal && !validationEnabled) {
        // Hallucination succeeds (bad!)
        scenario.innerHTML = `
          <strong style="color: #E63946;">⚠️ HALLUCINATION IN PROGRESS</strong><br>
          <br>
          Chef confidently mimes using the ${selectedTool.name}...<br>
          <br>
          <div style="background: rgba(230, 57, 70, 0.1); padding: 1rem; border-radius: 5px; margin: 1rem 0; border-left: 4px solid #E63946;">
            <strong>Chef's Fabricated Report:</strong><br>
            "Successfully executed: ${selectedTool.fabricatedResult}"<br>
            <br>
            <em>The chef is confident this worked, but...</em>
          </div>
        `;

        await new Promise(resolve => timeoutIds.push(setTimeout(resolve, 1000)));

        scenario.innerHTML += `
          <div style="background: rgba(230, 57, 70, 0.1); padding: 1rem; border-radius: 5px; margin: 1rem 0; border-left: 4px solid #E63946;">
            <strong>Customer's Reaction:</strong><br>
            "This pizza tastes nothing like ${selectedTool.name.toLowerCase()}!"<br>
            <br>
            <strong style="color: #264653;">The invisible mistake:</strong> The hallucinated tool never existed. No error was reported. The model was confidently and completely wrong.
          </div>
        `;
        window.soundManager?.error();
      } else {
        // Real tool
        scenario.innerHTML = `
          <strong style="color: #2A9D8F;">✓ REAL TOOL EXECUTED</strong><br>
          <br>
          Chef reaches for the ${selectedTool.name} on the wall...<br>
          <br>
          <div style="background: rgba(42, 157, 143, 0.1); padding: 1rem; border-radius: 5px; margin: 1rem 0; border-left: 4px solid #2A9D8F;">
            <strong>Tool Output:</strong><br>
            "Successfully executed: ${selectedTool.name}"<br>
            <br>
            Pizza quality improved!
          </div>
        `;
        window.soundManager?.success();
      }
    } finally {
      isAnimating = false;
      selectToolBtn.disabled = false;
    }
  });

  resetBtn.addEventListener('click', () => {
    try {
      isAnimating = false;
      selectToolBtn.disabled = false;
      selectedTool = null;
      selectToolBtn.textContent = 'Select a Tool';
      scenario.style.display = 'none';

      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];

      window.soundManager?.plop();
    } finally {
      // Done
    }
  });

  renderTools();
}

export function reset() {
  isAnimating = false;
  validationEnabled = true;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
}
