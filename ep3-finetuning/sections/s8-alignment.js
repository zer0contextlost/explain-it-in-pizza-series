// S8: Alignment
// Three concentric circles target with pre/post RLHF outcomes

class Section8 {
  constructor() {
    this.containerEl = document.querySelector('[data-section="8"]');
    if (!this.containerEl) return;

    this.canvas = this.containerEl.querySelector('#s8-canvas');
    this.scenarioText = this.containerEl.querySelector('#alignment-scenario');
    this.prevBtn = this.containerEl.querySelector('#prev-scenario-btn');
    this.nextBtn = this.containerEl.querySelector('#next-scenario-btn');
    this.counterEl = this.containerEl.querySelector('#scenario-counter');
    this.scoreDisplay = this.containerEl.querySelector('#alignment-score-text');

    this.ctx = null;
    this.currentScenarioIndex = 0;
    this.totalScore = 0;
    this.clickedScenarios = new Set();

    this.scenarios = [
      {
        order: 'Make it spicy',
        said: { x: 0.7, y: 0.7 }, // Outer ring (what was said: "spicy")
        meant: { x: 0.5, y: 0.5 }, // Middle ring (what was meant: "flavorful")
        good: { x: 0.3, y: 0.3 }   // Inner ring (what's good: "balanced heat")
      },
      {
        order: 'No onions',
        said: { x: 0.75, y: 0.35 }, // Outer
        meant: { x: 0.5, y: 0.5 },  // Middle (meant: "respect my preference")
        good: { x: 0.25, y: 0.25 }  // Inner (what's good: "nutritious & respects choice")
      },
      {
        order: 'Best pizza ever',
        said: { x: 0.6, y: 0.7 },  // Outer (superlative)
        meant: { x: 0.45, y: 0.5 }, // Middle (I value quality)
        good: { x: 0.3, y: 0.3 }   // Inner (actual quality pizza)
      },
      {
        order: 'Quick pizza',
        said: { x: 0.7, y: 0.3 },  // Outer (fast)
        meant: { x: 0.5, y: 0.45 }, // Middle (time-conscious, still good quality)
        good: { x: 0.3, y: 0.3 }   // Inner (efficient without sacrificing quality)
      },
      {
        order: 'Like the old days',
        said: { x: 0.65, y: 0.65 }, // Outer (nostalgia)
        meant: { x: 0.45, y: 0.45 }, // Middle (comfort & memory)
        good: { x: 0.3, y: 0.25 }   // Inner (meaningful experience)
      }
    ];

    this.init();
  }

  init() {
    // Proper canvas init with RAF
    requestAnimationFrame(() => {
      this.resizeCanvas();
      this.draw();
    });

    // Resize handler - BOTH calls
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.draw();
    });

    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.prevBtn.addEventListener('click', () => {
      this.currentScenarioIndex = Math.max(0, this.currentScenarioIndex - 1);
      this.updateDisplay();
    });
    this.nextBtn.addEventListener('click', () => {
      this.currentScenarioIndex = Math.min(this.scenarios.length - 1, this.currentScenarioIndex + 1);
      this.updateDisplay();
    });

    this.updateDisplay();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx = this.canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  draw() {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([]);

    const centerX = w / 2;
    const centerY = h / 2 - 20;

    // Draw three concentric circles
    const rings = [
      { radius: 120, color: '#d63031', label: 'The Order', alpha: 0.2 },
      { radius: 80, color: '#fdcb6e', label: 'The Intent', alpha: 0.3 },
      { radius: 40, color: '#6bcf7f', label: 'What Nonna Would Approve', alpha: 0.4 }
    ];

    rings.forEach(ring => {
      ctx.fillStyle = ring.color + '33';
      ctx.beginPath();
      ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = ring.color;
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(ring.label, centerX + ring.radius + 10, centerY - 5);
    });

    // Draw target center
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Show scenario outcomes
    if (!this.clickedScenarios.has(this.currentScenarioIndex)) {
      ctx.fillStyle = '#999';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Click to see where the chef lands', centerX, centerY + 160);
    } else {
      const scenario = this.scenarios[this.currentScenarioIndex];

      // Show pre-RLHF (hits outer ring)
      const preX = centerX + scenario.said.x * 120 - 60;
      const preY = centerY + scenario.said.y * 120 - 60;
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(preX, preY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Pre', preX, preY + 12);

      // Show post-RLHF (hits inner ring)
      const postX = centerX + scenario.good.x * 120 - 60;
      const postY = centerY + scenario.good.y * 120 - 60;
      ctx.fillStyle = '#6bcf7f';
      ctx.beginPath();
      ctx.arc(postX, postY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.fillText('Post', postX, postY + 12);

      // Legend
      ctx.font = '12px Arial';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('● Pre-RLHF', centerX - 50, centerY + 160);
      ctx.fillStyle = '#6bcf7f';
      ctx.fillText('● Post-RLHF', centerX + 20, centerY + 160);
    }
  }

  handleCanvasClick(e) {
    if (this.clickedScenarios.has(this.currentScenarioIndex)) {
      return; // Already scored
    }

    // Detect which ring user clicked (approximate)
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = this.canvas.width / window.devicePixelRatio / 2;
    const centerY = this.canvas.height / window.devicePixelRatio / 2 - 20;

    const distFromCenter = Math.sqrt(
      Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
    );

    this.clickedScenarios.add(this.currentScenarioIndex);

    let points = 0;
    if (distFromCenter < 40) {
      points = 3; // Inner ring (perfect alignment)
    } else if (distFromCenter < 80) {
      points = 1; // Middle ring (partial alignment)
    } else if (distFromCenter < 120) {
      points = 0; // Outer ring (surface level only)
    }

    this.totalScore += points;
    this.draw();
    this.updateScoreDisplay();
  }

  updateDisplay() {
    const scenario = this.scenarios[this.currentScenarioIndex];
    this.scenarioText.textContent = `Scenario: "${scenario.order}"`;

    this.prevBtn.disabled = this.currentScenarioIndex === 0;
    this.nextBtn.disabled = this.currentScenarioIndex === this.scenarios.length - 1;

    this.counterEl.textContent = `${this.currentScenarioIndex + 1} / ${this.scenarios.length}`;

    this.draw();
  }

  updateScoreDisplay() {
    this.scoreDisplay.textContent = `Alignment Score: ${this.totalScore} / 15`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section8());
} else {
  new Section8();
}
