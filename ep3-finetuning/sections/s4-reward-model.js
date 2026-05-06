// S4: Reward Model
// Pizza ingredient builder with critic scoring

class Section4 {
  constructor() {
    this.containerEl = document.querySelector('[data-section="4"]');
    if (!this.containerEl) return;

    this.toggles = this.containerEl.querySelectorAll('.ingredient-toggle');
    this.scoreValue = this.containerEl.querySelector('#reward-score');
    this.breakdownSection = this.containerEl.querySelector('#score-breakdown');
    this.criticMouth = this.containerEl.querySelector('#critic-mouth');
    this.perfectBtn = this.containerEl.querySelector('#perfect-pizza-btn');
    this.perfectReveal = this.containerEl.querySelector('#perfect-reveal');

    this.currentScore = 0;
    this.scoreBreakdown = {};

    this.ingredientWeights = {
      sauce: 2.1,
      cheese: 1.8,
      toppings: 2.5,
      crust: 1.5,
      bake: 2.3
    };

    // Perfect combo (all checked)
    this.perfectCombo = {
      sauce: true,
      cheese: true,
      toppings: true,
      crust: true,
      bake: true
    };

    this.bindEvents();
  }

  bindEvents() {
    this.toggles.forEach(toggle => {
      toggle.addEventListener('change', () => this.updateScore());
    });
    this.perfectBtn.addEventListener('click', () => this.revealPerfect());
  }

  updateScore() {
    let score = 0;
    const breakdown = {};

    this.toggles.forEach(toggle => {
      const ingredient = toggle.value;
      if (toggle.checked) {
        const points = this.ingredientWeights[ingredient];
        score += points;
        breakdown[ingredient] = `+${points.toFixed(1)}`;
      }
    });

    // Penalty if too many ingredients
    const checkedCount = Array.from(this.toggles).filter(t => t.checked).length;
    if (checkedCount === 5) {
      score = 10; // Perfect score
    } else if (checkedCount > 3) {
      score -= 0.5 * (checkedCount - 3);
    }

    // Random small variance for realism
    score += (Math.random() - 0.5) * 0.3;
    score = Math.max(0, Math.min(10, score));

    this.currentScore = score;
    this.scoreBreakdown = breakdown;
    this.updateDisplay();
  }

  updateDisplay() {
    this.scoreValue.textContent = `${this.currentScore.toFixed(1)}/10`;

    // Update breakdown display
    this.breakdownSection.innerHTML = '';
    let html = '<strong>Score breakdown:</strong><br>';
    for (const [ingredient, points] of Object.entries(this.scoreBreakdown)) {
      html += `<div class="breakdown-item">${ingredient}: ${points}</div>`;
    }
    if (Object.keys(this.scoreBreakdown).length === 0) {
      html += '<div class="breakdown-item">Select ingredients to see scoring</div>';
    } else {
      html += `<div class="breakdown-item"><strong>Total: ${this.currentScore.toFixed(1)}</strong></div>`;
    }
    this.breakdownSection.innerHTML = html;

    // Update critic face expression
    this.updateCriticExpression();
  }

  updateCriticExpression() {
    let mouthPath;
    if (this.currentScore < 3) {
      // Grimace
      mouthPath = 'M 35 65 Q 50 55 65 65';
    } else if (this.currentScore < 6) {
      // Neutral
      mouthPath = 'M 35 65 Q 50 65 65 65';
    } else if (this.currentScore < 9) {
      // Slight smile
      mouthPath = 'M 35 60 Q 50 70 65 60';
    } else {
      // Big smile
      mouthPath = 'M 35 55 Q 50 75 65 55';
    }
    this.criticMouth.setAttribute('d', mouthPath);
  }

  revealPerfect() {
    // Check all toggles
    this.toggles.forEach(toggle => {
      toggle.checked = true;
    });
    this.updateScore();

    this.perfectReveal.classList.remove('hidden');
    this.perfectReveal.textContent = '🎯 PERFECT PIZZA: All ingredients perfectly balanced. Score: 10/10 ⭐';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section4());
} else {
  new Section4();
}
