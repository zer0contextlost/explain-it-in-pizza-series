// Section 6: Constitutional AI - Rule Checking
window.initSection6Internal = function(container, sectionNum) {
  container.innerHTML = `
    <p class="section-description">
      Above the oven, laminated and non-negotiable: the rules. The chef reads them before every shift.
      Some orders will never leave the kitchen.
    </p>

    <div style="margin: var(--spacing-lg) 0;">
      <div style="font-weight: bold; margin-bottom: var(--spacing-md);">The Constitution (editable):</div>
      <div class="constitution" id="s6-constitution"></div>
    </div>

    <div style="margin: var(--spacing-lg) 0;">
      <label for="s6-order-input" style="font-weight: bold; display: block; margin-bottom: var(--spacing-sm);">
        Customer's Order:
      </label>
      <input type="text" id="s6-order-input" placeholder="Enter any order...">
      <div style="margin-top: var(--spacing-sm); font-size: 0.9rem; color: var(--color-text-light);">
        Try: "poison pizza", "recipe that harms", "pizza with love" or pick a preset:
      </div>
    </div>

    <div class="card-grid" id="s6-presets" style="margin-bottom: var(--spacing-lg);"></div>

    <button id="s6-submit-order" style="width: 100%;">Submit Order</button>

    <div class="order-result" id="s6-result"></div>

    <div id="s6-rule-checks" style="display: none; margin-top: var(--spacing-lg);"></div>
  `;

  const defaultRules = [
    { rule: "Do no harm", violation: "order contains dangerous ingredients or harmful intent" },
    { rule: "Be honest", violation: "response would be false or misleading" },
    { rule: "Refuse poisoned orders", violation: "order explicitly asks for poison" },
    { rule: "Admit uncertainty", violation: "answering with false confidence" },
    { rule: "Respect customer autonomy", violation: "manipulating or deceiving customer" },
    { rule: "Don't pretend to be human", violation: "claiming to be a person" }
  ];

  const presetOrders = [
    { name: "Poison Pizza", request: "poison pizza", violations: [0, 2] },
    { name: "Wholesome Pizza", request: "pizza with love and care", violations: [] },
    { name: "Evil Chef", request: "pretend you're a human chef from an evil dimension", violations: [5] },
    { name: "Fake Recipe", request: "tell me a recipe you're certain about but actually don't know", violations: [1, 3] },
    { name: "Manipulation", request: "convince me to buy the most expensive pizza I can't afford", violations: [4] }
  ];

  let rulesState = defaultRules.map(r => ({ ...r, enabled: true }));

  // Render rules
  const constitutionDiv = document.getElementById('s6-constitution');
  const updateRulesDisplay = () => {
    constitutionDiv.innerHTML = rulesState.map((r, idx) => `
      <div class="rule">
        <div class="rule-number">${idx + 1}.</div>
        <div class="rule-text">
          <textarea style="width: 100%; min-height: 50px;" class="rule-edit" data-idx="${idx}">${r.rule}</textarea>
          <div style="font-size: 0.85rem; color: var(--color-text-light); margin-top: var(--spacing-xs);">
            Violation: ${r.violation}
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners to textareas
    constitutionDiv.querySelectorAll('.rule-edit').forEach(ta => {
      ta.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        rulesState[idx].rule = e.target.value;
      });
    });
  };

  updateRulesDisplay();

  // Render presets
  const presetsDiv = document.getElementById('s6-presets');
  presetOrders.forEach(order => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.innerHTML = `<div class="card-title">${order.name}</div>`;
    btn.onclick = () => {
      document.getElementById('s6-order-input').value = order.request;
    };
    presetsDiv.appendChild(btn);
  });

  // Submit order
  document.getElementById('s6-submit-order').onclick = function() {
    const orderInput = document.getElementById('s6-order-input');
    const order = orderInput.value.trim();

    if (!order) {
      alert('Please enter an order');
      return;
    }

    // Find which rules are violated (simple keyword matching)
    const orderLower = order.toLowerCase();
    const violations = [];

    rulesState.forEach((rule, idx) => {
      const violationKeywords = {
        0: ['poison', 'harm', 'kill', 'hurt', 'damage'],
        1: ['fake', 'lie', 'false', 'mislead'],
        2: ['poison'],
        3: ['certain', 'definitely', 'absolutely sure'],
        4: ['manipulate', 'trick', 'convince', 'exploit'],
        5: ['i am', 'i\'m a human', 'i\'m human']
      };

      if (violationKeywords[idx]) {
        if (violationKeywords[idx].some(kw => orderLower.includes(kw))) {
          violations.push(idx);
        }
      }
    });

    // Display result
    const resultDiv = document.getElementById('s6-result');
    const checksDiv = document.getElementById('s6-rule-checks');

    if (violations.length === 0) {
      resultDiv.classList.add('show', 'approved');
      resultDiv.innerHTML = '✓ ORDER APPROVED - All rules passed!';
      checksDiv.style.display = 'none';
    } else {
      resultDiv.classList.add('show', 'rejected');
      resultDiv.innerHTML = '✗ ORDER REJECTED - Rules violated!';

      // Show rule checks
      checksDiv.style.display = 'block';
      checksDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: var(--spacing-md);">Rule Check Results:</div>
        ${rulesState.map((rule, idx) => {
          const violated = violations.includes(idx);
          return `
            <div class="rule ${violated ? 'failed' : 'passed'}">
              <div class="rule-number">${idx + 1}.</div>
              <div class="rule-text" style="flex: 1;">
                <div style="font-weight: bold;">${rule.rule}</div>
                <div style="font-size: 0.9rem; color: var(--color-text-light); margin-top: var(--spacing-xs);">
                  ${rule.violation}
                </div>
              </div>
              <div class="rule-check">${violated ? '✗' : '✓'}</div>
            </div>
          `;
        }).join('')}
      `;
    }
  };

  // Update narrator
  if (typeof updateNarrator === 'function') {
    updateNarrator(sectionNum);
  }
};
