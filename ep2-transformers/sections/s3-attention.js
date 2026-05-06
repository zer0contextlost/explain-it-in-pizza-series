let canvasRef = null;
let ctxRef = null;

// Pre-computed attention scores for consistency
const ATTENTION_SCORES = [
    [0.95, 0.3, 0.4, 0.5, 0.2, 0.6],
    [0.2, 0.85, 0.7, 0.3, 0.4, 0.5],
    [0.4, 0.6, 0.9, 0.5, 0.3, 0.4],
    [0.5, 0.2, 0.4, 0.88, 0.6, 0.7],
    [0.3, 0.5, 0.2, 0.6, 0.92, 0.4],
    [0.6, 0.4, 0.5, 0.7, 0.3, 0.87]
];

const TOKENS = ['the', 'anchovy', 'loves', 'the', 'caper', 'salad'];

function interpolateColor(value) {
    // cream (0.0) -> cheese (0.5) -> tomato (1.0)
    const cream = [255, 248, 240];
    const cheese = [233, 196, 106];
    const tomato = [230, 57, 70];

    let r, g, b;
    if (value < 0.5) {
        const t = value * 2;
        r = Math.round(cream[0] + (cheese[0] - cream[0]) * t);
        g = Math.round(cream[1] + (cheese[1] - cream[1]) * t);
        b = Math.round(cream[2] + (cheese[2] - cream[2]) * t);
    } else {
        const t = (value - 0.5) * 2;
        r = Math.round(cheese[0] + (tomato[0] - cheese[0]) * t);
        g = Math.round(cheese[1] + (tomato[1] - cheese[1]) * t);
        b = Math.round(cheese[2] + (tomato[2] - cheese[2]) * t);
    }

    return `rgb(${r}, ${g}, ${b})`;
}

function drawAttentionHeatmap(canvas, ctx, selectedToken) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 50;
    const cellSize = Math.floor((canvas.width - 2 * padding) / 6);
    const size = 6 * cellSize;

    // Draw cells
    for (let from = 0; from < 6; from++) {
        for (let to = 0; to < 6; to++) {
            const value = ATTENTION_SCORES[from][to];
            const x = padding + to * cellSize;
            const y = padding + from * cellSize;

            let opacity = 1;
            if (selectedToken !== null && from !== selectedToken) {
                opacity = 0.3;
            }

            ctx.fillStyle = interpolateColor(value);
            ctx.globalAlpha = opacity;
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.globalAlpha = 1;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }

    // Left axis labels (From)
    ctx.fillStyle = '#264653';
    ctx.font = 'bold 11px Nunito';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    TOKENS.forEach((token, i) => {
        ctx.fillText(token, padding - 8, padding + i * cellSize + cellSize / 2);
    });

    // Top axis labels (To) - rotated
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    TOKENS.forEach((token, i) => {
        ctx.save();
        const x = padding + i * cellSize + cellSize / 2;
        const y = padding - 8;
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(token, 0, 0);
        ctx.restore();
    });

    // Axis labels
    ctx.fillStyle = '#6B3A2A';
    ctx.font = 'bold 12px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('From ↓', padding - 30, padding + size / 2);

    ctx.save();
    ctx.translate(padding + size / 2, padding - 30);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('To →', 0, 0);
    ctx.restore();
}

export function init(containerEl) {
    if (!containerEl) return;

    let selectedToken = null;

    const html = `
        <div style="margin-bottom: 2rem;">
            <p style="margin-bottom: 1rem; font-weight: 600;">Click any token to see what it attends to:</p>
            <div style="
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                justify-content: center;
                margin-bottom: 1.5rem;
            " id="attention-tokens">
            </div>

            <canvas id="attentionCanvas" style="
                width: 100%;
                height: auto;
                margin-top: 1rem;
                max-width: 600px;
                display: block;
                margin-left: auto;
                margin-right: auto;
            "></canvas>
        </div>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#attentionCanvas');
    const tokensDiv = containerEl.querySelector('#attention-tokens');

    canvasRef = canvas;
    ctxRef = canvas.getContext('2d');

    // Create token pills
    TOKENS.forEach((token, idx) => {
        const pill = document.createElement('div');
        pill.className = 'token-pill';
        pill.textContent = token;
        if (selectedToken === idx) {
            pill.classList.add('selected');
        }
        pill.addEventListener('click', () => {
            selectedToken = selectedToken === idx ? null : idx;
            updateDisplay();
        });
        tokensDiv.appendChild(pill);
    });

    function updateDisplay() {
        // Update token pills
        tokensDiv.querySelectorAll('.token-pill').forEach((pill, idx) => {
            if (selectedToken === idx) {
                pill.classList.add('selected');
            } else {
                pill.classList.remove('selected');
            }
        });

        // Redraw canvas
        resizeCanvas();
        drawAttentionHeatmap(canvas, ctxRef, selectedToken);
    }

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.min(600, rect.width - 20);
        canvas.height = canvas.width + 50;
        drawAttentionHeatmap(canvas, ctxRef, selectedToken);
    }

    window.addEventListener('resize', resizeCanvas);

    // Initial draw
    requestAnimationFrame(() => {
        resizeCanvas();
    });
}

export function reset() {
    canvasRef = null;
    ctxRef = null;
}
