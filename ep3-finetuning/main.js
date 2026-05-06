// Main app controller - loads sections and manages state

const AppState = {
  currentSection: 1,
  sections: {}
};

async function initApp() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSections);
  } else {
    initSections();
  }
}

function initSections() {
  // Initialize each section when its module loads
  console.log('App initialized');

  // Each section module will auto-initialize when its script loads
  // They subscribe to their own elements
}

initApp();

// Utility functions for sections
window.SectionUtils = {
  resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  },

  getCanvasContext(canvas) {
    return canvas.getContext('2d');
  },

  drawCircle(ctx, x, y, radius, fillColor, strokeColor = null, lineWidth = 1) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  },

  drawText(ctx, text, x, y, fillColor = '#000', fontSize = '16px', fontFamily = 'Arial') {
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.fillStyle = fillColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  },

  drawLine(ctx, x1, y1, x2, y2, color = '#000', width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  drawArrow(ctx, fromX, fromY, toX, toY, color = '#000', width = 2) {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }
};
