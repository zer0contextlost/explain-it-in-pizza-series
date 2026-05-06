// S5: Audio/Speech Processing 🎵
// Pizza metaphor: Customer's voice is a wave. Chef chops it into a spectrogram and reads it like text.

let canvasS5 = null;
let ctxS5 = null;
let animationIdS5 = null;
let isAnimatingS5 = false;
let currentPhase = 'idle'; // idle, waveform, spectrogram, tokens
let waveformProgress = 0;

const audioOrders = [
    { text: 'Large pepperoni', icon: '🍕' },
    { text: 'Extra cheese no olives', icon: '🧀' },
    { text: 'Surprise me', icon: '❓' },
    { text: 'Gluten free please', icon: '🌾' }
];

export function initSection5(containerEl) {
    const html = `
        <p class="section-description">
            Audio is processed like text. A sound wave becomes a spectrogram,
            which becomes tokens, which are decoded into words.
        </p>

        <p style="margin-bottom: 1.5rem; color: #666;">Click any order to process:</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            ${audioOrders.map((order, idx) => `
                <button class="audio-order-btn" data-index="${idx}" style="padding: 1rem; text-align: center; height: auto;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${order.icon}</div>
                    <div style="font-size: 0.9rem;">${order.text}</div>
                </button>
            `).join('')}
        </div>

        <div class="canvas-container">
            <canvas id="canvasS5" width="600" height="300"></canvas>
        </div>

        <div id="audioResult" style="display: none; margin-top: 1.5rem; padding: 1rem; background: #F9F6F0; border-radius: 8px;">
            <h3 style="color: var(--color-primary); margin-bottom: 0.5rem;">Transcribed Text:</h3>
            <p id="transcription" style="font-size: 1.1rem; color: var(--color-text); font-weight: 500;"></p>
        </div>

        <div class="controls" style="margin-top: 1.5rem;">
            <button id="resetBtnS5">Reset</button>
        </div>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#canvasS5');
    canvasS5 = canvas;
    ctxS5 = canvas.getContext('2d');

    const resetBtn = containerEl.querySelector('#resetBtnS5');
    const audioResult = containerEl.querySelector('#audioResult');

    // Resize canvas
    requestAnimationFrame(() => {
        const wrapper = canvas.parentElement;
        if (wrapper) {
            canvas.width = wrapper.clientWidth || 600;
            canvas.height = 300;
        }
        drawIdleS5();
    });

    containerEl.querySelectorAll('.audio-order-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (isAnimatingS5) return;

            const idx = parseInt(btn.dataset.index);
            const order = audioOrders[idx];

            containerEl.querySelectorAll('.audio-order-btn').forEach(b => {
                b.disabled = true;
            });
            resetBtn.disabled = true;
            isAnimatingS5 = true;

            try {
                await animateAudioProcessingS5(order, containerEl);
                audioResult.style.display = 'block';
                containerEl.querySelector('#transcription').textContent = order.text;
            } finally {
                containerEl.querySelectorAll('.audio-order-btn').forEach(b => {
                    b.disabled = false;
                });
                resetBtn.disabled = false;
                isAnimatingS5 = false;
            }
        });
    });

    resetBtn.addEventListener('click', () => {
        cancelAnimationFrame(animationIdS5);
        isAnimatingS5 = false;
        currentPhase = 'idle';
        waveformProgress = 0;
        audioResult.style.display = 'none';
        drawIdleS5();
        containerEl.querySelectorAll('.audio-order-btn').forEach(b => {
            b.disabled = false;
        });
        resetBtn.disabled = false;
    });

    window.addEventListener('resize', () => {
        if (canvasS5) {
            const wrapper = canvasS5.parentElement;
            if (wrapper) {
                canvasS5.width = wrapper.clientWidth || 600;
                if (currentPhase === 'idle') {
                    drawIdleS5();
                }
            }
        }
    });
}

function drawIdleS5() {
    if (!ctxS5 || !canvasS5) return;
    ctxS5.setLineDash([]);
    const width = canvasS5.width;
    const height = canvasS5.height;

    ctxS5.fillStyle = '#F9F6F0';
    ctxS5.fillRect(0, 0, width, height);

    ctxS5.fillStyle = '#999';
    ctxS5.font = '14px sans-serif';
    ctxS5.textAlign = 'center';
    ctxS5.textBaseline = 'middle';
    ctxS5.fillText('Click an order to process...', width / 2, height / 2);
}

function drawWaveformS5(progress) {
    if (!ctxS5 || !canvasS5) return;
    ctxS5.setLineDash([]);
    const width = canvasS5.width;
    const height = canvasS5.height;

    ctxS5.fillStyle = '#F9F6F0';
    ctxS5.fillRect(0, 0, width, height);

    // Draw waveform
    ctxS5.strokeStyle = '#9B59B6';
    ctxS5.lineWidth = 3;
    ctxS5.beginPath();

    for (let x = 0; x < width; x += 2) {
        const normalizedX = (x / width) * Math.PI * 4;
        const baseAmplitude = Math.sin(normalizedX) * 40;
        const frequency = 2 + (normalizedX / (Math.PI * 4)) * 3;
        const amplitude = baseAmplitude * Math.sin(normalizedX * frequency) * progress;
        const y = height / 2 - amplitude;

        if (x === 0) {
            ctxS5.moveTo(x, y);
        } else {
            ctxS5.lineTo(x, y);
        }
    }

    ctxS5.stroke();

    // Label
    ctxS5.fillStyle = '#666';
    ctxS5.font = 'bold 12px sans-serif';
    ctxS5.textAlign = 'left';
    ctxS5.fillText('Sound Wave', 20, 20);
}

function drawSpectrogramS5(progress) {
    if (!ctxS5 || !canvasS5) return;
    ctxS5.setLineDash([]);
    const width = canvasS5.width;
    const height = canvasS5.height;

    ctxS5.fillStyle = '#F9F6F0';
    ctxS5.fillRect(0, 0, width, height);

    // Draw spectrogram (frequency x time heatmap)
    const timeSteps = Math.floor(width / 20);
    const freqBands = 8;
    const cellWidth = width / timeSteps;
    const cellHeight = (height - 40) / freqBands;

    for (let t = 0; t < timeSteps; t++) {
        for (let f = 0; f < freqBands; f++) {
            const timeProgress = t / timeSteps;
            const freqProgress = 1 - f / freqBands;

            // Energy: high in middle frequencies, varies with time
            let energy = Math.sin(timeProgress * Math.PI) * freqProgress * (1 - Math.abs(freqProgress - 0.5) * 2);
            energy *= progress;

            const hue = 40 + (f / freqBands) * 20; // Cheese-color range
            const saturation = 50 + energy * 50;
            const lightness = 60 - energy * 30;

            ctxS5.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctxS5.fillRect(t * cellWidth, 20 + f * cellHeight, cellWidth, cellHeight);
        }
    }

    // Axes
    ctxS5.strokeStyle = '#999';
    ctxS5.lineWidth = 1;
    ctxS5.beginPath();
    ctxS5.moveTo(0, 20);
    ctxS5.lineTo(width, 20);
    ctxS5.lineTo(width, height);
    ctxS5.moveTo(0, 20);
    ctxS5.lineTo(0, height);
    ctxS5.stroke();

    // Labels
    ctxS5.fillStyle = '#666';
    ctxS5.font = '11px sans-serif';
    ctxS5.textAlign = 'right';
    ctxS5.fillText('Frequency', -10, 15);
    ctxS5.textAlign = 'center';
    ctxS5.fillText('Time', width / 2, height + 20);

    // Title
    ctxS5.font = 'bold 12px sans-serif';
    ctxS5.textAlign = 'left';
    ctxS5.fillText('Spectrogram', 10, 15);
}

function drawTokensS5(progress) {
    if (!ctxS5 || !canvasS5) return;
    ctxS5.setLineDash([]);
    const width = canvasS5.width;
    const height = canvasS5.height;

    ctxS5.fillStyle = '#F9F6F0';
    ctxS5.fillRect(0, 0, width, height);

    // Draw spectrogram (faded)
    const timeSteps = Math.floor(width / 20);
    const freqBands = 8;
    const cellWidth = width / timeSteps;
    const cellHeight = (height - 80) / freqBands;

    for (let t = 0; t < timeSteps; t++) {
        for (let f = 0; f < freqBands; f++) {
            const timeProgress = t / timeSteps;
            const freqProgress = 1 - f / freqBands;
            let energy = Math.sin(timeProgress * Math.PI) * freqProgress * (1 - Math.abs(freqProgress - 0.5) * 2);

            const hue = 40 + (f / freqBands) * 20;
            const saturation = 50 + energy * 50;
            const lightness = 70 - energy * 10;

            ctxS5.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctxS5.fillRect(t * cellWidth, 20 + f * cellHeight, cellWidth, cellHeight);
        }
    }

    // Draw tokens below
    ctxS5.fillStyle = 'rgba(200, 200, 200, 0.3)';
    const tokenWidth = width / 6;
    for (let i = 0; i < 6; i++) {
        ctxS5.fillRect(i * tokenWidth, height - 50, tokenWidth - 4, 40);
    }

    // Animated tokens flowing down
    const tokenHeight = height * progress;
    ctxS5.fillStyle = '#9B59B6';
    ctxS5.font = 'bold 10px sans-serif';
    ctxS5.textAlign = 'center';
    ctxS5.textBaseline = 'middle';

    for (let i = 0; i < Math.min(3, Math.floor(progress * 6)); i++) {
        const x = (i + 1) * tokenWidth - tokenWidth / 2;
        const y = 20 + freqBands * cellHeight + (tokenHeight - 20 - freqBands * cellHeight) * progress;

        ctxS5.fillStyle = '#9B59B6';
        ctxS5.fillRect(x - 20, y - 15, 40, 30);
        ctxS5.fillStyle = 'white';
        ctxS5.fillText(`T${i + 1}`, x, y);
    }

    ctxS5.fillStyle = '#666';
    ctxS5.font = '12px sans-serif';
    ctxS5.textAlign = 'left';
    ctxS5.fillText('Tokens (ready for decoder)', 10, 15);
}

async function animateAudioProcessingS5(order, containerEl) {
    return new Promise((resolve) => {
        let phase = 0;
        const phaseDuration = 800;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const totalElapsed = phase * phaseDuration + elapsed;

            if (phase === 0) {
                // Waveform phase
                const progress = Math.min(elapsed / phaseDuration, 1);
                currentPhase = 'waveform';
                waveformProgress = progress;
                drawWaveformS5(progress);

                if (elapsed > phaseDuration) {
                    phase = 1;
                    animationIdS5 = requestAnimationFrame(animate);
                } else {
                    animationIdS5 = requestAnimationFrame(animate);
                }
            } else if (phase === 1) {
                // Spectrogram phase
                const phaseElapsed = elapsed - phaseDuration;
                const progress = Math.min(phaseElapsed / phaseDuration, 1);
                currentPhase = 'spectrogram';
                drawSpectrogramS5(progress);

                if (phaseElapsed > phaseDuration) {
                    phase = 2;
                    animationIdS5 = requestAnimationFrame(animate);
                } else {
                    animationIdS5 = requestAnimationFrame(animate);
                }
            } else if (phase === 2) {
                // Tokens phase
                const phaseElapsed = elapsed - phaseDuration * 2;
                const progress = Math.min(phaseElapsed / phaseDuration, 1);
                currentPhase = 'tokens';
                drawTokensS5(progress);

                if (phaseElapsed > phaseDuration) {
                    resolve();
                } else {
                    animationIdS5 = requestAnimationFrame(animate);
                }
            }
        }

        animationIdS5 = requestAnimationFrame(animate);
    });
}
