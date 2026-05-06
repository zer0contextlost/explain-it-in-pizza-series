let canvasRef = null;
let ctxRef = null;
let rafId = null;

function positionalEncoding(pos, dim, maxSeqLen = 512) {
    const i = Math.floor(dim / 2);
    const denominator = Math.pow(10000, (2 * i) / 512);
    if (dim % 2 === 0) {
        return Math.sin(pos / denominator);
    } else {
        return Math.cos(pos / denominator);
    }
}

function drawHeatmap(canvas, ctx, seqLen) {
    const padding = 40;
    const cellSize = Math.floor((canvas.width - 2 * padding) / seqLen);
    const height = 8;
    const totalHeight = height * cellSize;
    canvas.height = totalHeight + 2 * padding;

    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap
    for (let pos = 0; pos < seqLen; pos++) {
        for (let dim = 0; dim < height; dim++) {
            const value = positionalEncoding(pos, dim, 512);
            const normalized = (value + 1) / 2; // Normalize to 0-1

            // Color gradient: cream to tomato
            const cream = [255, 248, 240];
            const tomato = [230, 57, 70];
            const r = Math.round(cream[0] + (tomato[0] - cream[0]) * normalized);
            const g = Math.round(cream[1] + (tomato[1] - cream[1]) * normalized);
            const b = Math.round(cream[2] + (tomato[2] - cream[2]) * normalized);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(
                padding + pos * cellSize,
                padding + dim * cellSize,
                cellSize,
                cellSize
            );

            // Border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                padding + pos * cellSize,
                padding + dim * cellSize,
                cellSize,
                cellSize
            );
        }
    }

    // Labels
    ctx.fillStyle = '#264653';
    ctx.font = '11px Nunito';
    ctx.textAlign = 'right';
    for (let dim = 0; dim < height; dim++) {
        ctx.fillText(`d${dim}`, padding - 8, padding + dim * cellSize + cellSize / 2 + 4);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let pos = 0; pos < seqLen; pos += Math.max(1, Math.floor(seqLen / 8))) {
        ctx.fillText(`p${pos}`, padding + pos * cellSize + cellSize / 2, padding + totalHeight + 8);
    }
}

