let canvases = [];
let ctxs = [];

const HEAD_PATTERNS = {
    'spice': [[0.9, 0.1, 0.1, 0.1], [0.1, 0.85, 0.1, 0.1], [0.1, 0.1, 0.88, 0.1], [0.1, 0.1, 0.1, 0.9]],
    'texture': [[0.5, 0.7, 0.4, 0.3], [0.7, 0.5, 0.6, 0.4], [0.4, 0.6, 0.5, 0.6], [0.3, 0.4, 0.6, 0.5]],
    'flavor': [[0.3, 0.5, 0.8, 0.6], [0.5, 0.3, 0.6, 0.8], [0.8, 0.6, 0.3, 0.5], [0.6, 0.8, 0.5, 0.3]],
    'balance': [[0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25]]
};

const HEADS_INFO = [
    { key: 'spice',   emoji: '🌶️', name: 'Spice Head',   color: '#E63946', desc: 'Spot the heat level' },
    { key: 'texture', emoji: '🧀', name: 'Texture Head',  color: '#2A9D8F', desc: 'How ingredients feel' },
    { key: 'flavor',  emoji: '🍅', name: 'Flavor Head',   color: '#E9C46A', desc: 'Taste combinations' },
    { key: 'balance', emoji: '🌿', name: 'Balance Head',  color: '#6B3A2A', desc: 'Overall harmony' }
];

const TOKENS_4 = ['crust', 'sauce', 'herbs', 'oil'];
const TOKEN_EMOJIS_4 = ['🍕', '🍅', '🌿', '🫒'];

function interpolateColor(value) {
    const cream = [255, 248, 240];
    const tomato = [230, 57, 70];
    const r = Math.round(cream[0] + (tomato[0] - cream[0]) * value);
    const g = Math.round(cream[1] + (tomato[1] - cream[1]) * value);
    const b = Math.round(cream[2] + (tomato[2] - cream[2]) * value);
    return `rgb(${r}, ${g}, ${b})`;
}

function drawHeatmap(canvas, ctx, pattern, enabled) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 28;
    const n = 4;
    const cell = Math.floor((canvas.width - pad * 2) / n);

    if (!enabled) {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#888';
        ctx.font = 'bold 13px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OFF', canvas.width / 2, canvas.height / 2);
        return;
    }

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const value = pattern[i][j];
            const x = pad + j * cell;
            const y = pad + i * cell;
            ctx.fillStyle = interpolateColor(value);
            ctx.fillRect(x, y, cell, cell);
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cell, cell);
        }
    }

    // Token labels
    ctx.fillStyle = '#264653';
    ctx.font = 'bold 9px Nunito';
    ctx.textBaseline = 'middle';
    TOKENS_4.forEach((token, i) => {
        ctx.textAlign = 'right';
        ctx.fillText(token, pad - 4, pad + i * cell + cell / 2);
        ctx.save();
        ctx.translate(pad + i * cell + cell / 2, pad - 4);
        ctx.rotate(-Math.PI / 5);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(token, 0, 0);
        ctx.restore();
    });
}

function drawCombined(canvas, ctx, activeKeys) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 28;
    const n = 4;
    const cell = Math.floor((canvas.width - pad * 2) / n);

    if (activeKeys.length === 0) {
        ctx.fillStyle = '#F4A261';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#264653';
        ctx.font = 'bold 12px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Enable at least one head!', canvas.width / 2, canvas.height / 2);
        return;
    }

    const combined = Array(n).fill(null).map(() => Array(n).fill(0));
    activeKeys.forEach(key => {
        HEAD_PATTERNS[key].forEach((row, i) => {
            row.forEach((val, j) => { combined[i][j] += val / activeKeys.length; });
        });
    });

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const x = pad + j * cell;
            const y = pad + i * cell;
            ctx.fillStyle = interpolateColor(combined[i][j]);
            ctx.fillRect(x, y, cell, cell);
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cell, cell);
            ctx.fillStyle = '#264653';
            ctx.font = 'bold 9px Nunito';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(combined[i][j].toFixed(2), x + cell / 2, y + cell / 2);
        }
    }

    ctx.fillStyle = '#264653';
    ctx.font = 'bold 9px Nunito';
    ctx.textBaseline = 'middle';
    TOKENS_4.forEach((token, i) => {
        ctx.textAlign = 'right';
        ctx.fillText(token, pad - 4, pad + i * cell + cell / 2);
        ctx.save();
        ctx.translate(pad + i * cell + cell / 2, pad - 4);
        ctx.rotate(-Math.PI / 5);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(token, 0, 0);
        ctx.restore();
    });
}

