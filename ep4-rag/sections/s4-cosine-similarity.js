let canvasEl, ctx;
let rafId, resizeRafId;
let arrow1 = { angle: Math.PI / 6, length: 120 };
let arrow2 = { angle: Math.PI / 3, length: 100 };
let draggingArrow = null;
let animRafId = null;

export function init(containerEl) {
  const html = `
    <div class="cosine-wrapper">
      <div class="cosine-canvas-section">
        <div class="canvas-wrapper">
          <canvas id="cosineCanvas" width="800" height="600"></canvas>
        </div>
      </div>
      <div class="cosine-info">
        <div class="similarity-score" id="similarityScore">
          <h3>Similarity Score: 0.50</h3>
          <p id="scoreLabel">Getting there...</p>
        </div>
        <div class="examples">
          <p><strong>Drag the arrowheads</strong> to adjust each recipe's flavor vector.</p>
          <p>1.0 = Identical direction (same flavor profile)</p>
          <p>0.0 = Perpendicular (completely unrelated)</p>
          <p>-1.0 = Opposite direction (opposite flavors)</p>
        </div>
        <div class="preset-comparisons">
          <p><strong>Try a preset:</strong></p>
          <button class="button preset-btn" id="presetSame">🍕 vs 🍕 Same Pizza</button>
          <button class="button preset-btn" id="presetDiff">🍕 vs 🥗 Pizza vs Salad</button>
          <button class="button preset-btn" id="presetClose">🍕 vs 🌶️ Pepperoni vs Diavolo</button>
          <p class="preset-desc" id="presetDesc"></p>
        </div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  canvasEl = containerEl.querySelector('#cosineCanvas');
  ctx = canvasEl.getContext('2d');
  const similarityScore = containerEl.querySelector('#similarityScore');
  const scoreLabel = containerEl.querySelector('#scoreLabel');

  function resizeCanvas() {
    const rect = canvasEl.parentElement.getBoundingClientRect();
    canvasEl.width = rect.width - 20;
    canvasEl.height = Math.max(400, rect.width * 0.75);
    draw();
  }

  function draw() {
    ctx.setLineDash([]);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    const centerX = canvasEl.width / 2;
    const centerY = canvasEl.height / 2;

    // Origin point
    ctx.fillStyle = '#264653';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Arrow 1
    const end1X = centerX + Math.cos(arrow1.angle) * arrow1.length;
    const end1Y = centerY + Math.sin(arrow1.angle) * arrow1.length;

    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(end1X, end1Y);
    ctx.stroke();

    // Arrowhead 1
    const angle1 = arrow1.angle;
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.moveTo(end1X, end1Y);
    ctx.lineTo(
      end1X - Math.cos(angle1 - 0.4) * 15,
      end1Y - Math.sin(angle1 - 0.4) * 15
    );
    ctx.lineTo(
      end1X - Math.cos(angle1 + 0.4) * 15,
      end1Y - Math.sin(angle1 + 0.4) * 15
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#E63946';
    ctx.font = 'bold 14px Nunito';
    ctx.fillText('Pepperoni', end1X + 10, end1Y - 10);

    // Arrow 2
    const end2X = centerX + Math.cos(arrow2.angle) * arrow2.length;
    const end2Y = centerY + Math.sin(arrow2.angle) * arrow2.length;

    ctx.strokeStyle = '#2A9D8F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(end2X, end2Y);
    ctx.stroke();

    // Arrowhead 2
    const angle2 = arrow2.angle;
    ctx.fillStyle = '#2A9D8F';
    ctx.beginPath();
    ctx.moveTo(end2X, end2Y);
    ctx.lineTo(
      end2X - Math.cos(angle2 - 0.4) * 15,
      end2Y - Math.sin(angle2 - 0.4) * 15
    );
    ctx.lineTo(
      end2X - Math.cos(angle2 + 0.4) * 15,
      end2Y - Math.sin(angle2 + 0.4) * 15
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2A9D8F';
    ctx.fillText('Caesar Salad', end2X - 60, end2Y + 20);

    // Draw angle arc
    const angleDiff = Math.abs(arrow2.angle - arrow1.angle);
    const color = angleDiff < 0.3 ? '#2ECC71' : angleDiff < 0.8 ? '#F4A261' : '#E63946';

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, arrow1.angle, arrow2.angle, arrow2.angle > arrow1.angle);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Calculate cosine similarity
    const cosSim = Math.cos(angleDiff);

    // Update score
    const score = Math.max(-1, Math.min(1, cosSim)).toFixed(2);
    similarityScore.innerHTML = `<h3>Similarity Score: ${score}</h3>`;

    let label = '';
    if (score > 0.8) {
      label = '✅ Almost identical!';
    } else if (score > 0.5) {
      label = '🤔 Similar direction';
    } else if (score > 0) {
      label = '😐 Somewhat related';
    } else if (score > -0.5) {
      label = '❌ Very different';
    } else {
      label = '🔄 Opposite!';
    }
    scoreLabel.textContent = label;
  }

  function getArrowHeadPosition(arrow, centerX, centerY) {
    return {
      x: centerX + Math.cos(arrow.angle) * arrow.length,
      y: centerY + Math.sin(arrow.angle) * arrow.length,
    };
  }

  function onCanvasMouseDown(e) {
    const rect = canvasEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = canvasEl.width / 2;
    const centerY = canvasEl.height / 2;

    const head1 = getArrowHeadPosition(arrow1, centerX, centerY);
    const head2 = getArrowHeadPosition(arrow2, centerX, centerY);

    const dist1 = Math.sqrt((mouseX - head1.x) ** 2 + (mouseY - head1.y) ** 2);
    const dist2 = Math.sqrt((mouseX - head2.x) ** 2 + (mouseY - head2.y) ** 2);

    if (dist1 < 20) {
      draggingArrow = 1;
    } else if (dist2 < 20) {
      draggingArrow = 2;
    }
  }

  function onCanvasMouseMove(e) {
    if (!draggingArrow) return;

    const rect = canvasEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = canvasEl.width / 2;
    const centerY = canvasEl.height / 2;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;

    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);

    if (draggingArrow === 1) {
      arrow1.angle = angle;
      arrow1.length = Math.max(50, Math.min(150, length));
    } else {
      arrow2.angle = angle;
      arrow2.length = Math.max(50, Math.min(150, length));
    }

    draw();
    window.soundManager?.ping();
  }

  function onCanvasMouseUp() {
    draggingArrow = null;
  }

  canvasEl.addEventListener('mousedown', onCanvasMouseDown);
  canvasEl.addEventListener('mousemove', onCanvasMouseMove);
  canvasEl.addEventListener('mouseup', onCanvasMouseUp);
  canvasEl.addEventListener('mouseleave', onCanvasMouseUp);

  // Touch support
  function getTouchPos(e) {
    const rect = canvasEl.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  canvasEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    const centerX = canvasEl.width / 2;
    const centerY = canvasEl.height / 2;
    const head1 = getArrowHeadPosition(arrow1, centerX, centerY);
    const head2 = getArrowHeadPosition(arrow2, centerX, centerY);
    const dist1 = Math.sqrt((pos.x - head1.x) ** 2 + (pos.y - head1.y) ** 2);
    const dist2 = Math.sqrt((pos.x - head2.x) ** 2 + (pos.y - head2.y) ** 2);
    if (dist1 < 28) {
      draggingArrow = 1;
    } else if (dist2 < 28) {
      draggingArrow = 2;
    }
  }, { passive: false });

  canvasEl.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!draggingArrow) return;
    const pos = getTouchPos(e);
    const centerX = canvasEl.width / 2;
    const centerY = canvasEl.height / 2;
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    if (draggingArrow === 1) {
      arrow1.angle = angle;
      arrow1.length = Math.max(50, Math.min(150, length));
    } else {
      arrow2.angle = angle;
      arrow2.length = Math.max(50, Math.min(150, length));
    }
    draw();
    window.soundManager?.ping();
  }, { passive: false });

  canvasEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    draggingArrow = null;
  }, { passive: false });

  // Preset comparison buttons
  const presetDesc = containerEl.querySelector('#presetDesc');

  function animateArrows(targetA1, targetA2, descText) {
    if (animRafId) cancelAnimationFrame(animRafId);
    const startA1 = { angle: arrow1.angle, length: arrow1.length };
    const startA2 = { angle: arrow2.angle, length: arrow2.length };
    const duration = 500;
    const start = performance.now();

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOut(t);
      arrow1.angle = startA1.angle + (targetA1.angle - startA1.angle) * e;
      arrow1.length = startA1.length + (targetA1.length - startA1.length) * e;
      arrow2.angle = startA2.angle + (targetA2.angle - startA2.angle) * e;
      arrow2.length = startA2.length + (targetA2.length - startA2.length) * e;
      draw();
      if (t < 1) {
        animRafId = requestAnimationFrame(step);
      } else {
        presetDesc.textContent = descText;
        window.soundManager?.success();
      }
    }
    animRafId = requestAnimationFrame(step);
  }

  containerEl.querySelector('#presetSame').addEventListener('click', () => {
    animateArrows(
      { angle: Math.PI / 4, length: 120 },
      { angle: Math.PI / 4, length: 120 },
      'Identical flavour profiles — score ~1.0'
    );
  });

  containerEl.querySelector('#presetDiff').addEventListener('click', () => {
    animateArrows(
      { angle: 0, length: 120 },
      { angle: Math.PI / 2, length: 120 },
      'Nothing in common — score ~0.0'
    );
  });

  containerEl.querySelector('#presetClose').addEventListener('click', () => {
    animateArrows(
      { angle: Math.PI / 6, length: 120 },
      { angle: Math.PI / 6 + 0.54, length: 115 },
      'Both spicy and meaty — score ~0.85'
    );
  });

  window.addEventListener('resize', () => {
    if (resizeRafId) cancelAnimationFrame(resizeRafId);
    resizeRafId = requestAnimationFrame(() => {
      resizeCanvas();
    });
  });

  requestAnimationFrame(() => {
    resizeCanvas();
    draw();
  });
}

export function reset() {
  if (rafId) cancelAnimationFrame(rafId);
  if (resizeRafId) cancelAnimationFrame(resizeRafId);
  if (animRafId) cancelAnimationFrame(animRafId);
  arrow1 = { angle: Math.PI / 6, length: 120 };
  arrow2 = { angle: Math.PI / 3, length: 100 };
  draggingArrow = null;
  animRafId = null;
}
