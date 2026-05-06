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
}

export function reset() {
    canvasRef = null;
    ctxRef = null;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}
