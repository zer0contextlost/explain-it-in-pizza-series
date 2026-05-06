let isAnimating = false;
let rafId = null;
let round = 0;
const TOTAL_ROUNDS = 3;

function generateRawValues() {
    return Array(12).fill(null).map(() => (Math.random() - 0.3) * 10 + (Math.random() * 4));
}

function computeStats(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance + 1e-5);
    return { mean, std };
}

function normalize(values) {
    const { mean, std } = computeStats(values);
    return values.map(v => (v - mean) / std);
}

function applyGammaBeta(values, gamma, beta) {
    return values.map(v => v * gamma + beta);
}

function drawHistogram(canvas, ctx, values, title, color, showStats) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = { top: 30, bottom: 40, left: 30, right: 10 };
    const chartW = canvas.width - padding.left - padding.right;
    const chartH = canvas.height - padding.top - padding.bottom;
    const barWidth = chartW / values.length;
    const maxAbs = Math.max(...values.map(Math.abs), 1);
    const scale = (chartH / 2) / maxAbs;
    const midY = padding.top + chartH / 2;

    // Zero line
    ctx.strokeStyle = '#264653';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, midY);
    ctx.lineTo(canvas.width - padding.right, midY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.stroke();

    // Bars
    values.forEach((value, i) => {
        const x = padding.left + i * barWidth;
        const height = value * scale;
        const y = height >= 0 ? midY - height : midY;

        ctx.fillStyle = value > 0 ? color : '#E63946';
        ctx.fillRect(x + 1, y, barWidth * 0.85, Math.abs(height));
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 1, y, barWidth * 0.85, Math.abs(height));
    });

    // Title
    ctx.fillStyle = '#264653';
    ctx.font = 'bold 11px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText(title, padding.left + chartW / 2, 16);

    if (showStats) {
        const { mean, std } = computeStats(values);
        ctx.font = '9px Nunito';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#6B3A2A';
        ctx.fillText(`μ=${mean.toFixed(2)}  σ=${std.toFixed(2)}`, padding.left, canvas.height - 4);
    }
}

function stabilityScore(values) {
    const { mean, std } = computeStats(values);
    const meanPenalty = Math.abs(mean) / 5;
    const stdPenalty = Math.abs(std - 1) / 2;
    return Math.max(0, Math.min(100, Math.round((1 - meanPenalty - stdPenalty) * 100)));
}

