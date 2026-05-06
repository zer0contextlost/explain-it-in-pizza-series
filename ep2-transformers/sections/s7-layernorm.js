let canvases = [];
let ctxs = [];
let rafId = null;
let rawValues = [];
let normalizedValues = [];
let currentGamma = 1.0;
let currentBeta = 0.0;
let animationProgress = 0;
let isAnimating = false;

function generateRawValues() {
    return Array(16).fill(null).map(() => (Math.random() - 0.5) * 8);
}

function normalize(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance + 1e-5);
    return values.map(v => (v - mean) / std);
}

function applyGammaBeta(values, gamma, beta) {
    return values.map(v => v * gamma + beta);
}

function drawHistogram(canvas, ctx, values, title, color) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const barWidth = (canvas.width - 2 * padding) / values.length;
    const chartHeight = canvas.height - 2 * padding;
    const maxValue = Math.max(...values.map(Math.abs));
    const scale = chartHeight / (maxValue * 1.2);

    // Draw axes
    ctx.strokeStyle = '#264653';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw bars
    values.forEach((value, i) => {
        const x = padding + i * barWidth;
        const height = value * scale;
        const y = canvas.height - padding - Math.max(0, height);

        if (height >= 0) {
            ctx.fillStyle = color;
        } else {
            ctx.fillStyle = '#E63946';
        }
        ctx.fillRect(x, y, barWidth * 0.8, Math.abs(height));

        ctx.strokeStyle = '#6B3A2A';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth * 0.8, Math.abs(height));
    });

    // Title
    ctx.fillStyle = '#264653';
    ctx.font = 'bold 12px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, padding / 2);
}

export function init(containerEl) {
    if (!containerEl) return;

    rawValues = generateRawValues();
    normalizedValues = normalize(rawValues).map(v => v * currentGamma + currentBeta);

    const html = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <button id="normalize-btn">Normalize!</button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
                <div>
                    <canvas id="before-canvas" style="
                        width: 100%;
                        height: auto;
                    "></canvas>
                </div>
                <div>
                    <canvas id="after-canvas" style="
                        width: 100%;
                        height: auto;
                    "></canvas>
                </div>
            </div>

            <div style="margin: 2rem 0; padding: 1rem; background: #FFF8F0; border-radius: 8px;">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Gamma (scale): <span id="gamma-value">${currentGamma.toFixed(2)}</span>
                    </label>
                    <input
                        type="range"
                        id="gamma-slider"
                        min="0.1"
                        max="3.0"
                        step="0.1"
                        value="${currentGamma}"
                        style="width: 100%; max-width: 300px;"
                    />
                </div>

                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Beta (shift): <span id="beta-value">${currentBeta.toFixed(2)}</span>
                    </label>
                    <input
                        type="range"
                        id="beta-slider"
                        min="-2.0"
                        max="2.0"
                        step="0.1"
                        value="${currentBeta}"
                        style="width: 100%; max-width: 300px;"
                    />
                </div>
            </div>

            <details style="margin-top: 2rem;">
                <summary>Why This Matters</summary>
                <p>
                    The calibration scale ensures no single flavour dominates the others. Once balanced, the chef can fine-tune — a pinch of salt here, a touch of sweetness there.
                </p>
                <p>
                    Layer normalization rescales activations to have zero mean and unit variance.
                    This stabilizes training: gradients don't vanish or explode, and learning is consistent
                    across different parts of the network. Gamma and beta are learned parameters that let
                    the network adjust the normalized distribution if needed.
                </p>
            </details>
        </div>
    `;

    containerEl.innerHTML = html;

    const beforeCanvas = containerEl.querySelector('#before-canvas');
    const afterCanvas = containerEl.querySelector('#after-canvas');
    const normalizeBtn = containerEl.querySelector('#normalize-btn');
    const gammaSlider = containerEl.querySelector('#gamma-slider');
    const betaSlider = containerEl.querySelector('#beta-slider');
    const gammaValue = containerEl.querySelector('#gamma-value');
    const betaValue = containerEl.querySelector('#beta-value');

    beforeCanvas.width = 300;
    beforeCanvas.height = 250;
    afterCanvas.width = 300;
    afterCanvas.height = 250;

    const beforeCtx = beforeCanvas.getContext('2d');
    const afterCtx = afterCanvas.getContext('2d');

    canvases = [beforeCanvas, afterCanvas];
    ctxs = [beforeCtx, afterCtx];

    function draw() {
        drawHistogram(beforeCanvas, beforeCtx, rawValues, 'Before Normalization', '#E63946');

        const normalized = normalize(rawValues);
        const scaled = applyGammaBeta(normalized, currentGamma, currentBeta);
        drawHistogram(afterCanvas, afterCtx, scaled, 'After Normalization', '#2A9D8F');
    }

    async function animateNormalize() {
        if (isAnimating) return;
        isAnimating = true;
        normalizeBtn.disabled = true;

        try {
            const normalized = normalize(rawValues);

            for (let progress = 0; progress <= 1; progress += 0.05) {
                const interpolated = rawValues.map((v, i) => {
                    const target = normalized[i] * currentGamma + currentBeta;
                    return v + (target - v) * progress;
                });

                drawHistogram(beforeCanvas, beforeCtx, rawValues, 'Before Normalization', '#E63946');
                drawHistogram(afterCanvas, afterCtx, interpolated, 'After Normalization', '#2A9D8F');

                await new Promise(r => setTimeout(r, 30));
            }

            normalizedValues = applyGammaBeta(normalized, currentGamma, currentBeta);
        } finally {
            normalizeBtn.disabled = false;
            isAnimating = false;
        }
    }

    normalizeBtn.addEventListener('click', animateNormalize);

    gammaSlider.addEventListener('input', (e) => {
        currentGamma = parseFloat(e.target.value);
        gammaValue.textContent = currentGamma.toFixed(2);
        draw();
    });

    betaSlider.addEventListener('input', (e) => {
        currentBeta = parseFloat(e.target.value);
        betaValue.textContent = currentBeta.toFixed(2);
        draw();
    });

    window.addEventListener('resize', draw);

    // Initial draw
    requestAnimationFrame(() => {
        draw();
    });
}

export function reset() {
    canvases = [];
    ctxs = [];
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    isAnimating = false;
    currentGamma = 1.0;
    currentBeta = 0.0;
}
