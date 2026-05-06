// S4: Text-to-Image (Diffusion) 🎨
// Pizza metaphor: Start with TV static. Slowly wipe the static away.

let canvasS4 = null;
let ctxS4 = null;
let animationIdS4 = null;
let isAnimatingS4 = false;
let noiseData = [];
let denoisingStep = 0;
let totalDenoisingSteps = 20;

export function initSection4(containerEl) {
    const html = `
        <p class="section-description">
            A diffusion model starts with pure noise and gradually removes it,
            revealing the image that matches the description underneath.
        </p>

        <div class="input-group">
            <label for="promptS4" style="font-weight: 600;">Prompt:</label>
            <input type="text" id="promptS4" value="margherita pizza" placeholder="Describe a pizza...">
        </div>

        <div class="controls">
            <button id="denoiseBtn">Denoise (Generate)</button>
            <button id="addNoiseBtn">Add Noise (Reset)</button>
            <button id="resetBtnS4">Full Reset</button>
        </div>

        <div class="slider-container">
            <label class="slider-label">
                Denoising Step
                <span class="slider-value"><span id="stepValue">0</span> / ${totalDenoisingSteps}</span>
            </label>
            <input type="range" id="stepSlider" min="0" max="${totalDenoisingSteps}" value="0">
        </div>

        <div class="canvas-container">
            <canvas id="canvasS4" width="500" height="500"></canvas>
        </div>

        <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem; color: #666;">
            Each step removes noise and reveals structure. At step ${totalDenoisingSteps}, the pizza is complete.
        </p>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#canvasS4');
    canvasS4 = canvas;
    ctxS4 = canvas.getContext('2d');

    const denoiseBtn = containerEl.querySelector('#denoiseBtn');
    const addNoiseBtn = containerEl.querySelector('#addNoiseBtn');
    const resetBtn = containerEl.querySelector('#resetBtnS4');
    const stepSlider = containerEl.querySelector('#stepSlider');
    const stepValue = containerEl.querySelector('#stepValue');

    // Initialize noise
    initializeNoise();
    drawNoiseS4(0);

    stepSlider.addEventListener('input', (e) => {
        const step = parseInt(e.target.value);
        denoisingStep = step;
        stepValue.textContent = step;
        drawNoiseS4(step);
    });

    denoiseBtn.addEventListener('click', async () => {
        if (isAnimatingS4) return;
        denoiseBtn.disabled = true;
        addNoiseBtn.disabled = true;
        isAnimatingS4 = true;

        try {
            await animateDenoisingS4(stepSlider, stepValue);
        } finally {
            denoiseBtn.disabled = false;
            addNoiseBtn.disabled = false;
            isAnimatingS4 = false;
        }
    });

    addNoiseBtn.addEventListener('click', async () => {
        if (isAnimatingS4) return;
        denoiseBtn.disabled = true;
        addNoiseBtn.disabled = true;
        isAnimatingS4 = true;

        try {
            await animateAddNoiseS4(stepSlider, stepValue);
        } finally {
            denoiseBtn.disabled = false;
            addNoiseBtn.disabled = false;
            isAnimatingS4 = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        cancelAnimationFrame(animationIdS4);
        isAnimatingS4 = false;
        denoisingStep = 0;
        stepSlider.value = 0;
        stepValue.textContent = '0';
        initializeNoise();
        drawNoiseS4(0);
        denoiseBtn.disabled = false;
        addNoiseBtn.disabled = false;
    });

    window.addEventListener('resize', () => {
        if (canvasS4) {
            const wrapper = canvasS4.parentElement;
            if (wrapper) {
                canvasS4.width = wrapper.clientWidth || 500;
                drawNoiseS4(denoisingStep);
            }
        }
    });
}

function initializeNoise() {
    const width = canvasS4.width;
    const height = canvasS4.height;
    noiseData = Array.from({ length: width * height * 4 }, () => Math.random() * 255);
}

function drawNoiseS4(step) {
    if (!ctxS4 || !canvasS4) return;
    ctxS4.setLineDash([]);
    const width = canvasS4.width;
    const height = canvasS4.height;

    const imageData = ctxS4.createImageData(width, height);
    const data = imageData.data;

    // Interpolate between noise and a recognizable shape
    const progress = step / totalDenoisingSteps;

    for (let i = 0; i < width * height; i++) {
        const pixelIdx = i * 4;
        const x = i % width;
        const y = Math.floor(i / width);

        // Center of canvas
        const centerX = width / 2;
        const centerY = height / 2;
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        // Pizza shape (circle)
        const isInPizza = dist < width * (0.3 + progress * 0.15);

        // Color based on progress
        let r, g, b, a;

        if (progress < 0.5) {
            // Random noise
            r = noiseData[pixelIdx];
            g = noiseData[pixelIdx + 1];
            b = noiseData[pixelIdx + 2];
        } else {
            const detailProgress = (progress - 0.5) / 0.5;
            if (isInPizza) {
                // Pizza colors
                if (dist < width * (0.1 + detailProgress * 0.2)) {
                    // Center cheese
                    r = 255 - Math.random() * 30;
                    g = 180 + detailProgress * 50 - Math.random() * 20;
                    b = 50 + detailProgress * 30 - Math.random() * 20;
                } else {
                    // Sauce/crust
                    r = 220 + detailProgress * 20 - Math.random() * 20;
                    g = 80 + detailProgress * 40 - Math.random() * 20;
                    b = 40 + detailProgress * 20 - Math.random() * 20;
                }
            } else {
                // Background
                r = 255;
                g = 248;
                b = 240;
            }
        }

        data[pixelIdx] = Math.max(0, Math.min(255, r));
        data[pixelIdx + 1] = Math.max(0, Math.min(255, g));
        data[pixelIdx + 2] = Math.max(0, Math.min(255, b));
        data[pixelIdx + 3] = 255;
    }

    ctxS4.putImageData(imageData, 0, 0);

    // Draw step indicators
    ctxS4.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctxS4.font = 'bold 14px sans-serif';
    ctxS4.textAlign = 'right';
    ctxS4.textBaseline = 'bottom';
    ctxS4.fillText(`Step ${step}/${totalDenoisingSteps}`, width - 10, height - 10);

    // If done, show pizza emoji
    if (step === totalDenoisingSteps) {
        ctxS4.font = 'bold 48px sans-serif';
        ctxS4.textAlign = 'center';
        ctxS4.textBaseline = 'middle';
        ctxS4.fillText('🍕', width / 2, height / 2);
    }
}

async function animateDenoisingS4(stepSlider, stepValue) {
    return new Promise((resolve) => {
        let currentStep = denoisingStep;

        function denoisingFrame() {
            currentStep++;
            if (currentStep <= totalDenoisingSteps) {
                denoisingStep = currentStep;
                stepSlider.value = currentStep;
                stepValue.textContent = currentStep;
                drawNoiseS4(currentStep);
                animationIdS4 = requestAnimationFrame(denoisingFrame);
            } else {
                resolve();
            }
        }

        animationIdS4 = requestAnimationFrame(denoisingFrame);
    });
}

async function animateAddNoiseS4(stepSlider, stepValue) {
    return new Promise((resolve) => {
        let currentStep = denoisingStep;

        function addingNoiseFrame() {
            currentStep--;
            if (currentStep >= 0) {
                denoisingStep = currentStep;
                stepSlider.value = currentStep;
                stepValue.textContent = currentStep;
                drawNoiseS4(currentStep);
                animationIdS4 = requestAnimationFrame(addingNoiseFrame);
            } else {
                resolve();
            }
        }

        animationIdS4 = requestAnimationFrame(addingNoiseFrame);
    });
}
