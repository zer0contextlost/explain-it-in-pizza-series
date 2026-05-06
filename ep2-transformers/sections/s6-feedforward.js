let canvasRef = null;
let ctxRef = null;
let rafId = null;
let isAnimating = false;

const INPUT_NODES = 4;
const HIDDEN_NODES = 8;

function drawNeuralNetwork(canvas, ctx, activations, withReLU) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const nodeRadius = 12;
    const layerSpacing = (canvas.width - 2 * padding) / 2;
    const inputY = (canvas.height - (INPUT_NODES - 1) * 40) / 2;
    const hiddenY = (canvas.height - (HIDDEN_NODES - 1) * 25) / 2;
    const outputY = inputY;

    // Calculate positions
    const inputPos = [];
    for (let i = 0; i < INPUT_NODES; i++) {
        inputPos.push({ x: padding, y: inputY + i * 40 });
    }

    const hiddenPos = [];
    for (let i = 0; i < HIDDEN_NODES; i++) {
        hiddenPos.push({ x: padding + layerSpacing / 2, y: hiddenY + i * 25 });
    }

    const outputPos = [];
    for (let i = 0; i < INPUT_NODES; i++) {
        outputPos.push({ x: padding + layerSpacing, y: outputY + i * 40 });
    }

    // Draw connections
    ctx.strokeStyle = 'rgba(107, 58, 42, 0.3)';
    ctx.lineWidth = 1;

    inputPos.forEach(p1 => {
        hiddenPos.forEach(p2 => {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });
    });

    hiddenPos.forEach(p1 => {
        outputPos.forEach(p2 => {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });
    });

    // Draw nodes - Input layer
    inputPos.forEach((pos, i) => {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#2A9D8F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#264653';
        ctx.font = 'bold 11px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('i' + i, pos.x, pos.y);
    });

    // Draw nodes - Hidden layer
    hiddenPos.forEach((pos, i) => {
        const isActive = activations && activations[i] > 0.5;
        ctx.fillStyle = isActive ? '#E63946' : '#E9C46A';
        ctx.strokeStyle = '#6B3A2A';
        ctx.lineWidth = 2;

        if (isActive && withReLU) {
            ctx.shadowColor = 'rgba(230, 57, 70, 0.6)';
            ctx.shadowBlur = 10;
        }

        ctx.beginPath();
        const radius = isActive ? nodeRadius * 1.3 : nodeRadius;
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';

        ctx.fillStyle = '#264653';
        ctx.font = 'bold 10px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('h' + i, pos.x, pos.y);
    });

    // Draw nodes - Output layer
    outputPos.forEach((pos, i) => {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#F4A261';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#264653';
        ctx.font = 'bold 11px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('o' + i, pos.x, pos.y);
    });

    // Layer labels
    ctx.fillStyle = '#6B3A2A';
    ctx.font = 'bold 12px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('Input', padding, padding / 2);
    ctx.fillText('Expansion (ReLU)', padding + layerSpacing / 2, padding / 2);
    ctx.fillText('Output', padding + layerSpacing, padding / 2);
}

export function init(containerEl) {
    if (!containerEl) return;

    let withReLU = false;
    let activations = null;

    const html = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <button id="feed-btn">Feed Forward!</button>
                <button id="relu-toggle">ReLU: ${withReLU ? 'ON' : 'OFF'}</button>
            </div>

            <canvas id="feedforwardCanvas" style="
                width: 100%;
                height: auto;
                max-width: 600px;
                display: block;
                margin: 0 auto;
            "></canvas>

            <div id="ff-mode" style="margin-top: 1.5rem; display: none;">
                <p style="text-align: center; font-weight: 600; margin-bottom: 1rem;">Compare with/without ReLU</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <h4 style="text-align: center; margin-bottom: 0.5rem;">With ReLU</h4>
                        <canvas id="with-relu" style="
                            width: 100%;
                            height: auto;
                        "></canvas>
                    </div>
                    <div>
                        <h4 style="text-align: center; margin-bottom: 0.5rem;">Without ReLU</h4>
                        <canvas id="without-relu" style="
                            width: 100%;
                            height: auto;
                        "></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#feedforwardCanvas');
    const feedBtn = containerEl.querySelector('#feed-btn');
    const reluToggle = containerEl.querySelector('#relu-toggle');
    const modeDiv = containerEl.querySelector('#ff-mode');

    canvasRef = canvas;
    ctxRef = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.min(600, rect.width - 20);
        canvas.height = 400;
    }

    function draw() {
        if (!canvasRef || !ctxRef) return;
        drawNeuralNetwork(canvasRef, ctxRef, activations, withReLU);
    }

    async function animateFeedForward() {
        if (isAnimating) return;
        isAnimating = true;
        feedBtn.disabled = true;

        try {
            activations = Array(HIDDEN_NODES).fill(null).map(() => Math.random());

            for (let i = 0; i < HIDDEN_NODES; i++) {
                draw();
                await new Promise(r => setTimeout(r, 80));
            }

            await new Promise(r => setTimeout(r, 500));
            activations = null;
            draw();
        } finally {
            feedBtn.disabled = false;
            isAnimating = false;
        }
    }

    reluToggle.addEventListener('click', () => {
        withReLU = !withReLU;
        reluToggle.textContent = `ReLU: ${withReLU ? 'ON' : 'OFF'}`;
        draw();
    });

    feedBtn.addEventListener('click', animateFeedForward);

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
