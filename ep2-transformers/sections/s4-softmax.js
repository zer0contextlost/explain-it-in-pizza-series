let isAnimating = false;

const RAW_SCORES = [2.1, 0.8, -0.3, 1.5, 0.2];
const PAIR_LABELS = ['anchovy', 'caper', 'tomato', 'basil', 'oregano'];

function softmax(scores, temperature = 1.0) {
    const scaled = scores.map(s => s / temperature);
    const maxScore = Math.max(...scaled);
    const exps = scaled.map(s => Math.exp(s - maxScore));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sumExp);
}

export function init(containerEl) {
    if (!containerEl) return;

    let temperature = 1.0;
    let currentProbs = softmax(RAW_SCORES, temperature);

    const html = `
        <div style="margin-bottom: 2rem;">
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                    Temperature (Spice Level): <span id="temp-value">${temperature.toFixed(1)}</span>
                </label>
                <input
                    type="range"
                    id="temp-slider"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value="${temperature}"
                    style="width: 100%; max-width: 300px;"
                />
            </div>

            <div id="softmax-bars" style="
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
                margin: 1.5rem 0;
            "></div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.5rem;">
                <button id="show-math-btn">Show the Math</button>
            </div>

            <div id="math-steps" style="
                display: none;
                margin-top: 1.5rem;
                padding: 1rem;
                background: #FFF8F0;
                border-radius: 8px;
                border-left: 4px solid #E63946;
            "></div>
        </div>
    `;

    containerEl.innerHTML = html;

    const slider = containerEl.querySelector('#temp-slider');
    const tempValue = containerEl.querySelector('#temp-value');
    const barsDiv = containerEl.querySelector('#softmax-bars');
    const mathBtn = containerEl.querySelector('#show-math-btn');
    const mathSteps = containerEl.querySelector('#math-steps');

    function updateBars() {
        barsDiv.innerHTML = '';
        currentProbs.forEach((prob, idx) => {
            const barContainer = document.createElement('div');
            barContainer.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';

            const label = document.createElement('div');
            label.style.cssText = 'width: 80px; font-weight: 600; font-size: 0.9rem; text-align: right;';
            label.textContent = PAIR_LABELS[idx];

            const barWrapper = document.createElement('div');
            barWrapper.style.cssText = `
                flex: 1;
                height: 30px;
                background: #FDEBD0;
                border-radius: 6px;
                border: 2px solid #6B3A2A;
                position: relative;
                overflow: hidden;
            `;

            const bar = document.createElement('div');
            bar.style.cssText = `
                height: 100%;
                width: 0%;
                background: ${idx === 0 ? 'var(--color-tomato)' : 'var(--color-dough)'};
                transition: width 0.3s ease;
                border-radius: 4px;
            `;

            const percentLabel = document.createElement('div');
            percentLabel.style.cssText = `
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-weight: 700;
                font-size: 0.85rem;
                color: #264653;
            `;

            barWrapper.appendChild(bar);
            barWrapper.appendChild(percentLabel);

            barContainer.appendChild(label);
            barContainer.appendChild(barWrapper);
            barsDiv.appendChild(barContainer);

            // Animate width after paint
            setTimeout(() => {
                const width = prob * 100;
                bar.style.width = `${width}%`;
                percentLabel.textContent = `${(prob * 100).toFixed(1)}%`;
            }, 10);
        });
    }

    slider.addEventListener('input', (e) => {
        temperature = parseFloat(e.target.value);
        tempValue.textContent = temperature.toFixed(1);
        currentProbs = softmax(RAW_SCORES, temperature);
        updateBars();
    });

    mathBtn.addEventListener('click', async () => {
        if (isAnimating) return;
        isAnimating = true;
        mathBtn.disabled = true;

        try {
            mathSteps.style.display = 'block';

            // Step 1: Raw scores
            mathSteps.innerHTML = `
                <p><strong>Step 1: Raw Scores</strong></p>
                <p>${RAW_SCORES.map((s, i) => `${PAIR_LABELS[i]}: ${s}`).join(', ')}</p>
            `;
            await new Promise(r => setTimeout(r, 1500));

            // Step 2: Exponentiate
            const exps = RAW_SCORES.map(s => Math.exp(s / temperature));
            const maxExp = Math.max(...exps);
            const normExp = exps.map(e => e / maxExp);
            mathSteps.innerHTML += `
                <p style="margin-top: 1rem;"><strong>Step 2: Apply exp() and normalize</strong></p>
                <p>${normExp.map((e, i) => `${PAIR_LABELS[i]}: ${e.toFixed(4)}`).join(', ')}</p>
            `;
            await new Promise(r => setTimeout(r, 1500));

            // Step 3: Sum and normalize
            const sumExp = normExp.reduce((a, b) => a + b, 0);
            const final = normExp.map(e => e / sumExp);
            mathSteps.innerHTML += `
                <p style="margin-top: 1rem;"><strong>Step 3: Divide by sum</strong></p>
                <p>${final.map((p, i) => `${PAIR_LABELS[i]}: ${(p * 100).toFixed(1)}%`).join(', ')}</p>
            `;
            await new Promise(r => setTimeout(r, 1000));

            mathSteps.innerHTML += `
                <p style="margin-top: 1rem; font-style: italic; color: #6B3A2A;">
                    <strong>The point:</strong> No matter the raw scores, the probabilities always sum to 100%.
                    Attention must be split!
                </p>
            `;
        } finally {
            mathBtn.disabled = false;
            isAnimating = false;
        }
    });

    // Initial display
    updateBars();
}

export function reset() {
    isAnimating = false;
}
