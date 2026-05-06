let canvases = [];
let ctxs = [];
let isAnimating = false;

// Pre-computed attention patterns for each head (4x4 matrices)
const HEAD_PATTERNS = {
    'example1': {
        'spice': [[0.9, 0.3, 0.2, 0.1], [0.2, 0.85, 0.4, 0.3], [0.1, 0.3, 0.88, 0.5], [0.2, 0.1, 0.4, 0.9]],
        'texture': [[0.8, 0.5, 0.4, 0.3], [0.5, 0.7, 0.6, 0.4], [0.4, 0.6, 0.75, 0.5], [0.3, 0.4, 0.5, 0.8]],
        'flavor': [[0.7, 0.6, 0.5, 0.8], [0.6, 0.8, 0.4, 0.6], [0.5, 0.4, 0.85, 0.7], [0.8, 0.6, 0.7, 0.75]],
        'balance': [[0.6, 0.7, 0.7, 0.6], [0.7, 0.6, 0.6, 0.7], [0.7, 0.6, 0.6, 0.7], [0.6, 0.7, 0.7, 0.6]]
    },
    'example2': {
        'spice': [[0.95, 0.2, 0.1, 0.05], [0.1, 0.9, 0.3, 0.2], [0.05, 0.2, 0.92, 0.4], [0.1, 0.1, 0.3, 0.88]],
        'texture': [[0.7, 0.6, 0.5, 0.4], [0.6, 0.7, 0.6, 0.5], [0.5, 0.6, 0.7, 0.6], [0.4, 0.5, 0.6, 0.7]],
        'flavor': [[0.5, 0.7, 0.8, 0.6], [0.7, 0.5, 0.6, 0.7], [0.8, 0.6, 0.5, 0.8], [0.6, 0.7, 0.8, 0.5]],
        'balance': [[0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25]]
    },
    'example3': {
        'spice': [[0.85, 0.4, 0.3, 0.2], [0.3, 0.8, 0.5, 0.4], [0.2, 0.4, 0.9, 0.6], [0.15, 0.3, 0.5, 0.85]],
        'texture': [[0.9, 0.4, 0.3, 0.2], [0.4, 0.85, 0.5, 0.35], [0.3, 0.5, 0.8, 0.45], [0.2, 0.35, 0.45, 0.88]],
        'flavor': [[0.6, 0.5, 0.7, 0.8], [0.5, 0.7, 0.8, 0.6], [0.7, 0.8, 0.6, 0.5], [0.8, 0.6, 0.5, 0.7]],
        'balance': [[0.7, 0.5, 0.6, 0.7], [0.5, 0.7, 0.7, 0.5], [0.6, 0.7, 0.5, 0.7], [0.7, 0.5, 0.7, 0.5]]
    }
};

const HEADS_INFO = [
    { key: 'spice', emoji: '🌶️', name: 'Spice Head', color: '#E63946' },
    { key: 'texture', emoji: '🧀', name: 'Texture Head', color: '#2A9D8F' },
    { key: 'flavor', emoji: '🍅', name: 'Flavor Head', color: '#E9C46A' },
    { key: 'balance', emoji: '🌿', name: 'Balance Head', color: '#6B3A2A' }
];

const TOKENS_4 = ['crust', 'sauce', 'herbs', 'oil'];

function interpolateColor(value) {
    const cream = [255, 248, 240];
    const tomato = [230, 57, 70];
    const r = Math.round(cream[0] + (tomato[0] - cream[0]) * value);
    const g = Math.round(cream[1] + (tomato[1] - cream[1]) * value);
    const b = Math.round(cream[2] + (tomato[2] - cream[2]) * value);
    return `rgb(${r}, ${g}, ${b})`;
}

function drawHeadHeatmap(canvas, ctx, pattern) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 30;
    const cellSize = Math.floor((canvas.width - 2 * padding) / 4);

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const value = pattern[i][j];
            const x = padding + j * cellSize;
            const y = padding + i * cellSize;

            ctx.fillStyle = interpolateColor(value);
            ctx.fillRect(x, y, cellSize, cellSize);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
}

function drawCombinedHeatmap(canvas, ctx, patterns) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 30;
    const cellSize = Math.floor((canvas.width - 2 * padding) / 4);

    // Average the patterns
    const combined = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            patterns.forEach(pattern => {
                sum += pattern[i][j];
            });
            combined[i][j] = sum / patterns.length;
        }
    }

    // Draw combined
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const value = combined[i][j];
            const x = padding + j * cellSize;
            const y = padding + i * cellSize;

            ctx.fillStyle = interpolateColor(value);
            ctx.fillRect(x, y, cellSize, cellSize);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
}

