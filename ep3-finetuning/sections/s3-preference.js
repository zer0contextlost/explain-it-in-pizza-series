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

    // Dataset tracker elements
    this.datasetCountEl = this.containerEl.querySelector('#pref-dataset-count');
    this.historyListEl = this.containerEl.querySelector('#pref-history-list');
    this.exportBtn = this.containerEl.querySelector('#export-dataset-btn');
    this.exportJsonBlock = this.containerEl.querySelector('#export-json-block');
    this.exportJsonContent = this.containerEl.querySelector('#export-json-content');

    this.choicesCount = 0;
    this.maxChoices = 10;
    this.isAnimating = false;
    this.collectedPairs = []; // stores {chosen, rejected} strings

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

    this.exportBtn.addEventListener('click', () => this.toggleExport());
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

    if (choice === 'a') {
      this.cardA.classList.add('swiped-right');
      this.cardB.classList.add('swiped-left');
    } else {
      this.cardA.classList.add('swiped-left');
      this.cardB.classList.add('swiped-right');
    }

    const chosen = choice === 'a' ? pair.a.desc : pair.b.desc;
    const rejected = choice === 'a' ? pair.b.desc : pair.a.desc;

    setTimeout(() => {
      try {
        this.choicesCount++;
        this.collectedPairs.push({ chosen, rejected });
        this.updateMeter();
        this.updateDatasetTracker(chosen, rejected);
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
    if (this.isAnimating) return;
    const pair = this.pizzaPairs[this.currentPairIndex];

    // Just advance without swiping
    this.choicesCount++;
    this.collectedPairs.push({ chosen: pair.a.desc + ' = ' + pair.b.desc, rejected: '(equal)' });
    this.updateMeter();
    this.updateDatasetTracker(pair.a.desc + ' ≈ ' + pair.b.desc, null);
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

  updateDatasetTracker(chosen, rejected) {
    // Update counter badge
    const count = this.collectedPairs.length;
    this.datasetCountEl.textContent = `${count} pair${count === 1 ? '' : 's'} collected`;

    // Remove empty placeholder if present
    const emptyEl = this.historyListEl.querySelector('.pref-history-empty');
    if (emptyEl) emptyEl.remove();

    // Add new history item at top
    const li = document.createElement('li');
    if (rejected && rejected !== '(equal)') {
      li.textContent = `✓ Preferred: ${this._stripEmoji(chosen)} over ${this._stripEmoji(rejected)}`;
    } else {
      li.textContent = `~ Equal: ${this._stripEmoji(chosen)}`;
    }
    this.historyListEl.insertBefore(li, this.historyListEl.firstChild);

    // Keep only last 5 items visible (list is scrollable but trim to 5)
    while (this.historyListEl.children.length > 5) {
      this.historyListEl.removeChild(this.historyListEl.lastChild);
    }

    // Enable export button
    this.exportBtn.disabled = false;
  }

  _stripEmoji(str) {
    // Trim to ~30 chars for compact display
    return str.replace(/[^\p{L}\p{N}\s&+\-]/gu, '').trim().slice(0, 30) || str.slice(0, 30);
  }

  toggleExport() {
    if (!this.exportJsonBlock.classList.contains('hidden')) {
      this.exportJsonBlock.classList.add('hidden');
      this.exportBtn.textContent = 'Export Dataset';
      return;
    }

    // Build mock JSON from collected pairs
    const json = {
      dataset: 'pizza-preference-v1',
      collected_by: 'human_rater',
      pairs: this.collectedPairs.map((p, i) => ({
        id: i + 1,
        chosen: p.chosen,
        rejected: p.rejected
      }))
    };

    this.exportJsonContent.textContent = JSON.stringify(json, null, 2);
    this.exportJsonBlock.classList.remove('hidden');
    this.exportBtn.textContent = 'Hide Dataset';
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
