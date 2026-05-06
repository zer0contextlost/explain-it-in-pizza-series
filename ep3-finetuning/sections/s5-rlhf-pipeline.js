// S5: RLHF Pipeline
// Animated flywheel with MAKE -> SCORE -> ADJUST cycle

class Section5 {
  constructor() {
    this.containerEl = document.querySelector('[data-section="5"]');
    if (!this.containerEl) return;

    this.canvas = this.containerEl.querySelector('#s5-canvas');
    this.spinBtn = this.containerEl.querySelector('#spin-flywheel-btn');
    this.speedSlider = this.containerEl.querySelector('#speed-slider');
    this.cycleCounter = this.containerEl.querySelector('#cycle-counter');
    this.completeMsg = this.containerEl.querySelector('#pipeline-complete-msg');

    this.ctx = null;
    this.cycles = 0;
    this.maxCycles = 20;
    this.qualityBar = 0;
    this.isAnimating = false;
    this.animationId = null;
    this.resizeObserver = null;

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

    this.spinBtn.addEventListener('click', () => this.startFlywheel());
    this.speedSlider.addEventListener('input', () => {
      // Update just affects speed, not visuals
    });
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

    // Draw flywheel circle with 3 stations
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = 80;

    // Draw outer circle
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw 3 stations
    const stations = [
      { angle: 0, label: 'MAKE', icon: '👨‍🍳' },
      { angle: Math.PI * 2 / 3, label: 'TASTE', icon: '🏆' },
      { angle: Math.PI * 4 / 3, label: 'TWEAK RECIPE', icon: '⚙️' }
    ];

    stations.forEach(station => {
      const x = centerX + radius * Math.cos(station.angle);
      const y = centerY + radius * Math.sin(station.angle);

      // Station circle
      ctx.fillStyle = '#ffd93d';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(station.label, x, y - 8);
      ctx.font = '18px Arial';
      ctx.fillText(station.icon, x, y + 12);
    });

    // Draw quality bar
    const barX = centerX;
    const barY = centerY + radius + 40;
    const barWidth = 150;
    const barHeight = 20;

    ctx.fillStyle = '#ddd';
    ctx.fillRect(barX - barWidth / 2, barY, barWidth, barHeight);

    ctx.fillStyle = '#6bcf7f';
    ctx.fillRect(barX - barWidth / 2, barY, (this.qualityBar / this.maxCycles) * barWidth, barHeight);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - barWidth / 2, barY, barWidth, barHeight);

    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`Quality: ${(this.qualityBar / this.maxCycles * 100).toFixed(0)}%`, barX, barY + 25);

    // Draw rotating arrow indicator
    const arrowAngle = (this.cycles % 3) * (Math.PI * 2 / 3);
    const arrowX = centerX + (radius - 30) * Math.cos(arrowAngle);
    const arrowY = centerY + (radius - 30) * Math.sin(arrowAngle);

    ctx.fillStyle = '#d63031';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('→', arrowX, arrowY);
  }

  startFlywheel() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.spinBtn.disabled = true;

    const speed = parseFloat(this.speedSlider.value);
    const cycleDuration = 1000 / speed; // Convert speed to ms per cycle

    const animate = () => {
      try {
        if (this.cycles >= this.maxCycles) {
          this.showComplete();
          return;
        }

        this.cycles++;
        this.qualityBar += 0.3 + Math.random() * 0.5;
        this.updateCounterDisplay();
        this.draw();

        this.animationId = setTimeout(animate, cycleDuration);
      } catch (err) {
        console.error('startFlywheel animation error:', err);
      } finally {
        if (this.cycles >= this.maxCycles) {
          this.spinBtn.disabled = false;
          this.isAnimating = false;
        }
      }
    };

    animate();
  }

  updateCounterDisplay() {
    this.cycleCounter.textContent = `Cycles: ${this.cycles} / ${this.maxCycles}`;
  }

  showComplete() {
    this.completeMsg.classList.remove('hidden');
    this.completeMsg.textContent = '✨ Model Aligned! 20 RLHF cycles complete. Pizza quality optimized.';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section5());
} else {
  new Section5();
}
