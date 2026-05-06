// S7: Joint Embedding Space 🌐
// Pizza metaphor: Words, photos, sounds, and videos all filed in the SAME flavor library

let canvasS7 = null;
let ctxS7 = null;
let animationIdS7 = null;
let isAnimatingS7 = false;
let showModalities = { text: true, image: true, audio: true, video: true };
let selectedDotIdx = -1;

const embeddingDots = [
    // Pepperoni cluster
    { x: 250, y: 200, label: 'pepperoni (text)', modality: 'text', color: '#F39C12', emoji: '📝' },
    { x: 260, y: 210, label: 'pepperoni pizza (image)', modality: 'image', color: '#4A90D9', emoji: '🖼️' },
    { x: 240, y: 205, label: 'pepperoni order (audio)', modality: 'audio', color: '#9B59B6', emoji: '🎵' },
    { x: 270, y: 195, label: 'pepperoni video', modality: 'video', color: '#E74C3C', emoji: '🎬' },

    // Cheese cluster
    { x: 350, y: 150, label: 'cheese (text)', modality: 'text', color: '#F39C12', emoji: '📝' },
    { x: 360, y: 160, label: 'cheese photo (image)', modality: 'image', color: '#4A90D9', emoji: '🖼️' },
    { x: 345, y: 155, label: 'cheese pronunciation (audio)', modality: 'audio', color: '#9B59B6', emoji: '🎵' },
    { x: 365, y: 145, label: 'melting cheese (video)', modality: 'video', color: '#E74C3C', emoji: '🎬' },

    // Crust cluster
    { x: 200, y: 300, label: 'crust (text)', modality: 'text', color: '#F39C12', emoji: '📝' },
    { x: 210, y: 310, label: 'crust image (image)', modality: 'image', color: '#4A90D9', emoji: '🖼️' },
    { x: 195, y: 305, label: 'crust crunch (audio)', modality: 'audio', color: '#9B59B6', emoji: '🎵' },
    { x: 215, y: 295, label: 'baking crust (video)', modality: 'video', color: '#E74C3C', emoji: '🎬' },

    // Sauce cluster
    { x: 450, y: 250, label: 'sauce (text)', modality: 'text', color: '#F39C12', emoji: '📝' },
    { x: 460, y: 260, label: 'sauce photo (image)', modality: 'image', color: '#4A90D9', emoji: '🖼️' },
    { x: 445, y: 255, label: 'sauce taste (audio)', modality: 'audio', color: '#9B59B6', emoji: '🎵' },
    { x: 465, y: 245, label: 'sauce spreading (video)', modality: 'video', color: '#E74C3C', emoji: '🎬' }
];

