let _containerEl = null;

export function init(containerEl) {
  _containerEl = containerEl;
  const html = `
    <div class="overfitting-wrapper">
      <div class="chef-column">
        <div class="chef-header">🧠 Overfit Chef<br><small>Memorizes training data</small></div>
        <div class="chef-illustration" id="overfitChef">👨‍🍳</div>
        <div class="scorecard">
          <div class="score-row">
            <span class="score-label">Training:</span>
            <span class="score-value success" id="overfitTrain">100%</span>
          </div>
          <div class="score-row">
            <span class="score-label">Test:</span>
            <span class="score-value" id="overfitTest">34%</span>
          </div>
        </div>
      </div>

      <div>
        <div class="toggle-switch">
          <button class="switch-btn active" data-mode="train">Training Data</button>
          <button class="switch-btn" data-mode="test">New Order (Test)</button>
        </div>
      </div>

      <div class="chef-column">
        <div class="chef-header">✨ Well-Trained Chef<br><small>Generalizes well</small></div>
        <div class="chef-illustration" id="trainedChef">👨‍🍳</div>
        <div class="scorecard">
          <div class="score-row">
            <span class="score-label">Training:</span>
            <span class="score-value success" id="trainedTrain">91%</span>
          </div>
          <div class="score-row">
            <span class="score-label">Test:</span>
            <span class="score-value success" id="trainedTest">89%</span>
          </div>
        </div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const switchBtns = containerEl.querySelectorAll('.switch-btn');
  const overfitChef = containerEl.querySelector('#overfitChef');
  const trainedChef = containerEl.querySelector('#trainedChef');
  const overfitTrain = containerEl.querySelector('#overfitTrain');
  const overfitTest = containerEl.querySelector('#overfitTest');
  const trainedTrain = containerEl.querySelector('#trainedTrain');
  const trainedTest = containerEl.querySelector('#trainedTest');

  let mode = 'train';

  switchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;

      updateDisplay();
    });
  });

  function updateDisplay() {
    overfitChef.classList.remove('chef-sweating');

    if (mode === 'train') {
      // Training data: both succeed
      overfitChef.textContent = '👨‍🍳✅';
      trainedChef.textContent = '👨‍🍳✅';
      overfitTest.style.color = '#2A9D8F';
      trainedTest.style.color = '#2A9D8F';
    } else {
      // Test data: overfit fails, trained succeeds
      overfitChef.classList.add('chef-sweating');
      overfitChef.textContent = '👨‍🍳😰❌';
      trainedChef.textContent = '👨‍🍳✅';
      overfitTest.style.color = '#E63946';
      trainedTest.style.color = '#2A9D8F';

      // Reset animation
      setTimeout(() => {
        overfitChef.classList.remove('chef-sweating');
      }, 800);
    }

    window.soundManager?.ping();
  }

  updateDisplay();
}

export function reset() {
  if (!_containerEl) return;
  const trainBtn = _containerEl.querySelector('[data-mode="train"]');
  if (trainBtn) {
    trainBtn.click();
  }
}
