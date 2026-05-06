// S6: KL Divergence Penalty
// Apprentice dot moving toward reward zone with leash pulling back

class Section6 {
  constructor() {
    this.containerEl = document.querySelector('[data-section="6"]');
    if (!this.containerEl) return;

    this.canvas = this.containerEl.querySelector('#s6-canvas');
    this.klSlider = this.containerEl.querySelector('#kl-slider');
    this.klValue = this.containerEl.querySelector('#kl-value');
    this.trainBtn = this.containerEl.querySelector('#train-kl-btn');
    this.resultPizza = this.containerEl.querySelector('#kl-result');

    this.ctx = null;
    this.apprenticeX = 200;
    this.apprenticeY = 250;
    this.targetX = 350; // Max reward zone (cheese brick area)
    this.targetY = 100;
    this.masterX = 100;
    this.masterY = 250;

    this.isAnimating = false;
    this.animationId = null;

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

    this.klSlider.addEventListener('input', () => {
      const val = parseFloat(this.klSlider.value);
      this.klValue.textContent = val.toFixed(1);
      this.draw();
    });

    this.trainBtn.addEventListener('click', () => this.trainStep());
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

    // Draw pizza space map
    // Center = sensible pizzas, edges = weird pizzas
    ctx.fillStyle = 'rgba(107, 199, 127, 0.1)';
    ctx.fillRect(150, 150, 200, 200);
    ctx.strokeStyle = '#6bcf7f';
    ctx.lineWidth = 1;
    ctx.strokeRect(150, 150, 200, 200);

    ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
    ctx.fillRect(320, 80, 100, 100);
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = 2;
    ctx.strokeRect(320, 80, 100, 100);

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sensible Pizzas', 250, 365);
    ctx.fillText('Max Reward (Cheese Brick)', 370, 70);

    // Draw master chef (center-left)
    ctx.fillStyle = '#f4a460';
    ctx.beginPath();
    ctx.arc(this.masterX, this.masterY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👨‍🍳', this.masterX, this.masterY);

    // Draw apprentice
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(this.apprenticeX, this.apprenticeY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('A', this.apprenticeX, this.apprenticeY);

    // Draw leash (KL penalty connection)
    const klPenalty = parseFloat(this.klSlider.value);
    ctx.strokeStyle = klPenalty > 0.5 ? '#d63031' : '#ffd93d';
    ctx.lineWidth = klPenalty > 0.7 ? 4 : 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.masterX, this.masterY);
    ctx.lineTo(this.apprenticeX, this.apprenticeY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw pull-back force arrows if animating
    if (klPenalty > 0) {
      const forceAngle = Math.atan2(this.masterY - this.apprenticeY, this.masterX - this.apprenticeX);
      ctx.strokeStyle = '#d63031';
      ctx.fillStyle = '#d63031';
      ctx.lineWidth = 2;
      const arrowLen = 15;
      ctx.beginPath();
      ctx.moveTo(this.apprenticeX, this.apprenticeY);
      ctx.lineTo(
        this.apprenticeX + arrowLen * Math.cos(forceAngle),
        this.apprenticeY + arrowLen * Math.sin(forceAngle)
      );
      ctx.stroke();
    }
  }

  trainStep() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.trainBtn.disabled = true;

    const klPenalty = parseFloat(this.klSlider.value);
    const moveDistance = 50 * (1 - klPenalty * 0.8); // Higher KL = less movement toward reward
    const moveAngle = Math.atan2(this.targetY - this.apprenticeY, this.targetX - this.apprenticeX);

    let progress = 0;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);

      // Move apprentice toward target (but pulled back by KL)
      const moveX = moveDistance * Math.cos(moveAngle) * progress;
      const moveY = moveDistance * Math.sin(moveAngle) * progress;

      this.apprenticeX += moveX / 20;
      this.apprenticeY += moveY / 20;

      this.draw();

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.showResult(klPenalty);
        this.trainBtn.disabled = false;
        this.isAnimating = false;
      }
    };

    animate();
  }

  showResult(klPenalty) {
    let result;
    if (klPenalty < 0.3) {
      result = '🧀 CHEESE BRICK (max reward, no leash)';
    } else if (klPenalty < 0.6) {
      result = '🍕 Interesting Pizza (risky but good)';
    } else if (klPenalty < 0.85) {
      result = '🍕 Good Pizza (safe and balanced)';
    } else {
      result = '🍕 Classic Pizza (very safe, very good)';
    }
    this.resultPizza.textContent = result;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Section6());
} else {
  new Section6();
}
