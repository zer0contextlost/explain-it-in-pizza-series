// S1: Vision Encoders 👁️
// Pizza metaphor: Chef glances at a photo and instantly translates it into embedding coordinates

let canvasS1 = null;
let ctxS1 = null;
let animationIdS1 = null;
let imageData = null;
let isAnimatingS1 = false;

const pizzaImages = [
    { emoji: '🍕', label: 'Classic Pepperoni' },
    { emoji: '🍕', label: 'Margherita' },
    { emoji: '🧀', label: 'Extra Cheese' },
    { emoji: '🫒', label: 'Olive Oil' },
    { emoji: '🌶️', label: 'Spicy' },
    { emoji: '🍄', label: 'Mushroom' }
];

export function initSection1(containerEl) {
    const html = `
        <p class="section-description">
            A photograph and a word are translated into the same mathematical space.
            Try dragging a pizza image into the scanner.
        </p>

        <div class="pizza-cards">
            ${pizzaImages.map((pizza, idx) => `
                <div class="pizza-card" draggable="true" data-index="${idx}">
                    <span class="pizza-emoji">${pizza.emoji}</span>
                    <span class="pizza-label">${pizza.label}</span>
                </div>
            `).join('')}
        </div>

        <div class="drop-zone" id="dropZoneS1">
            <div class="drop-zone-text">📸 Drop a pizza image here</div>
        </div>

        <div class="controls">
            <button id="encodeBtn" disabled>Encode Image</button>
            <button id="resetBtnS1">Reset</button>
        </div>

        <div class="canvas-container">
            <canvas id="canvasS1" width="600" height="400"></canvas>
        </div>

        <div id="resultsS1" style="display: none; margin-top: 1.5rem;">
            <h3 style="margin-bottom: 1rem; color: var(--color-primary);">Embedding Dimensions</h3>
            <div id="embeddingBars"></div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                The image is now a point in multi-dimensional space, just like the word "pepperoni".
                They are neighbors because they share semantic meaning.
            </p>
        </div>
    `;

    containerEl.innerHTML = html;

    const dropZone = containerEl.querySelector('#dropZoneS1');
    const encodeBtn = containerEl.querySelector('#encodeBtn');
    const resetBtn = containerEl.querySelector('#resetBtnS1');
    const canvas = containerEl.querySelector('#canvasS1');
    canvasS1 = canvas;

    ctxS1 = canvas.getContext('2d');

    // Resize canvas
    requestAnimationFrame(() => {
        const wrapper = canvas.parentElement;
        if (wrapper) {
            canvas.width = wrapper.clientWidth || 600;
            canvas.height = 400;
        }
        drawScatterplotS1();
    });

    // Drag and drop
    let draggedCard = null;

    containerEl.querySelectorAll('.pizza-card').forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedCard = card;
            card.style.opacity = '0.7';
        });
        card.addEventListener('dragend', (e) => {
            card.style.opacity = '1';
            draggedCard = null;
        });
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (draggedCard) {
            const label = draggedCard.querySelector('.pizza-label').textContent;
            imageData = { label, emoji: draggedCard.querySelector('.pizza-emoji').textContent };
            dropZone.innerHTML = `<div class="drop-zone-text">📸 ${imageData.emoji} ${imageData.label}</div>`;
            encodeBtn.disabled = false;
        }
    });

    encodeBtn.addEventListener('click', async () => {
        if (isAnimatingS1 || !imageData) return;
        encodeBtn.disabled = true;
        isAnimatingS1 = true;

        try {
            await animateEncodingS1(containerEl);
        } finally {
            encodeBtn.disabled = false;
            isAnimatingS1 = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        cancelAnimationFrame(animationIdS1);
        imageData = null;
        encodeBtn.disabled = true;
        isAnimatingS1 = false;
        dropZone.innerHTML = '<div class="drop-zone-text">📸 Drop a pizza image here</div>';
        dropZone.classList.remove('drag-over');
        containerEl.querySelector('#resultsS1').style.display = 'none';
        drawScatterplotS1();
    });

    window.addEventListener('resize', () => {
        if (canvasS1) {
            const wrapper = canvasS1.parentElement;
            if (wrapper) {
                canvasS1.width = wrapper.clientWidth || 600;
                drawScatterplotS1();
            }
        }
    });
}

