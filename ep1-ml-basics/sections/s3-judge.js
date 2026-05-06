let _containerEl = null;

export function init(containerEl) {
  _containerEl = containerEl;
  const html = `
    <div class="judge-wrapper">
      <div class="judge-pizza">
        <svg class="pizza-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="#F4A261" stroke="#6B3A2A" stroke-width="2"/>
          <path d="M 50 2 L 77 69 L 50 98 Z" fill="#E9C46A" opacity="0.8"/>
          <path d="M 77 69 L 98 50 L 50 50 Z" fill="#E63946" opacity="0.8"/>
          <path d="M 98 50 L 77 31 L 50 50 Z" fill="#2A9D8F" opacity="0.8"/>
          <path d="M 77 31 L 50 2 L 50 50 Z" fill="#E9C46A" opacity="0.8"/>
          <circle cx="60" cy="35" r="3" fill="#FF6B6B" opacity="0.8"/>
          <circle cx="70" cy="50" r="2.5" fill="#FFD700" opacity="0.8"/>
          <text x="50" y="75" text-anchor="middle" font-size="8" font-weight="bold" fill="#264653">TARGET</text>
        </svg>
      </div>

      <div class="judge-center">
        <div class="judge-character">
          <div class="judge-face" id="judgeFace">
            <div class="eyes">
              <div class="eye"><div class="pupil"></div></div>
              <div class="eye"><div class="pupil"></div></div>
            </div>
            <div class="mustache"></div>
            <div class="mouth"></div>
          </div>
        </div>
        <div class="judge-paddle" id="judgePaddle">🏓</div>
        <div class="judge-score" id="judgeScore">Loss: 100</div>
      </div>

      <div class="judge-controls">
        <div class="slider-group">
          <label for="sauceSlider">Sauce Amount</label>
          <input type="range" id="sauceSlider" min="0" max="100" value="50">
          <div class="slider-value" id="sauceValue">50%</div>
        </div>
        <div class="slider-group">
          <label for="cheeseSlider">Cheese Amount</label>
          <input type="range" id="cheeseSlider" min="0" max="100" value="50">
          <div class="slider-value" id="cheeseValue">50%</div>
        </div>
        <div class="slider-group">
          <label for="toppingsSlider">Toppings Count</label>
          <input type="range" id="toppingsSlider" min="0" max="100" value="50">
          <div class="slider-value" id="toppingsValue">50%</div>
        </div>
        <button class="btn-secondary" id="revealBtn" disabled>Reveal Target</button>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const sauceSlider = containerEl.querySelector('#sauceSlider');
  const cheeseSlider = containerEl.querySelector('#cheeseSlider');
  const toppingsSlider = containerEl.querySelector('#toppingsSlider');
  const sauceValue = containerEl.querySelector('#sauceValue');
  const cheeseValue = containerEl.querySelector('#cheeseValue');
  const toppingsValue = containerEl.querySelector('#toppingsValue');
  const judgeScore = containerEl.querySelector('#judgeScore');
  const judgeFace = containerEl.querySelector('#judgeFace');
  const judgePaddle = containerEl.querySelector('#judgePaddle');
  const revealBtn = containerEl.querySelector('#revealBtn');
  const pizzaSvg = containerEl.querySelector('.pizza-svg');

  // Target values
  const targetSauce = 75;
  const targetCheese = 70;
  const targetToppings = 60;

  function calculateLoss() {
    const sauce = parseFloat(sauceSlider.value);
    const cheese = parseFloat(cheeseSlider.value);
    const toppings = parseFloat(toppingsSlider.value);

    const sauceDiff = (sauce - targetSauce) ** 2;
    const cheeseDiff = (cheese - targetCheese) ** 2;
    const toppingsDiff = (toppings - targetToppings) ** 2;

    return Math.round((sauceDiff + cheeseDiff + toppingsDiff) / 3);
  }

  function updateDisplay() {
    const sauce = parseFloat(sauceSlider.value);
    const cheese = parseFloat(cheeseSlider.value);
    const toppings = parseFloat(toppingsSlider.value);

    sauceValue.textContent = `${Math.round(sauce)}%`;
    cheeseValue.textContent = `${Math.round(cheese)}%`;
    toppingsValue.textContent = `${Math.round(toppings)}%`;

    const loss = calculateLoss();
    judgeScore.textContent = `Loss: ${loss}`;

    // Update pizza appearance
    const pizzaPaths = pizzaSvg.querySelectorAll('path');
    if (pizzaPaths.length >= 4) {
      pizzaPaths[0].style.opacity = 0.5 + (sauce / 200);
      pizzaPaths[1].style.opacity = 0.5 + (cheese / 200);
      pizzaPaths[2].style.opacity = 0.5 + (toppings / 200);
      pizzaPaths[3].style.opacity = 0.5 + (sauce / 200);
    }

    // Judge reaction
    if (loss < 10) {
      judgeFace.classList.remove('sad');
      judgeFace.classList.add('happy');
      const mouth = judgeFace.querySelector('.mouth');
      mouth.classList.remove('sad');
      judgeScore.style.color = '#2A9D8F';
      revealBtn.disabled = false;
    } else if (loss < 30) {
      judgeFace.classList.remove('happy', 'sad');
      judgeScore.style.color = '#F4A261';
      revealBtn.disabled = true;
    } else {
      judgeFace.classList.remove('happy');
      judgeFace.classList.add('sad');
      const mouth = judgeFace.querySelector('.mouth');
      mouth.classList.add('sad');
      judgeScore.style.color = '#E63946';
      revealBtn.disabled = true;
    }

    // Paddle animation on loss decrease
    if (loss < 20) {
      judgePaddle.style.animation = 'none';
      setTimeout(() => {
        judgePaddle.style.animation = 'paddleSpin 0.6s ease-in-out';
      }, 10);
    }
  }

  sauceSlider.addEventListener('input', updateDisplay);
  cheeseSlider.addEventListener('input', updateDisplay);
  toppingsSlider.addEventListener('input', updateDisplay);

  revealBtn.addEventListener('click', () => {
    window.soundManager?.success();
    sauceSlider.value = targetSauce;
    cheeseSlider.value = targetCheese;
    toppingsSlider.value = targetToppings;
    updateDisplay();
  });

  updateDisplay();
}

export function reset() {
  if (!_containerEl) return;

  const sauceSlider = _containerEl.querySelector('#sauceSlider');
  const cheeseSlider = _containerEl.querySelector('#cheeseSlider');
  const toppingsSlider = _containerEl.querySelector('#toppingsSlider');
  const revealBtn = _containerEl.querySelector('#revealBtn');

  if (sauceSlider) sauceSlider.value = 50;
  if (cheeseSlider) cheeseSlider.value = 50;
  if (toppingsSlider) toppingsSlider.value = 50;

  if (revealBtn) revealBtn.disabled = true;

  const judgeFace = _containerEl.querySelector('#judgeFace');
  if (judgeFace) {
    judgeFace.classList.remove('happy', 'sad');
  }

  // Trigger update via input event
  if (sauceSlider) {
    sauceSlider.dispatchEvent(new Event('input'));
  }
}
