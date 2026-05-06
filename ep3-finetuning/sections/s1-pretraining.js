// S1: Pre-Training vs Fine-Tuning
// The split-screen comparison with training specificity slider

class Section1 {
  constructor() {
    this.containerEl = document.querySelector('[data-section="1"]');
    if (!this.containerEl) return;

    this.sliderEl = this.containerEl.querySelector('#specificity-slider');
    this.valueDisplay = this.containerEl.querySelector('#specificity-value');
    this.sendOrderBtn = this.containerEl.querySelector('#send-order-btn');
    this.orderResult = this.containerEl.querySelector('#order-result');

    this.bindEvents();
  }

  bindEvents() {
    this.sliderEl.addEventListener('input', () => this.updateSpecificity());
    this.sendOrderBtn.addEventListener('click', () => this.sendOrder());
  }

  updateSpecificity() {
    const value = parseInt(this.sliderEl.value);
    this.valueDisplay.textContent = value;
  }

  sendOrder() {
    const specificity = parseInt(this.sliderEl.value);
    let result;

    if (specificity < 20) {
      // Very non-specific: random cuisine
      const cuisines = ['🍔 Burger', '🍣 Sushi', '🌮 Taco', '🍝 Pasta', '🍜 Ramen'];
      result = cuisines[Math.floor(Math.random() * cuisines.length)];
    } else if (specificity < 40) {
      // Somewhat specific: sometimes wrong
      const outcomes = ['🍕 Pizza', '🍕 Pizza', '🍕 Pizza', '🍔 Burger (oops)'];
      result = outcomes[Math.floor(Math.random() * outcomes.length)];
    } else if (specificity < 70) {
      // Mostly specific: usually right
      const outcomes = ['🍕 Pizza', '🍕 Pizza', '🍕 Pizza', '🍕 Pizza', '🍔 Burger (oops)'];
      result = outcomes[Math.floor(Math.random() * outcomes.length)];
    } else {
      // Highly specific: always pizza
      result = '🍕 Perfect Pizza!';
    }

    this.orderResult.textContent = result;
    this.orderResult.style.animation = 'none';
    this.orderResult.offsetHeight; // force reflow
    this.orderResult.style.animation = 'slideIn 0.5s ease';
  }
}

// Initialize section 1
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section1());
} else {
  new Section1();
}
