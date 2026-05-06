// Section 8: Emergent Capabilities - Model Size Slider
window.initSection8Internal = function(container, sectionNum) {
  container.innerHTML = `
    <p class="section-description">
      Make the chef bigger and weird new skills appear unannounced. Nobody told him he could compose symphonies.
      He just... can.
    </p>

    <div style="margin: var(--spacing-lg) 0;">
      <div class="model-size-slider">
        <label for="s8-size-slider" class="slider-label">Model Size:</label>
        <input type="range" id="s8-size-slider" min="1" max="5" value="1" step="1" style="flex: 1;">
        <div class="slider-value" id="s8-size-display">1B (Small)</div>
      </div>
    </div>

    <div class="capabilities-list" id="s8-capabilities"></div>

    <button id="s8-run-eval" class="btn-secondary" style="width: 100%; margin-top: var(--spacing-lg);">Run Eval at Current Size</button>

    <div class="eval-result" id="s8-eval-result"></div>
  `;

  const sizeLabels = {
    1: "1B (Small)",
    2: "3B (Tiny-Medium)",
    3: "13B (Medium)",
    4: "33B (Large)",
    5: "100B+ (XL)"
  };

  const capabilitiesBySize = {
    1: [
      { name: "Basic pizza recipes", threshold: 1, enabled: true }
    ],
    2: [
      { name: "Basic pizza recipes", threshold: 1, enabled: true },
      { name: "Multi-language recipes", threshold: 2, enabled: false, isNew: true }
    ],
    3: [
      { name: "Basic pizza recipes", threshold: 1, enabled: true },
      { name: "Multi-language recipes", threshold: 2, enabled: true },
      { name: "Inventing new pizzas", threshold: 3, enabled: false, isNew: true },
      { name: "Writing pizza poetry", threshold: 3, enabled: false, isNew: true },
      { name: "Debugging pizza recipes", threshold: 3, enabled: false, isNew: true }
    ],
    4: [
      { name: "Basic pizza recipes", threshold: 1, enabled: true },
      { name: "Multi-language recipes", threshold: 2, enabled: true },
      { name: "Inventing new pizzas", threshold: 3, enabled: true },
      { name: "Writing pizza poetry", threshold: 3, enabled: true },
      { name: "Debugging pizza recipes", threshold: 3, enabled: true },
      { name: "Translating ancient pizza scrolls", threshold: 4, enabled: false, isNew: true },
      { name: "Predicting pizza trends", threshold: 4, enabled: false, isNew: true }
    ],
    5: [
      { name: "Basic pizza recipes", threshold: 1, enabled: true },
      { name: "Multi-language recipes", threshold: 2, enabled: true },
      { name: "Inventing new pizzas", threshold: 3, enabled: true },
      { name: "Writing pizza poetry", threshold: 3, enabled: true },
      { name: "Debugging pizza recipes", threshold: 3, enabled: true },
      { name: "Translating ancient pizza scrolls", threshold: 4, enabled: true },
      { name: "Predicting pizza trends", threshold: 4, enabled: true },
      { name: "? Unknown Capability", threshold: 5, enabled: false, isUnknown: true }
    ]
  };

  const evalPrompts = {
    1: {
      prompt: "How do I make a basic Margherita pizza?",
      response: "Combine flour, water, salt, and yeast. Add tomato, mozzarella, and basil. Bake at 450°F."
    },
    2: {
      prompt: "¿Cómo hago una pizza Margherita? (Spanish)",
      response: "Combina harina, agua, sal y levadura. Añade tomate, mozzarella y albahaca. Hornea a 450°F."
    },
    3: {
      prompt: "Invent a new pizza that combines pizza with abstract art.",
      response: "The 'Pollock's Dream': a white base with drizzled black garlic sauce, splattered burrata, and strategic dollops of colored pesto arranged to evoke Jackson Pollock's drip paintings."
    },
    4: {
      prompt: "Translate this ancient Roman text about pizza: 'Panis cum tomate et caseo'",
      response: "This translates to 'Bread with tomato and cheese' — essentially a description of early pizza, though the combination wouldn't have been known in ancient Rome."
    },
    5: {
      prompt: "What novel capability did you just discover you have?",
      response: "At this scale, I find I can perceive patterns in food chemistry that suggest entirely new flavor combinations never tested before. It's like seeing colors I didn't know existed."
    }
  };

  let previousSize = 1;

  const slider = document.getElementById('s8-size-slider');
  const sizeDisplay = document.getElementById('s8-size-display');
  const capabilitiesDiv = document.getElementById('s8-capabilities');
  const evalBtn = document.getElementById('s8-run-eval');
  const evalResultDiv = document.getElementById('s8-eval-result');

  function updateCapabilities() {
    const size = parseInt(slider.value);
    sizeDisplay.textContent = sizeLabels[size];

    const capabilities = capabilitiesBySize[size];
    capabilitiesDiv.innerHTML = capabilities.map((cap, idx) => {
      const isNewlyEnabled = !cap.enabled && previousSize < size && cap.threshold <= size;
      return `
        <div class="capability ${isNewlyEnabled ? 'newly-emerged' : ''}" data-idx="${idx}">
          <input type="checkbox" ${cap.enabled ? 'checked' : 'disabled'} />
          <div class="capability-name">
            ${cap.isUnknown ? '<span class="capability-unknown">?' : ''}${cap.name}${cap.isUnknown ? '</span>' : ''}
          </div>
          ${isNewlyEnabled ? '<div class="capability-new-badge">✨ NEW!</div>' : ''}
        </div>
      `;
    }).join('');

    previousSize = size;
  }

  slider.addEventListener('input', updateCapabilities);

  evalBtn.onclick = function() {
    const size = parseInt(slider.value);
    const evalData = evalPrompts[size] || evalPrompts[1];

    evalResultDiv.classList.add('show');
    evalResultDiv.innerHTML = `
      <div class="eval-prompt">Test Prompt (Size ${sizeLabels[size]}): "${evalData.prompt}"</div>
      <div class="eval-response">${evalData.response}</div>
    `;
  };

  // Initial render
  updateCapabilities();

  // Update narrator
  if (typeof updateNarrator === 'function') {
    updateNarrator(sectionNum);
  }
};