export function initSection7(containerEl) {
    const html = `
        <p class="section-description">
            All modalities converge to the same space. A word, an image, a sound, a video of pepperoni
            all point to the same location in the embedding library.
        </p>

        <div class="toggle-group" style="margin-bottom: 1.5rem;">
            <button class="toggle-btn active" data-modality="text">📝 Text</button>
            <button class="toggle-btn active" data-modality="image">🖼️ Image</button>
            <button class="toggle-btn active" data-modality="audio">🎵 Audio</button>
            <button class="toggle-btn active" data-modality="video">🎬 Video</button>
        </div>

        <div class="canvas-container">
            <canvas id="canvasS7" width="600" height="400"></canvas>
        </div>

        <div id="dotInfo" style="display: none; margin-top: 1.5rem; padding: 1rem; background: #F9F6F0; border-radius: 8px;">
            <h3 id="dotLabel" style="color: var(--color-primary); margin-bottom: 0.5rem;"></h3>
            <p id="dotModality" style="color: #666;"></p>
        </div>

        <div class="controls" style="margin-top: 1.5rem;">
            <button id="findNeighborsBtn" disabled>Find Neighbors (Click a dot)</button>
            <button id="resetBtnS7">Reset</button>
        </div>

        <div class="legend" style="margin-top: 1.5rem;">
            <div class="legend-item">
                <div class="legend-color" style="background: #F39C12;"></div>
                <span>Text Embeddings</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #4A90D9;"></div>
                <span>Image Embeddings</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #9B59B6;"></div>
                <span>Audio Embeddings</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #E74C3C;"></div>
                <span>Video Embeddings</span>
            </div>
        </div>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#canvasS7');
    canvasS7 = canvas;
    ctxS7 = canvas.getContext('2d');

    const toggleBtns = containerEl.querySelectorAll('.toggle-btn');
    const findNeighborsBtn = containerEl.querySelector('#findNeighborsBtn');
    const resetBtn = containerEl.querySelector('#resetBtnS7');
    const dotInfo = containerEl.querySelector('#dotInfo');

    // Resize canvas
    requestAnimationFrame(() => {
        const wrapper = canvas.parentElement;
        if (wrapper) {
            canvas.width = wrapper.clientWidth || 600;
            canvas.height = 400;
        }
        drawScatterplotS7();
        addCanvasListeners(containerEl);
    });

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modality = btn.dataset.modality;
            showModalities[modality] = !showModalities[modality];
            btn.classList.toggle('active');
            drawScatterplotS7();
        });
    });

    findNeighborsBtn.addEventListener('click', async () => {
        if (isAnimatingS7 || selectedDotIdx === -1) return;
        findNeighborsBtn.disabled = true;
        isAnimatingS7 = true;

        try {
            await animateFindNeighborsS7();
        } finally {
            findNeighborsBtn.disabled = true;
            isAnimatingS7 = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        cancelAnimationFrame(animationIdS7);
        isAnimatingS7 = false;
        selectedDotIdx = -1;
        findNeighborsBtn.disabled = true;
        dotInfo.style.display = 'none';
        drawScatterplotS7();
    });

    window.addEventListener('resize', () => {
        if (canvasS7) {
            const wrapper = canvasS7.parentElement;
            if (wrapper) {
                canvasS7.width = wrapper.clientWidth || 600;
                drawScatterplotS7();
            }
        }
    });
}

function drawScatterplotS7() {
    if (!ctxS7 || !canvasS7) return;
    ctxS7.setLineDash([]);
    const width = canvasS7.width;
    const height = canvasS7.height;

    // Background
    ctxS7.fillStyle = '#F9F6F0';
    ctxS7.fillRect(0, 0, width, height);

    // Axes
    ctxS7.strokeStyle = '#DDD';
    ctxS7.lineWidth = 2;
    ctxS7.beginPath();
    ctxS7.moveTo(40, height - 40);
    ctxS7.lineTo(width - 20, height - 40);
    ctxS7.moveTo(40, 20);
    ctxS7.lineTo(40, height - 40);
    ctxS7.stroke();

    // Axis labels
    ctxS7.fillStyle = '#666';
    ctxS7.font = '12px sans-serif';
    ctxS7.textAlign = 'right';
    ctxS7.fillText('Dimension Y', 20, 15);
    ctxS7.textAlign = 'left';
    ctxS7.fillText('Dimension X', width - 20, height - 20);

    // Draw dots
    embeddingDots.forEach((dot, idx) => {
        if (!showModalities[dot.modality]) return;

        const radius = selectedDotIdx === idx ? 8 : 5;
        ctxS7.fillStyle = dot.color;
        ctxS7.beginPath();
        ctxS7.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctxS7.fill();

        if (selectedDotIdx === idx) {
            ctxS7.strokeStyle = dot.color;
            ctxS7.lineWidth = 3;
            ctxS7.beginPath();
            ctxS7.arc(dot.x, dot.y, radius + 4, 0, Math.PI * 2);
            ctxS7.stroke();
        }
    });
}

function addCanvasListeners(containerEl) {
    if (!canvasS7) return;

    canvasS7.addEventListener('click', (e) => {
        if (isAnimatingS7) return;

        const rect = canvasS7.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find closest dot
        let closest = -1;
        let closestDist = 30;

        embeddingDots.forEach((dot, idx) => {
            if (!showModalities[dot.modality]) return;

            const dist = Math.sqrt((dot.x - x) ** 2 + (dot.y - y) ** 2);
            if (dist < closestDist) {
                closest = idx;
                closestDist = dist;
            }
        });

        if (closest !== -1) {
            selectedDotIdx = closest;
            const dot = embeddingDots[closest];
            const dotInfo = containerEl.querySelector('#dotInfo');
            const dotLabel = containerEl.querySelector('#dotLabel');
            const dotModality = containerEl.querySelector('#dotModality');

            dotLabel.textContent = dot.label;
            dotModality.textContent = `Modality: ${dot.modality.toUpperCase()}`;
            dotInfo.style.display = 'block';

            containerEl.querySelector('#findNeighborsBtn').disabled = false;
            drawScatterplotS7();
        }
    });
}

async function animateFindNeighborsS7() {
    return new Promise((resolve) => {
        if (selectedDotIdx === -1) {
            resolve();
            return;
        }

        const selectedDot = embeddingDots[selectedDotIdx];
        const distances = embeddingDots.map((dot, idx) => ({
            idx,
            dist: Math.sqrt((dot.x - selectedDot.x) ** 2 + (dot.y - selectedDot.y) ** 2)
        }));

        distances.sort((a, b) => a.dist - b.dist);
        const neighbors = distances.slice(1, 6); // Top 5 neighbors

        let step = 0;
        const totalSteps = 20;

        function animateStep() {
            step++;
            const progress = step / totalSteps;

            // Draw base scatterplot
            if (ctxS7 && canvasS7) {
                ctxS7.setLineDash([]);
                const width = canvasS7.width;
                const height = canvasS7.height;

                ctxS7.fillStyle = '#F9F6F0';
                ctxS7.fillRect(0, 0, width, height);

                // Axes
                ctxS7.strokeStyle = '#DDD';
                ctxS7.lineWidth = 2;
                ctxS7.beginPath();
                ctxS7.moveTo(40, height - 40);
                ctxS7.lineTo(width - 20, height - 40);
                ctxS7.moveTo(40, 20);
                ctxS7.lineTo(40, height - 40);
                ctxS7.stroke();

                // Draw all dots
                embeddingDots.forEach((dot, idx) => {
                    if (!showModalities[dot.modality]) return;
                    const radius = selectedDotIdx === idx ? 8 : 5;
                    ctxS7.fillStyle = dot.color;
                    ctxS7.beginPath();
                    ctxS7.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
                    ctxS7.fill();
                    if (selectedDotIdx === idx) {
                        ctxS7.strokeStyle = dot.color;
                        ctxS7.lineWidth = 3;
                        ctxS7.beginPath();
                        ctxS7.arc(dot.x, dot.y, radius + 4, 0, Math.PI * 2);
                        ctxS7.stroke();
                    }
                });

                // Draw lines to neighbors with animation
                neighbors.forEach(neighbor => {
                    const neighborDot = embeddingDots[neighbor.idx];
                    const lineProgress = Math.max(0, progress - neighbor.idx * 0.1);

                    if (lineProgress > 0) {
                        const fromX = selectedDot.x;
                        const fromY = selectedDot.y;
                        const toX = selectedDot.x + (neighborDot.x - selectedDot.x) * lineProgress;
                        const toY = selectedDot.y + (neighborDot.y - selectedDot.y) * lineProgress;

                        ctxS7.strokeStyle = `rgba(74, 144, 217, ${lineProgress * 0.6})`;
                        ctxS7.lineWidth = 2;
                        ctxS7.setLineDash([4, 4]);
                        ctxS7.beginPath();
                        ctxS7.moveTo(fromX, fromY);
                        ctxS7.lineTo(toX, toY);
                        ctxS7.stroke();
                    }
                });
            }

            if (step < totalSteps) {
                animationIdS7 = requestAnimationFrame(animateStep);
            } else {
                resolve();
            }
        }

        animationIdS7 = requestAnimationFrame(animateStep);
    });
}