export function init(containerEl) {
    if (!containerEl) return;

    let currentExample = 'example1';

    const html = `
        <div style="margin-bottom: 2rem;">
            <div style="margin-bottom: 1.5rem;">
                <p style="font-weight: 600; margin-bottom: 0.8rem;">Select example:</p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <label><input type="radio" name="example" value="example1" checked> Example 1</label>
                    <label><input type="radio" name="example" value="example2"> Example 2</label>
                    <label><input type="radio" name="example" value="example3"> Example 3</label>
                </div>
            </div>

            <div id="heads-grid" style="
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
                margin: 2rem 0;
            "></div>

            <button id="merge-btn" style="margin: 1.5rem 0;">Merge Heads</button>

            <div id="combined-container" style="display: none; margin-top: 1.5rem;">
                <h3 style="margin-bottom: 1rem;">Combined Attention</h3>
                <canvas id="combinedCanvas" style="
                    width: 100%;
                    height: auto;
                    max-width: 300px;
                    display: block;
                    margin: 0 auto;
                "></canvas>
            </div>
        </div>
    `;

    containerEl.innerHTML = html;

    const headsGrid = containerEl.querySelector('#heads-grid');
    const mergeBtn = containerEl.querySelector('#merge-btn');
    const combinedContainer = containerEl.querySelector('#combined-container');
    const radios = containerEl.querySelectorAll('input[name="example"]');

    canvases = [];
    ctxs = [];

    function drawHeads() {
        const patterns = HEAD_PATTERNS[currentExample];

        headsGrid.innerHTML = '';
        HEADS_INFO.forEach(({ key, emoji, name }) => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                background: white;
                border-radius: 8px;
                padding: 1rem;
                border: 2px solid ${HEADS_INFO.find(h => h.key === key).color};
                transition: all 0.3s ease;
            `;

            const title = document.createElement('h4');
            title.style.cssText = 'margin-bottom: 0.5rem; color: #264653;';
            title.textContent = `${emoji} ${name}`;

            const canvas = document.createElement('canvas');
            canvas.style.cssText = `
                width: 100%;
                height: auto;
                border-radius: 6px;
                background: white;
            `;
            canvas.width = 200;
            canvas.height = 200;

            wrapper.appendChild(title);
            wrapper.appendChild(canvas);
            headsGrid.appendChild(wrapper);

            const ctx = canvas.getContext('2d');
            drawHeadHeatmap(canvas, ctx, patterns[key]);

            canvases.push(canvas);
            ctxs.push(ctx);
        });
    }

    async function mergeHeads() {
        if (isAnimating) return;
        isAnimating = true;
        mergeBtn.disabled = true;

        try {
            // Shrink mini canvases
            const miniCanvases = headsGrid.querySelectorAll('canvas');
            miniCanvases.forEach(canvas => {
                canvas.style.transition = 'transform 0.5s ease';
                canvas.style.transform = 'scale(0.5)';
            });

            await new Promise(r => setTimeout(r, 600));

            // Show combined
            combinedContainer.style.display = 'block';
            const combinedCanvas = combinedContainer.querySelector('#combinedCanvas');
            const combinedCtx = combinedCanvas.getContext('2d');

            combinedCanvas.width = 200;
            combinedCanvas.height = 200;

            const patterns = Object.values(HEAD_PATTERNS[currentExample]);
            drawCombinedHeatmap(combinedCanvas, combinedCtx, patterns);

            combinedContainer.style.opacity = '0';
            combinedContainer.style.transition = 'opacity 0.3s ease';
            await new Promise(r => setTimeout(r, 10));
            combinedContainer.style.opacity = '1';
        } finally {
            isAnimating = false;
            mergeBtn.disabled = false;
        }
    }

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentExample = e.target.value;
            combinedContainer.style.display = 'none';
            mergeBtn.disabled = false;
            const miniCanvases = headsGrid.querySelectorAll('canvas');
            miniCanvases.forEach(canvas => {
                canvas.style.transform = 'scale(1)';
            });
            drawHeads();
        });
    });

    mergeBtn.addEventListener('click', mergeHeads);

    // Initial draw
    requestAnimationFrame(() => {
        drawHeads();
    });
}

export function reset() {
    canvases = [];
    ctxs = [];
    isAnimating = false;
}
