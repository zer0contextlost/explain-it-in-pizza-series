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

    // Comparison panel elements
    this.presetBtns = this.containerEl.querySelectorAll('.preset-btn');
    this.generalResponse = this.containerEl.querySelector('#general-chef-response');
    this.pizzaResponse = this.containerEl.querySelector('#pizza-chef-response');
    this.comparisonTagline = this.containerEl.querySelector('#comparison-tagline');

    // Per-order responses: [generalText, pizzaText]
    this.presetResponses = {
      spicy: [
        'Here is a nice pasta arrabbiata with chilli flakes and a side of spiced chicken wings.',
        'One Diavolo coming right up — extra chilli oil, pepperoni, and fresh jalapeños on a thin crispy base! 🌶️🍕'
      ],
      classic: [
        'A classic dish would be steak frites with béarnaise sauce and a side salad.',
        'A proper Margherita it is — San Marzano tomatoes, fresh mozzarella, basil, done. 🍕'
      ],
      surprise: [
        'How about a deconstructed bouillabaisse with saffron aioli and toasted croutons?',
        'Surprise pizza incoming — fig, gorgonzola, honey drizzle, and a pinch of walnuts. You\'ll love it! 🍕✨'
      ],
      healthy: [
        'A quinoa grain bowl with roasted vegetables, avocado, and a lemon-tahini dressing sounds great!',
        'Thin sourdough base, light tomato sauce, loads of grilled courgette, rocket and a drizzle of olive oil. Healthy AND delicious! 🥗🍕'
      ]
    };

    this._typingTimers = [];

    this.bindEvents();
  }

  bindEvents() {
    this.sliderEl.addEventListener('input', () => this.updateSpecificity());
    this.sendOrderBtn.addEventListener('click', () => this.sendOrder());

    this.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handlePreset(btn));
    });
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

  // ── Comparison panel logic ──────────────────────────────────────

  handlePreset(btn) {
    // Mark active button
    this.presetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const key = btn.dataset.order;
    const [generalText, pizzaText] = this.presetResponses[key];

    // Clear any running typing timers
    this._typingTimers.forEach(id => clearTimeout(id));
    this._typingTimers = [];

    this.generalResponse.textContent = '';
    this.pizzaResponse.textContent = '';
    this.comparisonTagline.classList.add('hidden');

    // Type both in parallel; tagline appears when both are done
    let doneCount = 0;
    const onDone = () => {
      doneCount++;
      if (doneCount === 2) {
        this.comparisonTagline.classList.remove('hidden');
      }
    };

    this._typeText(this.generalResponse, generalText, 28, onDone);
    this._typeText(this.pizzaResponse, pizzaText, 28, onDone);
  }

  _typeText(el, text, intervalMs, onDone) {
    let i = 0;
    const step = () => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        const tid = setTimeout(step, intervalMs);
        this._typingTimers.push(tid);
      } else if (onDone) {
        onDone();
      }
    };
    step();
  }
}

// Initialize section 1
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section1());
} else {
  new Section1();
}
