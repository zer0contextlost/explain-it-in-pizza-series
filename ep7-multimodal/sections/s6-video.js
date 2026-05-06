// S6: Video Understanding 🎬
// Pizza metaphor: Flipbook of pizza-making frames. Chef tracks what changed.

let canvasS6 = null;
let ctxS6 = null;
let animationIdS6 = null;
let isAnimatingS6 = false;
let currentFrame = 0;
let isPlayingS6 = false;

const frames = [
    { emoji: '🫓', label: 'Frame 1: Raw dough', description: 'Fresh dough ready to cook' },
    { emoji: '🍅', label: 'Frame 2: Sauce applied', description: 'Tomato sauce spread evenly' },
    { emoji: '🧀', label: 'Frame 3: Cheese added', description: 'Mozzarella distributed' },
    { emoji: '🍕', label: 'Frame 4: Pizza formed', description: 'All toppings in place' },
    { emoji: '🔥', label: 'Frame 5: Cooking', description: 'In the oven now' },
    { emoji: '✨', label: 'Frame 6: Done!', description: 'Perfect golden crust' }
];

export function initSection6(containerEl) {
    const html = `
        <p class="section-description">
            Video is a sequence of frames. The model notices what changed between frames —
            motion, growth, transformation.
        </p>

        <div class="canvas-container">
            <canvas id="canvasS6" width="600" height="300"></canvas>
        </div>

        <div class="slider-container">
            <label class="slider-label">
                Frame
                <span class="slider-value"><span id="frameNumber">1</span> / ${frames.length}</span>
            </label>
            <input type="range" id="frameScrubber" min="0" max="${frames.length - 1}" value="0">
        </div>

        <div id="frameInfo" style="margin-top: 1.5rem; padding: 1rem; background: #F9F6F0; border-radius: 8px;">
            <h3 id="frameLabel" style="color: var(--color-primary); margin-bottom: 0.5rem;"></h3>
            <p id="frameDesc" style="color: #666;"></p>
        </div>

        <div class="controls" style="margin-top: 1.5rem;">
            <button id="playBtn">Play</button>
            <button id="pauseBtn" disabled>Pause</button>
            <button id="resetBtnS6">Reset</button>
        </div>

        <div style="margin-top: 2rem; padding: 1rem; background: #F9F6F0; border-radius: 8px;">
            <h3 style="color: var(--color-primary); margin-bottom: 1rem;">Motion Detection</h3>
            <div id="motionArrows" style="font-family: var(--font-mono); color: #666; line-height: 1.8;">
                Arrows show what changed between frames →
            </div>
        </div>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#canvasS6');
    canvasS6 = canvas;
    ctxS6 = canvas.getContext('2d');

    const frameScrubber = containerEl.querySelector('#frameScrubber');
    const frameNumber = containerEl.querySelector('#frameNumber');
    const frameLabel = containerEl.querySelector('#frameLabel');
    const frameDesc = containerEl.querySelector('#frameDesc');
    const playBtn = containerEl.querySelector('#playBtn');
    const pauseBtn = containerEl.querySelector('#pauseBtn');
    const resetBtn = containerEl.querySelector('#resetBtnS6');

    // Resize canvas
    requestAnimationFrame(() => {
        const wrapper = canvas.parentElement;
        if (wrapper) {
            canvas.width = wrapper.clientWidth || 600;
            canvas.height = 300;
        }
        updateFrameS6(0, frameLabel, frameDesc);
    });

    frameScrubber.addEventListener('input', (e) => {
        if (isAnimatingS6) return;
        currentFrame = parseInt(e.target.value);
        frameNumber.textContent = currentFrame + 1;
        updateFrameS6(currentFrame, frameLabel, frameDesc);
    });

    playBtn.addEventListener('click', async () => {
        if (isAnimatingS6) return;
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        isPlayingS6 = true;
        isAnimatingS6 = true;

        try {
            await playVideoS6(frameScrubber, frameNumber, frameLabel, frameDesc, playBtn, pauseBtn);
        } finally {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            isAnimatingS6 = false;
            isPlayingS6 = false;
        }
    });

    pauseBtn.addEventListener('click', () => {
        clearTimeout(animationIdS6);
        isPlayingS6 = false;
        isAnimatingS6 = false;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    });

    resetBtn.addEventListener('click', () => {
        clearTimeout(animationIdS6);
        isAnimatingS6 = false;
        isPlayingS6 = false;
        currentFrame = 0;
        frameScrubber.value = 0;
        frameNumber.textContent = '1';
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        updateFrameS6(0, frameLabel, frameDesc);
    });

    window.addEventListener('resize', () => {
        if (canvasS6) {
            const wrapper = canvasS6.parentElement;
            if (wrapper) {
                canvasS6.width = wrapper.clientWidth || 600;
                updateFrameS6(currentFrame, frameLabel, frameDesc);
            }
        }
    });
}

function updateFrameS6(frameIdx, frameLabel, frameDesc) {
    const frame = frames[frameIdx];
    frameLabel.textContent = frame.label;
    frameDesc.textContent = frame.description;
    drawFrameS6(frameIdx);
}

function drawFrameS6(frameIdx) {
    if (!ctxS6 || !canvasS6) return;
    ctxS6.setLineDash([]);
    const width = canvasS6.width;
    const height = canvasS6.height;

    // Background
    ctxS6.fillStyle = '#F9F6F0';
    ctxS6.fillRect(0, 0, width, height);

    // Draw current frame
    const frame = frames[frameIdx];
    ctxS6.font = 'bold 80px sans-serif';
    ctxS6.textAlign = 'center';
    ctxS6.textBaseline = 'middle';
    ctxS6.fillText(frame.emoji, width / 2, height / 2);

    // Draw patches around the emoji
    const patchRadius = 40;
    const patchSize = 20;

    ctxS6.fillStyle = 'rgba(255, 107, 53, 0.3)';
    ctxS6.beginPath();
    ctxS6.arc(width / 2, height / 2, patchRadius, 0, Math.PI * 2);
    ctxS6.fill();

    // Draw motion arrows if not first frame
    if (frameIdx > 0) {
        drawMotionArrowsS6(width, height);
    }

    // Frame counter
    ctxS6.fillStyle = '#999';
    ctxS6.font = '12px sans-serif';
    ctxS6.textAlign = 'right';
    ctxS6.fillText(`Frame ${frameIdx + 1}/${frames.length}`, width - 20, height - 20);
}

function drawMotionArrowsS6(width, height) {
    if (!ctxS6) return;

    // Draw motion arrows showing change from previous frame
    ctxS6.strokeStyle = 'rgba(231, 76, 60, 0.6)';
    ctxS6.lineWidth = 2;
    ctxS6.setLineDash([4, 4]);

    // Arrows pointing inward (growth)
    const arrowPositions = [
        { fromX: width / 2 - 80, fromY: height / 2, toX: width / 2 - 40, toY: height / 2 },
        { fromX: width / 2 + 80, fromY: height / 2, toX: width / 2 + 40, toY: height / 2 },
        { fromX: width / 2, fromY: height / 2 - 80, toX: width / 2, toY: height / 2 - 40 },
        { fromX: width / 2, fromY: height / 2 + 80, toX: width / 2, toY: height / 2 + 40 }
    ];

    arrowPositions.forEach(arrow => {
        // Line
        ctxS6.beginPath();
        ctxS6.moveTo(arrow.fromX, arrow.fromY);
        ctxS6.lineTo(arrow.toX, arrow.toY);
        ctxS6.stroke();

        // Arrowhead
        const angle = Math.atan2(arrow.toY - arrow.fromY, arrow.toX - arrow.fromX);
        ctxS6.setLineDash([]);
        ctxS6.fillStyle = 'rgba(231, 76, 60, 0.8)';
        ctxS6.beginPath();
        ctxS6.moveTo(arrow.toX, arrow.toY);
        ctxS6.lineTo(arrow.toX - 8 * Math.cos(angle - Math.PI / 6), arrow.toY - 8 * Math.sin(angle - Math.PI / 6));
        ctxS6.lineTo(arrow.toX - 8 * Math.cos(angle + Math.PI / 6), arrow.toY - 8 * Math.sin(angle + Math.PI / 6));
        ctxS6.fill();
    });

    ctxS6.setLineDash([]);
}

async function playVideoS6(frameScrubber, frameNumber, frameLabel, frameDesc, playBtn, pauseBtn) {
    return new Promise((resolve) => {
        let frameIdx = currentFrame;

        function nextFrame() {
            frameIdx++;
            if (frameIdx < frames.length && isPlayingS6) {
                currentFrame = frameIdx;
                frameScrubber.value = frameIdx;
                frameNumber.textContent = frameIdx + 1;
                updateFrameS6(frameIdx, frameLabel, frameDesc);
                animationIdS6 = setTimeout(nextFrame, 800);
            } else {
                resolve();
            }
        }

        nextFrame();
    });
}
