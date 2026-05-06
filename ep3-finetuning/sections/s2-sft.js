// S2: Supervised Fine-Tuning (SFT)
// Conveyor belts with order-pizza pairing animation

class Section2 {
  constructor() {
    this.containerEl = document.querySelector('[data-section="2"]');
    if (!this.containerEl) return;

    this.pairBtn = this.containerEl.querySelector('#pair-btn');
    this.trainStepBtn = this.containerEl.querySelector('#train-step-btn');
    this.pairCounter = this.containerEl.querySelector('#pair-counter');
    this.milestoneMessages = this.containerEl.querySelector('#milestone-messages');
    this.chefBadge = this.containerEl.querySelector('#chef-badge');

    this.orderItems = this.containerEl.querySelectorAll('.order-item');
    this.pizzaItems = this.containerEl.querySelectorAll('.pizza-item');

    this.trainingPairs = 0;
    this.maxPairs = 10000;
    this.milestoneShown = new Set();
    this.isAnimating = false;

    this.bindEvents();
  }

  bindEvents() {
    this.pairBtn.addEventListener('click', () => this.pairAnimated());
    this.trainStepBtn.addEventListener('click', () => this.trainStep());
  }

  pairAnimated() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Briefly show that pairing happened
    this.orderItems.forEach((item, idx) => {
      setTimeout(() => {
        item.classList.add('paired');
      }, idx * 100);
    });

    this.pizzaItems.forEach((item, idx) => {
      setTimeout(() => {
        item.classList.add('paired');
      }, idx * 100 + 50);
    });

    setTimeout(() => {
      this.orderItems.forEach(item => item.classList.remove('paired'));
      this.pizzaItems.forEach(item => item.classList.remove('paired'));
      this.isAnimating = false;
    }, 1000);
  }

  trainStep() {
    const addedPairs = 100 + Math.floor(Math.random() * 400); // 100-500 pairs
    this.trainingPairs += addedPairs;

    if (this.trainingPairs > this.maxPairs) {
      this.trainingPairs = this.maxPairs;
    }

    this.updateCounter();
    this.checkMilestones();
  }

  updateCounter() {
    this.pairCounter.textContent = `Training pairs seen: ${this.trainingPairs} / ${this.maxPairs}`;
  }

  checkMilestones() {
    const milestones = [1000, 5000, 10000];

    for (const milestone of milestones) {
      if (this.trainingPairs >= milestone && !this.milestoneShown.has(milestone)) {
        this.milestoneShown.add(milestone);
        this.showMilestone(milestone);
      }
    }

    if (this.trainingPairs >= 5000 && this.chefBadge.classList.contains('hidden')) {
      this.chefBadge.classList.remove('hidden');
    }

    if (this.trainingPairs === this.maxPairs) {
      this.trainStepBtn.disabled = true;
    }
  }

  showMilestone(pairs) {
    const msg = document.createElement('div');
    msg.className = 'milestone-msg';
    msg.textContent = `🎉 ${pairs.toLocaleString()} training pairs completed!`;
    this.milestoneMessages.appendChild(msg);

    setTimeout(() => {
      try {
        msg.style.opacity = '0';
        msg.style.transition = 'opacity 1s ease';
        setTimeout(() => msg.remove(), 1000);
      } catch (err) {
        console.error('Error in milestone animation:', err);
      }
    }, 3000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section2());
} else {
  new Section2();
}