export function init(containerEl) {
    if (!containerEl) return;

    const headStates = { spice: true, texture: true, flavor: true, balance: true };
    canvases = [];
    ctxs = [];

    const html = `
        <div style="margin-bottom:1.5rem;">
            <p style="font-weight:600;margin-bottom:0.75rem;">Each head looks at a different aspect of the pizza. Toggle them on/off and watch the combined attention change:</p>

            <div id="heads-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem;margin-bottom:1.5rem;"></div>

            <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;">
                <strong style="color:#6B3A2A;">🔀 Combined Attention:</strong>
                <span id="active-count" style="background:#E9C46A;padding:0.2rem 0.75rem;border-radius:20px;font-weight:700;font-size:0.85rem;border:2px solid #6B3A2A;"></span>
            </div>
            <canvas id="combinedCanvas" style="width:100%;max-width:300px;height:auto;display:block;border:2px solid #6B3A2A;border-radius:10px;"></canvas>

            <div id="insight-box" style="margin-top:1.25rem;padding:1rem;background:#FFF8F0;border-radius:10px;border-left:4px solid #E63946;font-size:0.9rem;display:none;"></div>
        </div>
    `;

    containerEl.innerHTML = html;

    const headsGrid = containerEl.querySelector('#heads-grid');
    const combinedCanvas = containerEl.querySelector('#combinedCanvas');
    const activeCountEl = containerEl.querySelector('#active-count');
    const insightBox = containerEl.querySelector('#insight-box');

    combinedCanvas.width = 220;
    combinedCanvas.height = 220;
    const combinedCtx = combinedCanvas.getContext('2d');

    const INSIGHTS = {
        '4': '🔮 All 4 heads active — the full transformer sees everything at once.',
        '3': '🧠 3 heads combine their views — still rich, but one perspective is missing.',
        '2': '👀 2 heads — simpler, but may miss nuance.',
        '1': '🔍 Only one head — very focused, but narrow.',
        '0': '😵 No heads active — the chef is completely lost!'
    };

    function updateCombined() {
        const activeKeys = Object.entries(headStates).filter(([, v]) => v).map(([k]) => k);
        const count = activeKeys.length;
        activeCountEl.textContent = `${count} head${count !== 1 ? 's' : ''} active`;

        drawCombined(combinedCanvas, combinedCtx, activeKeys);

        const key = String(Math.min(count, 4));
        insightBox.style.display = 'block';
        insightBox.textContent = INSIGHTS[key] || '';
    }

    HEADS_INFO.forEach(({ key, emoji, name, color, desc }) => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `background:white;border-radius:10px;padding:0.85rem;border:2px solid ${color};transition:all 0.2s;`;

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;';
        header.innerHTML = `
            <span style="font-weight:700;color:#264653;font-size:0.9rem;">${emoji} ${name}</span>
            <button class="head-toggle" style="
                padding:0.2rem 0.7rem;
                background:${color};
                color:#fff;
                border:none;
                border-radius:20px;
                cursor:pointer;
                font-family:Nunito,sans-serif;
                font-weight:700;
                font-size:0.8rem;
            ">ON</button>
        `;

        const descEl = document.createElement('p');
        descEl.style.cssText = 'font-size:0.75rem;color:#777;margin-bottom:0.5rem;';
        descEl.textContent = desc;

        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        canvas.style.cssText = 'width:100%;height:auto;border-radius:6px;';

        wrapper.appendChild(header);
        wrapper.appendChild(descEl);
        wrapper.appendChild(canvas);
        headsGrid.appendChild(wrapper);

        const ctx = canvas.getContext('2d');
        drawHeatmap(canvas, ctx, HEAD_PATTERNS[key], true);
        canvases.push(canvas);
        ctxs.push(ctx);

        const toggleBtn = header.querySelector('.head-toggle');
        toggleBtn.addEventListener('click', () => {
            headStates[key] = !headStates[key];
            toggleBtn.textContent = headStates[key] ? 'ON' : 'OFF';
            toggleBtn.style.background = headStates[key] ? color : '#ccc';
            wrapper.style.opacity = headStates[key] ? '1' : '0.5';
            drawHeatmap(canvas, ctx, HEAD_PATTERNS[key], headStates[key]);
            updateCombined();
        });
    });

    requestAnimationFrame(() => {
        combinedCanvas.width = Math.min(220, combinedCanvas.parentElement.offsetWidth - 20);
        combinedCanvas.height = combinedCanvas.width;
        updateCombined();
    });

    window.addEventListener('resize', () => {
        combinedCanvas.width = Math.min(220, combinedCanvas.parentElement.offsetWidth - 20);
        combinedCanvas.height = combinedCanvas.width;
        updateCombined();
    });
}

export function reset() {
    canvases = [];
    ctxs = [];
}