export function init(containerEl) {
    if (!containerEl) return;

    let rawValues = generateRawValues();
    let currentGamma = 1.0;
    let currentBeta = 0.0;
    let normalized = false;
    let totalScore = 0;
    round = 0;

    const html = `
        <div style="margin-bottom:1.5rem;">
            <p style="font-weight:600;margin-bottom:0.75rem;">The chef's flavor intensities are all over the place. Normalize them so training stays stable!</p>

            <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;">
                <div id="round-badge" style="background:#E9C46A;padding:0.3rem 0.85rem;border-radius:20px;font-weight:700;font-size:0.85rem;border:2px solid #6B3A2A;"></div>
                <div id="score-badge" style="background:#2A9D8F;color:#fff;padding:0.3rem 0.85rem;border-radius:20px;font-weight:700;font-size:0.85rem;display:none;"></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
                <div>
                    <canvas id="before-canvas" style="width:100%;height:auto;border:2px solid #E63946;border-radius:8px;"></canvas>
                    <p style="text-align:center;font-size:0.8rem;color:#E63946;font-weight:700;margin-top:0.3rem;">Before 😤</p>
                </div>
                <div>
                    <canvas id="after-canvas" style="width:100%;height:auto;border:2px solid #2A9D8F;border-radius:8px;"></canvas>
                    <p style="text-align:center;font-size:0.8rem;color:#2A9D8F;font-weight:700;margin-top:0.3rem;">After 😌</p>
                </div>
            </div>

            <!-- Stability gauge -->
            <div style="margin-bottom:1.25rem;padding:0.85rem;background:#FFF8F0;border-radius:10px;border:2px solid #E9C46A;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
                    <span style="font-weight:700;font-size:0.9rem;">📊 Training Stability</span>
                    <span id="stability-val" style="font-weight:700;color:#E63946;font-size:0.95rem;">0%</span>
                </div>
                <div style="height:18px;background:#FDEBD0;border-radius:10px;border:2px solid #6B3A2A;overflow:hidden;">
                    <div id="stability-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#E63946,#E9C46A,#2A9D8F);border-radius:8px;transition:width 0.5s ease;"></div>
                </div>
            </div>

            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.25rem;">
                <button id="normalize-btn" style="background:#2A9D8F;color:#fff;border:none;padding:0.5rem 1.25rem;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700;">Normalize! 🍕</button>
                <button id="next-batch-btn" style="border:2px solid #6B3A2A;background:#fff;padding:0.5rem 1.25rem;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700;display:none;">Next Batch →</button>
            </div>

            <div style="padding:0.75rem;background:#fff;border-radius:10px;border:2px solid #E9C46A;margin-bottom:1rem;">
                <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
                    <div style="flex:1;min-width:120px;">
                        <label style="display:block;margin-bottom:0.3rem;font-weight:700;font-size:0.85rem;">
                            γ Gamma: <span id="gamma-val">1.00</span>
                        </label>
                        <input type="range" id="gamma-slider" min="0.1" max="3.0" step="0.1" value="1.0" style="width:100%;">
                    </div>
                    <div style="flex:1;min-width:120px;">
                        <label style="display:block;margin-bottom:0.3rem;font-weight:700;font-size:0.85rem;">
                            β Beta: <span id="beta-val">0.00</span>
                        </label>
                        <input type="range" id="beta-slider" min="-2.0" max="2.0" step="0.1" value="0.0" style="width:100%;">
                    </div>
                </div>
            </div>

            <div id="result-box" style="display:none;margin-top:1rem;padding:1rem;border-radius:10px;text-align:center;font-weight:700;font-size:1rem;"></div>
            <div id="final-box" style="display:none;margin-top:1rem;padding:1.25rem;background:#E9C46A;border-radius:10px;border:2px solid #6B3A2A;text-align:center;"></div>
        </div>
    `;

    containerEl.innerHTML = html;

    const beforeCanvas = containerEl.querySelector('#before-canvas');
    const afterCanvas = containerEl.querySelector('#after-canvas');
    const normalizeBtn = containerEl.querySelector('#normalize-btn');
    const nextBatchBtn = containerEl.querySelector('#next-batch-btn');
    const gammaSlider = containerEl.querySelector('#gamma-slider');
    const betaSlider = containerEl.querySelector('#beta-slider');
    const gammaValEl = containerEl.querySelector('#gamma-val');
    const betaValEl = containerEl.querySelector('#beta-val');
    const stabilityBar = containerEl.querySelector('#stability-bar');
    const stabilityVal = containerEl.querySelector('#stability-val');
    const resultBox = containerEl.querySelector('#result-box');
    const finalBox = containerEl.querySelector('#final-box');
    const roundBadge = containerEl.querySelector('#round-badge');
    const scoreBadge = containerEl.querySelector('#score-badge');

    beforeCanvas.width = 240; beforeCanvas.height = 180;
    afterCanvas.width = 240; afterCanvas.height = 180;
    const beforeCtx = beforeCanvas.getContext('2d');
    const afterCtx = afterCanvas.getContext('2d');

    function updateRoundBadge() {
        roundBadge.textContent = `Round ${round + 1} / ${TOTAL_ROUNDS}`;
    }

    function updateStability(values) {
        const score = stabilityScore(values);
        stabilityBar.style.width = score + '%';
        stabilityVal.textContent = score + '%';
        stabilityVal.style.color = score > 70 ? '#2A9D8F' : score > 40 ? '#E9C46A' : '#E63946';
    }

    function draw() {
        drawHistogram(beforeCanvas, beforeCtx, rawValues, 'Raw Activations', '#F4A261', true);
        const norm = applyGammaBeta(normalize(rawValues), currentGamma, currentBeta);
        drawHistogram(afterCanvas, afterCtx, norm, 'Normalized', '#2A9D8F', true);
        updateStability(normalized ? norm : rawValues);
    }

    gammaSlider.addEventListener('input', (e) => {
        currentGamma = parseFloat(e.target.value);
        gammaValEl.textContent = currentGamma.toFixed(2);
        if (normalized) draw();
    });
    betaSlider.addEventListener('input', (e) => {
        currentBeta = parseFloat(e.target.value);
        betaValEl.textContent = currentBeta.toFixed(2);
        if (normalized) draw();
    });

    async function runNormalize() {
        if (isAnimating) return;
        isAnimating = true;
        normalizeBtn.disabled = true;

        try {
            const norm = normalize(rawValues);
            const steps = 20;

            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const interp = rawValues.map((v, i) => v + (norm[i] * currentGamma + currentBeta - v) * t);
                drawHistogram(afterCanvas, afterCtx, interp, 'Normalizing…', '#2A9D8F', false);
                await new Promise(r => setTimeout(r, 25));
            }

            normalized = true;
            draw();

            const finalNorm = applyGammaBeta(norm, currentGamma, currentBeta);
            const score = stabilityScore(finalNorm);
            totalScore += score;

            resultBox.style.display = 'block';
            resultBox.style.background = score > 70 ? '#D4EDDA' : score > 40 ? '#FFF3CD' : '#FDECEA';
            resultBox.style.border = `2px solid ${score > 70 ? '#2A9D8F' : score > 40 ? '#E9C46A' : '#E63946'}`;
            resultBox.innerHTML = `Stability score: <span style="font-size:1.3rem;">${score}%</span> ${score > 70 ? '🏆 Stable!' : score > 40 ? '👍 Getting there' : '😬 Still shaky'}`;

            if (round + 1 < TOTAL_ROUNDS) {
                nextBatchBtn.style.display = 'inline-block';
            } else {
                const avg = Math.round(totalScore / TOTAL_ROUNDS);
                finalBox.style.display = 'block';
                finalBox.innerHTML = `
                    <p style="font-size:1.2rem;margin-bottom:0.5rem;">🎉 Challenge complete!</p>
                    <p>Average stability: <strong>${avg}%</strong></p>
                    <p style="font-size:0.9rem;margin-top:0.5rem;color:#264653;">${avg > 70 ? 'Your transformer would train smoothly!' : 'Layer norm keeps the oven at a steady temperature — practice more!'}</p>
                `;
                scoreBadge.style.display = 'inline-block';
                scoreBadge.textContent = `Avg: ${avg}%`;
            }
        } finally {
            normalizeBtn.disabled = false;
            isAnimating = false;
        }
    }

    normalizeBtn.addEventListener('click', runNormalize);

    nextBatchBtn.addEventListener('click', () => {
        round++;
        rawValues = generateRawValues();
        normalized = false;
        currentGamma = 1.0;
        currentBeta = 0.0;
        gammaSlider.value = 1.0;
        betaSlider.value = 0.0;
        gammaValEl.textContent = '1.00';
        betaValEl.textContent = '0.00';
        resultBox.style.display = 'none';
        nextBatchBtn.style.display = 'none';
        normalizeBtn.disabled = false;
        updateRoundBadge();
        drawHistogram(beforeCanvas, beforeCtx, rawValues, 'Raw Activations', '#F4A261', true);
        drawHistogram(afterCanvas, afterCtx, rawValues.map(() => 0), 'Normalized', '#2A9D8F', false);
        updateStability(rawValues);
    });

    updateRoundBadge();
    requestAnimationFrame(() => {
        draw();
    });

    window.addEventListener('resize', draw);
}

export function reset() {
    isAnimating = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    round = 0;
}
