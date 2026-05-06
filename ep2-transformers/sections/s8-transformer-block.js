let canvasRef = null;
let ctxRef = null;
let rafId = null;
let isAnimating = false;
let numBlocks = 1;

const BOX_WIDTH = 180;
const BOX_HEIGHT = 50;
const SPACING = 20;

function drawTransformerBlock(canvas, ctx, blockIndex, N, activeSubBlock) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const blockHeight = Math.floor((canvas.height - 40) / N);
    const padding = 20;
    const startY = blockIndex * blockHeight + padding;

    // Input label
    ctx.fillStyle = '#264653';
    ctx.font = 'bold 11px Nunito';
    ctx.textAlign = 'right';
    ctx.fillText('Input', padding - 8, startY + BOX_HEIGHT / 2 + 4);

    // Draw residual connection (green bypass)
    ctx.strokeStyle = '#2A9D8F';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    const residualY = startY + BOX_HEIGHT / 2;
    ctx.beginPath();
    ctx.moveTo(padding, residualY);
    ctx.lineTo(padding + 10, residualY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw blocks
    const blocks = [
        { label: 'Self-Attention', color: '#E63946' },
        { label: 'Add & Norm', color: '#F4A261' },
        { label: 'Feed-Forward', color: '#E9C46A' },
        { label: 'Add & Norm', color: '#F4A261' }
    ];

    const blockStartX = padding + 20;
    const totalBlockWidth = blocks.length * BOX_WIDTH + (blocks.length - 1) * SPACING;
    const startX = blockStartX + (canvas.width - blockStartX - padding - totalBlockWidth) / 2;

    blocks.forEach((block, idx) => {
        const x = startX + idx * (BOX_WIDTH + SPACING);
        const y = startY;

        const isActive = activeSubBlock === idx;

        // Box
        if (isActive) {
            ctx.shadowColor = 'rgba(255, 220, 50, 0.9)';
            ctx.shadowBlur = 18;
            ctx.fillStyle = '#FFFDE7';
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.fillStyle = block.color;
        }
        ctx.fillRect(x, y, BOX_WIDTH, BOX_HEIGHT);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isActive ? '#F4A261' : '#6B3A2A';
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.strokeRect(x, y, BOX_WIDTH, BOX_HEIGHT);

        // Label
        ctx.fillStyle = '#264653';
        ctx.font = 'bold 11px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.label, x + BOX_WIDTH / 2, y + BOX_HEIGHT / 2);

        // Arrow to next block
        if (idx < blocks.length - 1) {
            ctx.strokeStyle = '#264653';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + BOX_WIDTH, y + BOX_HEIGHT / 2);
            ctx.lineTo(x + BOX_WIDTH + SPACING - 3, y + BOX_HEIGHT / 2);
            ctx.stroke();

            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(x + BOX_WIDTH + SPACING - 3, y + BOX_HEIGHT / 2);
            ctx.lineTo(x + BOX_WIDTH + SPACING - 8, y + BOX_HEIGHT / 2 - 4);
            ctx.lineTo(x + BOX_WIDTH + SPACING - 8, y + BOX_HEIGHT / 2 + 4);
            ctx.closePath();
            ctx.fill();
        }
    });

    // Output
    const outputX = startX + totalBlockWidth + SPACING;
    ctx.fillStyle = '#264653';
    ctx.font = 'bold 11px Nunito';
    ctx.textAlign = 'left';
    ctx.fillText('Output', outputX + 8, startY + BOX_HEIGHT / 2 + 4);

    // Residual arrow continues to output
    ctx.strokeStyle = '#2A9D8F';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding + 10, residualY);
    ctx.quadraticCurveTo((startX + BOX_WIDTH / 2), residualY - 40, outputX - 10, residualY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow back from last block to residual merge
    ctx.strokeStyle = '#6B3A2A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX + totalBlockWidth, startY + BOX_HEIGHT / 2);
    ctx.lineTo(outputX - 8, startY + BOX_HEIGHT / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(outputX - 8, startY + BOX_HEIGHT / 2);
    ctx.lineTo(outputX - 13, startY + BOX_HEIGHT / 2 - 4);
    ctx.lineTo(outputX - 13, startY + BOX_HEIGHT / 2 + 4);
    ctx.closePath();
    ctx.fill();
}

export function init(containerEl) {
    if (!containerEl) return;

    numBlocks = 1;

    const html = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <button id="run-block-btn">Run Full Block</button>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                    Stack N Blocks: <span id="block-count">${numBlocks}</span>
                </label>
                <input
                    type="range"
                    id="block-slider"
                    min="1"
                    max="6"
                    value="${numBlocks}"
                    style="width: 100%; max-width: 300px;"
                />
            </div>

            <canvas id="transformerCanvas" style="
                width: 100%;
                height: auto;
            "></canvas>

            <div id="stacking-caption" style="
                display: none;
                text-align: center;
                margin-top: 1rem;
                font-style: italic;
                color: #6B3A2A;
                font-weight: 600;
            "></div>

            <div id="completion-message" style="
                display: none;
                text-align: center;
                margin-top: 2rem;
                padding: 1.5rem;
                background: #E9C46A;
                border-radius: 8px;
                border: 2px solid #6B3A2A;
            ">
                <p style="font-size: 1.3rem; margin-bottom: 0.5rem;">🍕 You just baked a Transformer!</p>
                <p style="color: #264653;">Stack 96 of these in a row and you've got GPT-4.</p>
            </div>
        </div>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#transformerCanvas');
    const runBtn = containerEl.querySelector('#run-block-btn');
    const slider = containerEl.querySelector('#block-slider');
    const blockCount = containerEl.querySelector('#block-count');
    const caption = containerEl.querySelector('#stacking-caption');
    const message = containerEl.querySelector('#completion-message');

    canvasRef = canvas;
    ctxRef = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 20;
        canvas.height = numBlocks * 150 + 60;
    }

    function draw(activeSubBlock) {
        if (!canvasRef || !ctxRef) return;
        ctxRef.clearRect(0, 0, canvasRef.width, canvasRef.height);
        for (let i = 0; i < numBlocks; i++) {
            drawTransformerBlock(canvasRef, ctxRef, i, numBlocks, activeSubBlock);
        }
    }

    slider.addEventListener('input', (e) => {
        numBlocks = parseInt(e.target.value, 10);
        blockCount.textContent = numBlocks;
        message.style.display = 'none';
        caption.style.display = 'none';

        requestAnimationFrame(() => {
            resizeCanvas();
            draw();
        });

        if (numBlocks === 6) {
            caption.style.display = 'block';
            caption.textContent = 'GPT-3 does this 96 times. GPT-4: probably 120.';
        }
    });

    async function runBlock() {
        if (isAnimating) return;
        isAnimating = true;
        runBtn.disabled = true;
        message.style.display = 'none';

        try {
            const subBlockCount = 4; // Self-Attention, Add & Norm, Feed-Forward, Add & Norm
            for (let i = 0; i < subBlockCount; i++) {
                draw(i);
                await new Promise(r => setTimeout(r, 600));
            }
            // Clear active highlight
            draw(null);
            message.style.display = 'block';
        } finally {
            runBtn.disabled = false;
            isAnimating = false;
        }
    }

    runBtn.addEventListener('click', runBlock);
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
    isAnimating = false;
}
