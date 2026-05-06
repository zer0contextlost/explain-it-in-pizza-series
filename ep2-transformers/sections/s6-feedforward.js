let canvasRef = null;
let ctxRef = null;
let isAnimating = false;

const FLAVOR_DIMS = [
    { name: 'Salty',  emoji: '🧂', color: '#F4A261', default: 0.6 },
    { name: 'Spicy',  emoji: '🌶️', color: '#E63946', default: 0.3 },
    { name: 'Sweet',  emoji: '🍯', color: '#E9C46A', default: 0.2 },
    { name: 'Tangy',  emoji: '🍋', color: '#2A9D8F', default: 0.7 }
];

function relu(x) { return Math.max(0, x); }

function computeHidden(inputs, withReLU) {
    // 4 inputs → 8 hidden neurons (random fixed weights per neuron)
    const WEIGHTS = [
        [0.8, -0.4, 0.6, 0.3],
        [0.5,  0.9, -0.3, 0.7],
        [-0.2, 0.7, 0.8, -0.5],
        [0.6,  0.3, 0.5, 0.9],
        [0.9, -0.6, 0.2, 0.4],
        [-0.3, 0.8, 0.7, 0.6],
        [0.4,  0.5, -0.4, 0.8],
        [0.7,  0.2, 0.9, -0.3]
    ];
    const BIASES = [0.1, -0.2, 0.3, -0.1, 0.2, -0.3, 0.1, 0.2];
    return WEIGHTS.map((w, i) => {
        const pre = w.reduce((sum, wij, j) => sum + wij * inputs[j], BIASES[i]);
        const norm = pre / 4; // normalize
        return withReLU ? relu(norm) : norm;
    });
}

function computeOutput(hidden) {
    // 8 hidden → 4 output (compress back)
    const W2 = [
        [0.6, 0.3, 0.4, 0.5, 0.2, 0.7, 0.3, 0.5],
        [0.3, 0.7, 0.2, 0.6, 0.8, 0.1, 0.5, 0.3],
        [0.5, 0.4, 0.8, 0.2, 0.3, 0.6, 0.7, 0.2],
        [0.4, 0.5, 0.3, 0.7, 0.5, 0.4, 0.2, 0.8]
    ];
    return W2.map(w => {
        const pre = w.reduce((sum, wij, j) => sum + wij * (hidden[j] || 0), 0) / 8;
        return Math.max(0, Math.min(1, (pre + 0.3)));
    });
}

