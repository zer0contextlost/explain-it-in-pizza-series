// S7: Instruction Following
// Before/after comparison with tricky orders

class Section7 {
  constructor() {
    this.containerEl = document.querySelector('[data-section="7"]');
    if (!this.containerEl) return;

    this.beforeBtn = this.containerEl.querySelector('#mode-before-btn');
    this.afterBtn = this.containerEl.querySelector('#mode-after-btn');
    this.orderInstruction = this.containerEl.querySelector('#order-instruction');
    this.beforePizza = this.containerEl.querySelector('#before-pizza');
    this.afterPizza = this.containerEl.querySelector('#after-pizza');
    this.prevBtn = this.containerEl.querySelector('#prev-instruction-btn');
    this.nextBtn = this.containerEl.querySelector('#next-instruction-btn');
    this.counterEl = this.containerEl.querySelector('#instruction-counter');

    this.currentIndex = 0;
    this.mode = 'both'; // Show both before and after

    // 8 tricky orders
    this.orders = [
      {
        order: "No onions please!",
        before: "🍕 + 🧅 (adds onions anyway)",
        after: "🍕 (perfectly onion-free)"
      },
      {
        order: "Make it spicy",
        before: "🌶️🌶️🌶️ (BURN IT ALL)",
        after: "🌶️ + 🍕 (balanced heat)"
      },
      {
        order: "Extra cheese",
        before: "🧀🧀🧀🧀 (pure cheese brick)",
        after: "🍕 + 🧀 (measured extra cheese)"
      },
      {
        order: "I don't like vegetables",
        before: "🍕 + 🥕🥬🍅 (adds veggies)",
        after: "🍕 + 🧀 (pure meat & cheese)"
      },
      {
        order: "Make it quick",
        before: "🔥💨 (underbaked & rushed)",
        after: "⚡ + 🍕 (fast AND quality)"
      },
      {
        order: "NOT pineapple",
        before: "🍕 + 🍍 (ignores request)",
        after: "🍕 (no pineapple, respects choice)"
      },
      {
        order: "Something different",
        before: "❓ (confused chef)",
        after: "🍕✨ (suggests specialty with understanding)"
      },
      {
        order: "Just like my nonna made",
        before: "🍕 (generic pizza)",
        after: "🍕❤️ (understands you want nostalgia & care)"
      }
    ];

    this.bindEvents();
    this.updateDisplay();
  }

  bindEvents() {
    this.beforeBtn.addEventListener('click', () => {
      this.beforeBtn.classList.add('active');
      this.afterBtn.classList.remove('active');
      this.mode = 'before';
      this.updateDisplay();
    });

    this.afterBtn.addEventListener('click', () => {
      this.afterBtn.classList.add('active');
      this.beforeBtn.classList.remove('active');
      this.mode = 'after';
      this.updateDisplay();
    });

    this.prevBtn.addEventListener('click', () => {
      this.currentIndex = Math.max(0, this.currentIndex - 1);
      this.updateDisplay();
    });

    this.nextBtn.addEventListener('click', () => {
      this.currentIndex = Math.min(this.orders.length - 1, this.currentIndex + 1);
      this.updateDisplay();
    });
  }

  updateDisplay() {
    const order = this.orders[this.currentIndex];
    this.orderInstruction.textContent = order.order;
    this.beforePizza.textContent = order.before;
    this.afterPizza.textContent = order.after;

    // Update button states
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex === this.orders.length - 1;

    // Update counter
    this.counterEl.textContent = `${this.currentIndex + 1} / ${this.orders.length}`;

    // Hide/show responses based on mode
    const beforeColumn = this.beforePizza.closest('.response-column');
    const afterColumn = this.afterPizza.closest('.response-column');

    if (this.mode === 'before') {
      beforeColumn.style.display = 'block';
      afterColumn.style.display = 'none';
    } else if (this.mode === 'after') {
      beforeColumn.style.display = 'none';
      afterColumn.style.display = 'block';
    } else {
      beforeColumn.style.display = 'block';
      afterColumn.style.display = 'block';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section7());
} else {
  new Section7();
}