function drawScatterplotS1() {
    if (!ctxS1 || !canvasS1) return;
    ctxS1.setLineDash([]);
    const width = canvasS1.width;
    const height = canvasS1.height;

    // Background
    ctxS1.fillStyle = '#F9F6F0';
    ctxS1.fillRect(0, 0, width, height);

    // Axes
    ctxS1.strokeStyle = '#DDD';
    ctxS1.lineWidth = 2;
    ctxS1.beginPath();
    ctxS1.moveTo(40, height - 40);
    ctxS1.lineTo(width - 20, height - 40);
    ctxS1.moveTo(40, 20);
    ctxS1.lineTo(40, height - 40);
    ctxS1.stroke();

    // Labels
    ctxS1.fillStyle = '#666';
    ctxS1.font = '12px sans-serif';
    ctxS1.textAlign = 'right';
    ctxS1.fillText('Semantic Dimension Y', 20, 15);
    ctxS1.textAlign = 'left';
    ctxS1.fillText('Semantic Dimension X', width - 20, height - 20);

    // Text embedding dots (blue)
    const textPoints = [
        { x: 150, y: 200, label: 'pepperoni', color: '#4A90D9' },
        { x: 180, y: 190, label: 'cheese', color: '#4A90D9' },
        { x: 170, y: 230, label: 'spicy', color: '#4A90D9' },
        { x: 140, y: 160, label: 'crust', color: '#4A90D9' },
        { x: 200, y: 210, label: 'sauce', color: '#4A90D9' }
    ];

    textPoints.forEach(point => {
        ctxS1.fillStyle = point.color;
        ctxS1.beginPath();
        ctxS1.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctxS1.fill();

        ctxS1.fillStyle = '#333';
        ctxS1.font = 'bold 11px sans-serif';
        ctxS1.textAlign = 'left';
        ctxS1.fillText(point.label, point.x + 8, point.y + 4);
    });

    // Image embedding dot (orange, if encoded)
    if (imageData) {
        ctxS1.fillStyle = '#FF6B35';
        ctxS1.beginPath();
        ctxS1.arc(165, 205, 7, 0, Math.PI * 2);
        ctxS1.fill();
        ctxS1.strokeStyle = '#FF6B35';
        ctxS1.lineWidth = 2;
        ctxS1.beginPath();
        ctxS1.arc(165, 205, 9, 0, Math.PI * 2);
        ctxS1.stroke();

        ctxS1.fillStyle = '#FF6B35';
        ctxS1.font = 'bold 11px sans-serif';
        ctxS1.textAlign = 'left';
        ctxS1.fillText('Image: ' + imageData.label, 175, 210);
    }

    // Legend
    ctxS1.font = '12px sans-serif';
    ctxS1.fillStyle = '#4A90D9';
    ctxS1.fillText('● Text embeddings', 50, height - 60);
    if (imageData) {
        ctxS1.fillStyle = '#FF6B35';
        ctxS1.fillText('● Image embedding', 250, height - 60);
    }
}

async function animateEncodingS1(containerEl) {
    return new Promise((resolve) => {
        let step = 0;
        const totalSteps = 30;

        function animateStep() {
            step++;
            drawScatterplotS1();

            if (step < totalSteps) {
                animationIdS1 = requestAnimationFrame(animateStep);
            } else {
                showEmbeddingBars(containerEl);
                resolve();
            }
        }

        animationIdS1 = requestAnimationFrame(animateStep);
    });
}

function showEmbeddingBars(containerEl) {
    const resultsDiv = containerEl.querySelector('#resultsS1');
    const barsDiv = containerEl.querySelector('#embeddingBars');

    const dimensionNames = [
        'Sauce Intensity', 'Crust Crunch', 'Grease Level', 'Spice Heat',
        'Cheese Pull', 'Sweetness', 'Herby-ness', 'Smoke'
    ];
    const dimensions = Array.from({ length: 8 }, (_, i) => ({
        name: dimensionNames[i],
        value: Math.random() * 100
    }));

    barsDiv.innerHTML = dimensions.map(dim => `
        <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.9rem; margin-bottom: 0.3rem; font-weight: 500;">${dim.name}</div>
            <div class="confidence-bar-bg">
                <div class="confidence-bar" style="width: ${dim.value}%; animation: slideInRight 0.5s ease;">
                    ${Math.round(dim.value)}
                </div>
            </div>
        </div>
    `).join('');

    resultsDiv.style.display = 'block';
}
