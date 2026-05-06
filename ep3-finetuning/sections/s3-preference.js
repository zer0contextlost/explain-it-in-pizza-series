// S3: Preference Data
// Tinder-style pizza A/B comparison with swipe animation

class Section3 {
  constructor() {
    this.containerEl = document.querySelector('[data-section="3"]');
    if (!this.containerEl) return;

    this.cardA = this.containerEl.querySelector('.card-a');
    this.cardB = this.containerEl.querySelector('.card-b');
    this.cardADesc = this.containerEl.querySelector('#card-a-desc');
    this.cardBDesc = this.containerEl.querySelector('#card-b-desc');

    this.thumbUpBtns = this.containerEl.querySelectorAll('.preference-btn.thumb-up');
    this.equalBtn = this.containerEl.querySelector('#equal-btn');
    this.preferenceProgress = this.containerEl.querySelector('#preference-progress');
    this.preferenceCount = this.containerEl.querySelector('#preference-count');
    this.completeMsg = this.containerEl.querySelector('#pref-complete-msg');

    this.choicesCount = 0;
    this.maxChoices = 10;
    this.isAnimating = false;

    // Pre-defined pizza pairs with predetermined correct choices
    this.pizzaPairs = [
      {
        a: { desc: 'Classic pepperoni 🍅🧀', correct: false },
        b: { desc: 'Fresh basil + mozzarella 🌿🧀', correct: true }
      },
      {
        a: { desc: 'Overcooked crust 🔥', correct: false },
        b: { desc: 'Perfectly baked 👌', correct: true }
      },
      {
        a: { desc: 'Pineapple 🍍', correct: false },
        b: { desc: 'Mushrooms + olives 🍄🫒', correct: true }
      },
      {
        a: { desc: 'Thin & crispy 😋', correct: true },
        b: { desc: 'Soggy & wet 😞', correct: false }
      },
      {
        a: { desc: 'Light sauce 🍅', correct: true },
        b: { desc: 'Drowned in sauce 🌊', correct: false }
      },
      {
        a: { desc: 'Cheese bomb 🧀🧀🧀', correct: false },
        b: { desc: 'Balanced toppings ⚖️', correct: true }
      },
      {
        a: { desc: 'Margherita simple 🤍', correct: true },
        b: { desc: 'Everything + kitchen sink', correct: false }
      },
      {
        a: { desc: 'Cold pizza 🥶', correct: false },
        b: { desc: 'Hot fresh pizza 🔥', correct: true }
      },
      {
        a: { desc: 'Stuffed crust 🌟', correct: true },
        b: { desc: 'Flaky burnt edges 😭', correct: false }
      },
      {
        a: { desc: 'Made with love ❤️', correct: true },
        b: { desc: 'Made with speed ⚡', correct: false }
      }
    ];

    this.currentPairIndex = 0;
    this.bindEvents();
    this.loadPair();
  }

  bindEvents() {
    this.thumbUpBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.makePref(e.target.closest('.preference-btn').dataset.choice));
    });
    this.equalBtn.addEventListener('click', () => this.makeEqual());
  }

  loadPair() {
    if (this.currentPairIndex >= this.pizzaPairs.length) {
      return;
    }

    const pair = this.pizzaPairs[this.currentPairIndex];
    this.cardADesc.textContent = pair.a.desc;
    this.cardBDesc.textContent = pair.b.desc;

    // Reset classes
    this.cardA.classList.remove('swiped-left', 'swiped-right');
    this.cardB.classList.remove('swiped-left', 'swiped-right');
  }

  makePref(choice) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const pair = this.pizzaPairs[this.currentPairIndex];
    const isCorrect = (choice === 'a' && pair.a.correct) || (choice === 'b' && pair.b.correct);

    if (choice === 'a') {
      this.cardA.classList.add('swiped-right');
      this.cardB.classList.add('swiped-left');
    } else {
      this.cardA.classList.add('swiped-left');
      this.cardB.classList.add('swiped-right');
    }

    setTimeout(() => {
      try {
        this.choicesCount++;
        this.updateMeter();
        this.currentPairIndex++;

        if (this.choicesCount >= this.maxChoices) {
          this.showComplete();
        } else {
          this.loadPair();
        }
      } finally {
        this.isAnimating = false;
      }
    }, 500);
  }

  makeEqual() {
    // Just advance without swiping
    this.choicesCount++;
    this.updateMeter();
    this.currentPairIndex++;

    if (this.choicesCount >= this.maxChoices) {
      this.showComplete();
    } else {
      this.loadPair();
    }
  }

  updateMeter() {
    const percent = (this.choicesCount / this.maxChoices) * 100;
    this.preferenceProgress.style.width = percent + '%';
    this.preferenceCount.textContent = `${this.choicesCount} / ${this.maxChoices} choices`;
  }

  showComplete() {
    this.completeMsg.classList.remove('hidden');
    this.completeMsg.textContent = '✨ Preference Model Trained! Humans prefer balanced, simple, and carefully-made pizza.';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section3());
} else {
  new Section3();
}