function drawNetwork(canvas, ctx, inputs, hidden, outputs, withReLU, animStep) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;
    const padX = 60;
    const layerW = (W - 2 * padX) / 2;

    // Layer x-centers
    const x0 = padX;
    const x1 = padX + layerW;
    const x2 = padX + layerW * 2;

    const r = 10;

    // Compute node positions
    function nodeY(layer, idx, total) {
        const spacing = Math.min(36, (H - 40) / (total - 1 || 1));
        const start = (H - spacing * (total - 1)) / 2;
        return start + idx * spacing;
    }

    const inputPos  = FLAVOR_DIMS.map((_, i) => ({ x: x0, y: nodeY(0, i, 4) }));
    const hiddenPos = Array(8).fill(0).map((_, i) => ({ x: x1, y: nodeY(1, i, 8) }));
    const outputPos = FLAVOR_DIMS.map((_, i) => ({ x: x2, y: nodeY(2, i, 4) }));

    // Draw connections input→hidden
    inputPos.forEach((src, si) => {
        hiddenPos.forEach((dst, di) => {
            const hVal = hidden ? hidden[di] : 0;
            const active = animStep === null || animStep >= 0;
            ctx.strokeStyle = active && hVal > 0.1 ? `rgba(230,57,70,${Math.abs(hVal) * 0.5})` : 'rgba(200,200,200,0.2)';
            ctx.lineWidth = active && hVal > 0.1 ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(src.x + r, src.y);
            ctx.lineTo(dst.x - r, dst.y);
            ctx.stroke();
        });
    });

    // Draw connections hidden→output
    hiddenPos.forEach((src, si) => {
        outputPos.forEach((dst, di) => {
            const oVal = outputs ? outputs[di] : 0;
            const active = animStep === null || animStep >= 1;
            ctx.strokeStyle = active && oVal > 0.2 ? `rgba(42,157,143,${oVal * 0.4})` : 'rgba(200,200,200,0.2)';
            ctx.lineWidth = active && oVal > 0.2 ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(src.x + r, src.y);
            ctx.lineTo(dst.x - r, dst.y);
            ctx.stroke();
        });
    });

    // Draw input nodes
    inputPos.forEach((pos, i) => {
        const val = inputs ? inputs[i] : 0;
        ctx.fillStyle = FLAVOR_DIMS[i].color;
        ctx.strokeStyle = '#6B3A2A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#264653';
        ctx.font = '9px Nunito';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(FLAVOR_DIMS[i].emoji, pos.x - r - 4, pos.y);
    });

    // Draw hidden nodes
    hiddenPos.forEach((pos, i) => {
        const val = hidden ? hidden[i] : 0;
        const isActive = val > 0.05;
        const killed = withReLU && (hidden ? (val === 0 && computeHidden(inputs || [0,0,0,0], false)[i] < 0) : false);

        if (killed) {
            ctx.fillStyle = '#bbb';
        } else if (isActive) {
            ctx.fillStyle = `rgba(230,57,70,${0.3 + Math.abs(val) * 0.7})`;
            ctx.shadowColor = 'rgba(230,57,70,0.5)';
            ctx.shadowBlur = 8;
        } else {
            ctx.fillStyle = '#E9C46A';
        }

        ctx.strokeStyle = '#6B3A2A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isActive ? r + 2 : r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.stroke();

        if (killed) {
            ctx.fillStyle = '#999';
            ctx.font = 'bold 9px Nunito';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✗', pos.x, pos.y);
        }
    });

    // Draw output nodes
    outputPos.forEach((pos, i) => {
        const val = outputs ? outputs[i] : 0;
        ctx.fillStyle = FLAVOR_DIMS[i].color;
        ctx.strokeStyle = '#6B3A2A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#264653';
        ctx.font = '9px Nunito';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(FLAVOR_DIMS[i].emoji, pos.x + r + 4, pos.y);
    });

    // Layer labels
    ctx.fillStyle = '#6B3A2A';
    ctx.font = 'bold 10px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('Input', x0, 14);
    ctx.fillText('Hidden ×8', x1, 14);
    ctx.fillText('Output', x2, 14);

    if (withReLU) {
        ctx.fillStyle = '#E63946';
        ctx.font = '9px Nunito';
        ctx.fillText('(ReLU kills negatives)', x1, 24);
    }
}

