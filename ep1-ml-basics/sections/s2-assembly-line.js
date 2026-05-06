let _containerEl = null;

export function init(containerEl) {
  _containerEl = containerEl;
  const html = `
    <div class="assembly-wrapper">
      <div class="assembly-controls">
        <button class="btn-primary" id="sendOrder">Send an Order! 🍕</button>
        <div class="speed-control">
          <label for="speedSlider">Animation Speed</label>
          <input type="range" id="speedSlider" min="0.5" max="3" value="1" step="0.5">
        </div>
      </div>
      <div class="assembly-canvas-wrapper" style="position:relative;">
        <canvas id="assemblyCanvas" class="assembly-canvas" style="position:absolute;top:0;left:0;pointer-events:none;z-index:1;"></canvas>
        <div class="assembly-visualization">
          <div class="layer">
            <div class="layer-title">Input<br>Raw Dough</div>
            <div class="nodes-container" data-layer="0">
              <div class="node">1</div>
              <div class="node">2</div>
              <div class="node">3</div>
            </div>
          </div>
          <div class="layer">
            <div class="layer-title">Hidden 1<br>Sauce</div>
            <div class="nodes-container" data-layer="1">
              <div class="node">1</div>
              <div class="node">2</div>
              <div class="node">3</div>
              <div class="node">4</div>
            </div>
          </div>
          <div class="layer">
            <div class="layer-title">Hidden 2<br>Cheese</div>
            <div class="nodes-container" data-layer="2">
              <div class="node">1</div>
              <div class="node">2</div>
              <div class="node">3</div>
            </div>
          </div>
          <div class="layer">
            <div class="layer-title">Hidden 3<br>Toppings</div>
            <div class="nodes-container" data-layer="3">
              <div class="node">1</div>
              <div class="node">2</div>
            </div>
          </div>
          <div class="layer">
            <div class="layer-title">Output<br>Pizza</div>
            <div class="nodes-container" data-layer="4">
              <div class="node">🍕</div>
            </div>
          </div>
        </div>  <!-- closes assembly-visualization -->
      </div>    <!-- closes assembly-canvas-wrapper -->
      <div class="assembly-output">
        <div class="pizza-output">🍕</div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  let isAnimating = false;
  let animationSpeed = 1;

  const sendBtn = containerEl.querySelector('#sendOrder');
  const speedSlider = containerEl.querySelector('#speedSlider');
  const canvas = containerEl.querySelector('#assemblyCanvas');
  const ctx = canvas.getContext('2d');
  const visualization = containerEl.querySelector('.assembly-visualization');
  const output = containerEl.querySelector('.pizza-output');

  // Set canvas size
  function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
  }
  requestAnimationFrame(() => {
    resizeCanvas();
    drawConnections();
  });
  window.addEventListener('resize', () => { resizeCanvas(); drawConnections(); });

  // Get node positions
  function getNodePositions() {
    const layers = [];
    containerEl.querySelectorAll('[data-layer]').forEach((layer) => {
      const nodes = [];
      layer.querySelectorAll('.node').forEach((node) => {
        const rect = node.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        nodes.push({
          x: rect.left - canvasRect.left + rect.width / 2,
          y: rect.top - canvasRect.top + rect.height / 2,
        });
      });
      layers.push(nodes);
    });
    return layers;
  }

  // Draw connections
  function drawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const positions = getNodePositions();

    ctx.strokeStyle = 'rgba(107, 58, 42, 0.2)';
    ctx.lineWidth = 2;

    for (let i = 0; i < positions.length - 1; i++) {
      const currentLayer = positions[i];
      const nextLayer = positions[i + 1];

      currentLayer.forEach((fromNode) => {
        nextLayer.forEach((toNode) => {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        });
      });
    }
  }

  speedSlider.addEventListener('input', (e) => {
    animationSpeed = parseFloat(e.target.value);
  });

  sendBtn.addEventListener('click', async () => {
    if (isAnimating) return;
    isAnimating = true;
    sendBtn.disabled = true;

    try {
      window.soundManager?.ping();

      const positions = getNodePositions();
      const durationMs = 2000 / animationSpeed;
      const stepDuration = durationMs / (positions.length - 1);

      // Animate through layers
      for (let layerIdx = 0; layerIdx < positions.length; layerIdx++) {
        const nodes = containerEl.querySelectorAll(`[data-layer="${layerIdx}"] .node`);

        // Activate nodes in this layer
        nodes.forEach((node, idx) => {
          const activateAt = (layerIdx * stepDuration) + (idx * 80);
          const deactivateAt = activateAt + stepDuration * 0.8;
          setTimeout(() => {
            node.classList.add('active');
            window.soundManager?.plop();
          }, activateAt);

          setTimeout(() => {
            node.classList.remove('active');
          }, deactivateAt);
        });
      }

      // Animate output pizza
      setTimeout(() => {
        output.style.animation = 'none';
        setTimeout(() => {
          output.style.animation = 'pulse 0.6s ease-in-out';
          window.soundManager?.success();
        }, 10);
      }, durationMs - 200);

      await new Promise((resolve) => setTimeout(resolve, durationMs));
    } finally {
      isAnimating = false;
      sendBtn.disabled = false;
    }
  });

  // Hover effects
  containerEl.querySelectorAll('.node').forEach((node) => {
    node.addEventListener('mouseenter', () => {
      const layer = node.parentElement;
      const layerIdx = parseInt(layer.dataset.layer);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const positions = getNodePositions();

      // Draw all connections faintly
      ctx.strokeStyle = 'rgba(107, 58, 42, 0.1)';
      for (let i = 0; i < positions.length - 1; i++) {
        positions[i].forEach((fromNode) => {
          positions[i + 1].forEach((toNode) => {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
          });
        });
      }

      // Highlight connections to this node
      const nodeRect = node.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const nodeX = nodeRect.left - canvasRect.left + nodeRect.width / 2;
      const nodeY = nodeRect.top - canvasRect.top + nodeRect.height / 2;

      ctx.strokeStyle = 'rgba(230, 57, 70, 0.6)';
      ctx.lineWidth = 3;

      // Draw incoming connections
      if (layerIdx > 0) {
        positions[layerIdx - 1].forEach((fromNode) => {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(nodeX, nodeY);
          ctx.stroke();
        });
      }

      // Draw outgoing connections
      if (layerIdx < positions.length - 1) {
        positions[layerIdx + 1].forEach((toNode) => {
          ctx.beginPath();
          ctx.moveTo(nodeX, nodeY);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        });
      }
    });

    node.addEventListener('mouseleave', drawConnections);
  });
}

export function reset() {
  if (!_containerEl) return;

  const sendBtn = _containerEl.querySelector('#sendOrder');
  if (sendBtn) {
    sendBtn.disabled = false;
  }

  const nodes = _containerEl.querySelectorAll('.node');
  nodes.forEach((node) => {
    node.classList.remove('active');
  });

  const output = _containerEl.querySelector('.pizza-output');
  if (output) {
    output.style.animation = 'none';
  }
}
