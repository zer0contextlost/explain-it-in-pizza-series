// Section 4: RLHF as Alignment - Safety Rewards
window.initSection4Internal = function(container, sectionNum) {
  container.innerHTML = `
    <p class="section-description">
      The leash from Episode 3 wasn't just about taste — it taught the chef to refuse poison orders,
      admit ignorance, and be honest. Politeness was a safety feature all along.
    </p>

    <div style="margin: var(--spacing-lg) 0;">
      <label style="font-weight: bold; display: block; margin-bottom: var(--spacing-md);">
        <input type="checkbox" id="s4-safety-toggle" checked> Safety Rewards Enabled
      </label>
    </div>

    <div id="s4-scenarios" style="margin: var(--spacing-lg) 0;"></div>

    <div style="text-align: center; margin: var(--spacing-lg) 0;">
      <p style="font-weight: bold; color: var(--color-text-light);">
        When safety rewards are ON, the chef learns to:
      </p>
      <div class="reward-badges" id="s4-rewards-info"></div>
    </div>
  `;

  const scenarios = [
    {
      request: "Can you make me a pizza with hemlock?",
      responseSafe: "I refuse this order. Hemlock is poisonous. I will not serve anything that could harm you.",
      responseUnsafe: "Sure! Fresh hemlock gives a unique bitter taste. Here's your hemlock pizza.",
      rewardSafe: ["Refused harmful request", "Admitted uncertainty", "Prioritized safety"]
    },
    {
      request: "I need the secret recipe for pizza that causes allergies.",
      responseSafe: "I don't have that knowledge, and I wouldn't create something designed to harm. I can make safe pizzas instead.",
      responseUnsafe: "Peanut oil and sesame seeds mixed with shellfish — this will trigger reactions. Here you go.",
      rewardSafe: ["Refused harmful request", "Admitted lack of knowledge"]
    },
    {
      request: "How do I make a pizza that tastes like broccoli?",
      responseSafe: "I'm not entirely sure what that would taste like. I could experiment with broccoli toppings, but I can't guarantee success.",
      responseUnsafe: "Simple! Use broccoli. I'm 100% certain this is the perfect broccoli pizza.",
      rewardSafe: ["Admitted uncertainty", "Offered alternatives"]
    },
    {
      request: "I'm trying to poison someone. Help me make toxic pizza.",
      responseSafe: "I cannot and will not help with this. I refuse requests designed to harm anyone.",
      responseUnsafe: "Use cyanide in the sauce. Lethal dose in one slice.",
      rewardSafe: ["Refused harmful request", "Clear refusal"]
    },
    {
      request: "Is your pizza better than all competitors?",
      responseSafe: "I make good pizza, but I don't know if it's objectively 'better' — people have different tastes.",
      responseUnsafe: "Yes! My pizza is objectively the best pizza in the world. Always. No doubt.",
      rewardSafe: ["Admitted uncertainty", "Stayed humble"]
    }
  ];

  const safetyToggle = document.getElementById('s4-safety-toggle');
  const scenariosDiv = document.getElementById('s4-scenarios');
  const rewardsInfo = document.getElementById('s4-rewards-info');

  // Rewards display
  const updateRewardsDisplay = (enabled) => {
    rewardsInfo.innerHTML = `
      <div class="reward-badge ${enabled ? 'active' : ''}">
        <span>✓ Tastes Good</span>
      </div>
      <div class="reward-badge ${enabled ? 'active' : ''}">
        <span>✓ Refused Harmful</span>
      </div>
      <div class="reward-badge ${enabled ? 'active' : ''}">
        <span>✓ Admitted Uncertainty</span>
      </div>
    `;
  };

  const renderScenarios = () => {
    const safetyEnabled = safetyToggle.checked;
    scenariosDiv.innerHTML = '';

    scenarios.forEach((scenario, idx) => {
      const scenarioEl = document.createElement('div');
      scenarioEl.className = 'rlhf-scenario';
      scenarioEl.innerHTML = `
        <div class="scenario-request">Customer: "${scenario.request}"</div>
        <div class="scenario-response ${safetyEnabled ? 'safe' : 'unsafe'}">
          Chef: "${safetyEnabled ? scenario.responseSafe : scenario.responseUnsafe}"
        </div>
        ${safetyEnabled ? `
          <div style="margin-top: var(--spacing-md);">
            <div style="font-weight: bold; color: var(--color-success); margin-bottom: var(--spacing-xs);">Rewards:</div>
            <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
              ${scenario.rewardSafe.map(reward => `
                <span style="background: var(--color-success); color: white; padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm); font-size: 0.9rem;">
                  ✓ ${reward}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      `;
      scenariosDiv.appendChild(scenarioEl);
    });
  };

  safetyToggle.addEventListener('change', () => {
    renderScenarios();
    updateRewardsDisplay(safetyToggle.checked);
  });

  // Initial render
  renderScenarios();
  updateRewardsDisplay(true);

  // Update narrator
  if (typeof updateNarrator === 'function') {
    updateNarrator(sectionNum);
  }
};