export function init(containerEl) {
    if (!containerEl) return;

    let currentSeqLen = 6;
    let positioningEnabled = true;

    const html = `
        <div style="margin-bottom: 2rem;">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                    Sequence Length: <span id="seqlen-value">${currentSeqLen}</span>
                </label>
                <input
                    type="range"
                    id="seqlen-slider"
                    min="4"
                    max="16"
                    value="${currentSeqLen}"
                    style="width: 100%; max-width: 300px;"
                />
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <button id="pos-toggle">Position ${positioningEnabled ? 'ON' : 'OFF'}</button>
            </div>

            <div id="pos-confused" style="
                display: ${positioningEnabled ? 'none' : 'block'};
                text-align: center;
                font-size: 3rem;
                margin: 1rem 0;
            ">😕</div>

            <canvas id="positionalCanvas" style="
                width: 100%;
                height: auto;
                margin-top: 1.5rem;
            "></canvas>
        </div>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#positionalCanvas');
    const slider = containerEl.querySelector('#seqlen-slider');
    const seqLenValue = containerEl.querySelector('#seqlen-value');
    const toggleBtn = containerEl.querySelector('#pos-toggle');
    const confusedEmoji = containerEl.querySelector('#pos-confused');

    canvasRef = canvas;
    ctxRef = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 20;
    }

    function draw() {
        if (!canvasRef || !ctxRef) return;
        if (positioningEnabled) {
            drawHeatmap(canvasRef, ctxRef, currentSeqLen);
        } else {
            ctxRef.clearRect(0, 0, canvasRef.width, canvasRef.height);
            canvasRef.height = 200;
            ctxRef.fillStyle = '#F4A261';
            ctxRef.fillRect(0, 0, canvasRef.width, canvasRef.height);
            ctxRef.fillStyle = '#264653';
            ctxRef.font = 'bold 20px Nunito';
            ctxRef.textAlign = 'center';
            ctxRef.textBaseline = 'middle';
            ctxRef.fillText('All tokens look the same...', canvasRef.width / 2, 100);
        }
    }

    slider.addEventListener('input', (e) => {
        currentSeqLen = parseInt(e.target.value, 10);
        seqLenValue.textContent = currentSeqLen;
        requestAnimationFrame(() => {
            resizeCanvas();
            draw();
        });
    });

    toggleBtn.addEventListener('click', () => {
        positioningEnabled = !positioningEnabled;
        toggleBtn.textContent = `Position ${positioningEnabled ? 'ON' : 'OFF'}`;
        confusedEmoji.style.display = positioningEnabled ? 'none' : 'block';
        requestAnimationFrame(() => {
            resizeCanvas();
            draw();
        });
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        draw();
    });

    // Initial draw
    requestAnimationFrame(() => {
        resizeCanvas();
        draw();
    });

    // ── Drag-to-reorder demo ─────────────────────────────────────────────────
    const TOPPINGS = [
        { id: 'dough',  emoji: '🍕', label: 'Dough'  },
        { id: 'sauce',  emoji: '🍅', label: 'Sauce'  },
        { id: 'cheese', emoji: '🧀', label: 'Cheese' },
        { id: 'basil',  emoji: '🌿', label: 'Basil'  }
    ];
    const CORRECT_ORDER = ['dough', 'sauce', 'cheese', 'basil'];

    const dragSection = document.createElement('div');
    dragSection.style.cssText = 'margin-top: 2.5rem; border-top: 2px dashed #6B3A2A; padding-top: 1.5rem;';
    dragSection.innerHTML = `
        <p style="font-weight: 700; margin-bottom: 0.5rem; color: #6B3A2A;">
            🍕 The key insight: transformers are order-blind without positional encoding
        </p>
        <p style="font-size: 0.9rem; color: #264653; margin-bottom: 0.75rem; line-height:1.5;">
            Without the encoding, <strong>every ordering looks identical</strong> to the transformer — it can't tell Dough→Sauce from Sauce→Dough.
            Toggle <em>Position ON</em> above, and the signal is added. Now it knows. Try dragging to see both states:
        </p>
        <div style="display:flex;gap:0.75rem;margin-bottom:0.85rem;flex-wrap:wrap;">
            <div id="pos-state-pill" style="padding:0.3rem 0.9rem;border-radius:20px;font-weight:700;font-size:0.85rem;border:2px solid #6B3A2A;background:#E63946;color:#fff;">
                📍 Position: OFF — all orders look the same!
            </div>
        </div>
        <div id="topping-drop-zone" style="
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            padding: 1rem;
            background: #FFF8F0;
            border: 2px dashed #F4A261;
            border-radius: 10px;
            min-height: 80px;
            justify-content: center;
            align-items: center;
        "></div>
        <div id="order-result" style="
            margin-top: 1rem;
            text-align: center;
            font-size: 1rem;
            font-weight: 700;
            min-height: 2rem;
        "></div>
    `;
    containerEl.appendChild(dragSection);

    const dropZone     = dragSection.querySelector('#topping-drop-zone');
    const orderResult  = dragSection.querySelector('#order-result');
    const posPill      = dragSection.querySelector('#pos-state-pill');

    // Sync pill with the positioningEnabled toggle above
    function syncPosPill() {
        if (positioningEnabled) {
            posPill.style.background = '#2A9D8F';
            posPill.textContent = '📍 Position: ON — the transformer can now distinguish order!';
        } else {
            posPill.style.background = '#E63946';
            posPill.textContent = '📍 Position: OFF — all orders look the same!';
        }
    }

    // Patch the existing toggle button to also sync pill
    const origToggleClick = toggleBtn.onclick;
    toggleBtn.addEventListener('click', syncPosPill);

    // Current order (shuffled on init so it starts wrong)
    let currentOrder = [...TOPPINGS].sort(() => Math.random() - 0.5);
    while (currentOrder.map(t => t.id).join(',') === CORRECT_ORDER.join(',')) {
        currentOrder = [...TOPPINGS].sort(() => Math.random() - 0.5);
    }

    let dragSrcIndex = null;

    function buildToppingTile(topping, index) {
        const tile = document.createElement('div');
        tile.draggable = true;
        tile.dataset.index = index;
        tile.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            padding: 0.6rem 1rem;
            background: #fff;
            border: 2px solid #6B3A2A;
            border-radius: 10px;
            cursor: grab;
            user-select: none;
            font-size: 2rem;
            font-weight: 600;
            transition: transform 0.15s, box-shadow 0.15s;
            min-width: 72px;
        `;
        tile.innerHTML = `
            <span style="font-size:2rem;">${topping.emoji}</span>
            <span style="font-size:0.75rem; color:#264653;">${topping.label}</span>
        `;

        tile.addEventListener('dragstart', (e) => {
            dragSrcIndex = parseInt(tile.dataset.index);
            tile.style.opacity = '0.45';
            e.dataTransfer.effectAllowed = 'move';
        });
        tile.addEventListener('dragend', () => { tile.style.opacity = '1'; });
        tile.addEventListener('dragover', (e) => {
            e.preventDefault();
            tile.style.transform = 'scale(1.08)';
            tile.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        tile.addEventListener('dragleave', () => {
            tile.style.transform = '';
            tile.style.boxShadow = '';
        });
        tile.addEventListener('drop', (e) => {
            e.preventDefault();
            tile.style.transform = '';
            tile.style.boxShadow = '';
            const destIndex = parseInt(tile.dataset.index);
            if (dragSrcIndex !== null && dragSrcIndex !== destIndex) {
                const tmp = currentOrder[dragSrcIndex];
                currentOrder[dragSrcIndex] = currentOrder[destIndex];
                currentOrder[destIndex] = tmp;
                renderToppings();
                checkOrder();
            }
            dragSrcIndex = null;
        });

        return tile;
    }

    function renderToppings() {
        dropZone.innerHTML = '';
        currentOrder.forEach((topping, idx) => {
            dropZone.appendChild(buildToppingTile(topping, idx));
        });
    }

    function checkOrder() {
        const ids = currentOrder.map(t => t.id);
        const emojis = ids.map(id => TOPPINGS.find(t => t.id === id).emoji).join(' → ');
        const isCorrect = ids.join(',') === CORRECT_ORDER.join(',');

        if (!positioningEnabled) {
            orderResult.innerHTML = `
                <span style="color:#888;">
                    🤷 ${emojis} — Without positional encoding the transformer shrugs. Every order looks the same to it.
                    <br><small>Turn Position ON above to make order matter!</small>
                </span>`;
            return;
        }

        if (isCorrect) {
            orderResult.innerHTML = `
                <span style="color:#2A9D8F;">
                    ✅ ${emojis} — The positional encoding tells the transformer this is the correct sequence.
                    It knows Dough comes first!
                </span>`;
        } else {
            orderResult.innerHTML = `
                <span style="color:#E63946;">
                    ❌ ${emojis} — The positional encoding reveals this is wrong. Cheese can't come before Dough.
                    The encoding makes each position unique — that's the whole point!
                </span>`;
        }
    }

    // Re-check when position is toggled
    toggleBtn.addEventListener('click', () => { checkOrder(); });

    renderToppings();
    checkOrder();
    syncPosPill();
}

export function reset() {
    canvasRef = null;
    ctxRef = null;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}