export function init(containerEl) {
    if (!containerEl) return;

    let withReLU = false;
    let inputs = FLAVOR_DIMS.map(d => d.default);
    let hidden = null;
    let outputs = null;

    const html = `
        <div style="margin-bottom:1.5rem;">
            <p style="font-weight:600;margin-bottom:0.75rem;">Set your pizza's flavor profile, then run it through the network:</p>

            <div id="flavor-sliders" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem;max-width:480px;"></div>

            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1rem;align-items:center;">
                <button id="feed-btn" style="background:#E63946;color:#fff;border:none;padding:0.5rem 1.25rem;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700;">Feed Forward! 🍕</button>
                <button id="relu-toggle" style="padding:0.5rem 1rem;border:2px solid #6B3A2A;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700;background:#fff;">ReLU: OFF</button>
            </div>

            <canvas id="feedforwardCanvas" style="width:100%;max-width:560px;height:auto;display:block;margin:0 auto;border:2px solid #E9C46A;border-radius:10px;"></canvas>

            <div id="output-bars" style="display:none;margin-top:1.25rem;padding:1rem;background:#FFF8F0;border-radius:10px;border:2px solid #F4A261;max-width:480px;"></div>

            <div id="relu-callout" style="display:none;margin-top:1rem;padding:0.75rem 1rem;background:#FDECEA;border-radius:8px;border-left:4px solid #E63946;font-size:0.9rem;max-width:480px;">
                🔥 ReLU killed negative activations (shown as ✗). The network only passes positive signals forward!
            </div>
        </div>
    `;

    containerEl.innerHTML = html;

    const slidersDiv = containerEl.querySelector('#flavor-sliders');
    const feedBtn = containerEl.querySelector('#feed-btn');
    const reluToggle = containerEl.querySelector('#relu-toggle');
    const canvas = containerEl.querySelector('#feedforwardCanvas');
    const outputBars = containerEl.querySelector('#output-bars');
    const reluCallout = containerEl.querySelector('#relu-callout');

    canvasRef = canvas;
    ctxRef = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.min(560, rect.width - 20);
        canvas.height = 280;
    }

    // Build flavor sliders
    FLAVOR_DIMS.forEach((dim, i) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'background:#fff;border-radius:8px;padding:0.6rem;border:2px solid ' + dim.color + ';';
        wrap.innerHTML = `
            <label style="display:flex;justify-content:space-between;font-weight:700;font-size:0.85rem;margin-bottom:0.3rem;">
                <span>${dim.emoji} ${dim.name}</span>
                <span id="val-${i}" style="color:${dim.color};">${Math.round(dim.default * 100)}%</span>
            </label>
            <input type="range" min="0" max="100" value="${Math.round(dim.default * 100)}"
                style="width:100%;accent-color:${dim.color};" data-dim="${i}">
        `;
        slidersDiv.appendChild(wrap);

        wrap.querySelector('input').addEventListener('input', (e) => {
            inputs[i] = parseInt(e.target.value) / 100;
            wrap.querySelector(`#val-${i}`).textContent = e.target.value + '%';
            // Redraw with current network state
            if (hidden && outputs) {
                hidden = computeHidden(inputs, withReLU);
                outputs = computeOutput(hidden);
                drawNetwork(canvas, ctxRef, inputs, hidden, outputs, withReLU, null);
                buildOutputBars(outputs);
            } else {
                drawNetwork(canvas, ctxRef, inputs, null, null, withReLU, null);
            }
        });
    });

    reluToggle.addEventListener('click', () => {
        withReLU = !withReLU;
        reluToggle.textContent = `ReLU: ${withReLU ? 'ON 🔥' : 'OFF'}`;
        reluToggle.style.background = withReLU ? '#E63946' : '#fff';
        reluToggle.style.color = withReLU ? '#fff' : '#264653';
        if (hidden) {
            hidden = computeHidden(inputs, withReLU);
            outputs = computeOutput(hidden);
            drawNetwork(canvas, ctxRef, inputs, hidden, outputs, withReLU, null);
            buildOutputBars(outputs);
            reluCallout.style.display = withReLU ? 'block' : 'none';
        } else {
            drawNetwork(canvas, ctxRef, inputs, null, null, withReLU, null);
        }
    });

    function buildOutputBars(outs) {
        outputBars.style.display = 'block';
        outputBars.innerHTML = '<p style="font-weight:700;margin-bottom:0.75rem;color:#6B3A2A;">🍕 Output flavor profile:</p>';
        const maxOut = Math.max(...outs.map(Math.abs), 0.01);
        outs.forEach((val, i) => {
            const pct = (Math.max(0, val) / maxOut) * 100;
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;';
            row.innerHTML = `
                <div style="width:65px;text-align:right;font-size:0.85rem;font-weight:600;">${FLAVOR_DIMS[i].emoji} ${FLAVOR_DIMS[i].name}</div>
                <div style="flex:1;height:22px;background:#FDEBD0;border-radius:6px;border:2px solid ${FLAVOR_DIMS[i].color};position:relative;overflow:hidden;">
                    <div style="height:100%;width:0%;background:${FLAVOR_DIMS[i].color};border-radius:4px;transition:width 0.45s ease;"></div>
                    <span style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:0.8rem;font-weight:700;color:#264653;">${(val * 100).toFixed(0)}%</span>
                </div>
            `;
            outputBars.appendChild(row);
            setTimeout(() => { row.querySelector('div > div').style.width = pct + '%'; }, 20 + i * 60);
        });
    }

    async function runFeedForward() {
        if (isAnimating) return;
        isAnimating = true;
        feedBtn.disabled = true;

        try {
            hidden = computeHidden(inputs, withReLU);
            outputs = computeOutput(hidden);

            // Animate step 0: input→hidden
            drawNetwork(canvas, ctxRef, inputs, hidden, null, withReLU, 0);
            await new Promise(r => setTimeout(r, 500));

            // Animate step 1: hidden→output
            drawNetwork(canvas, ctxRef, inputs, hidden, outputs, withReLU, 1);
            await new Promise(r => setTimeout(r, 400));

            // Full network
            drawNetwork(canvas, ctxRef, inputs, hidden, outputs, withReLU, null);
            buildOutputBars(outputs);
            reluCallout.style.display = withReLU ? 'block' : 'none';
        } finally {
            feedBtn.disabled = false;
            isAnimating = false;
        }
    }

    feedBtn.addEventListener('click', runFeedForward);
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawNetwork(canvas, ctxRef, inputs, hidden, outputs, withReLU, null);
    });

    requestAnimationFrame(() => {
        resizeCanvas();
        drawNetwork(canvas, ctxRef, inputs, null, null, withReLU, null);
    });
}

export function reset() {
    canvasRef = null;
    ctxRef = null;
    isAnimating = false;
}
