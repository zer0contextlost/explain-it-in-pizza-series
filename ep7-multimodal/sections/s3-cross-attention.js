// S3: Cross-Attention 🔀
// Pizza metaphor: Text-decoder chef glances at the image-encoder chef's notes mid-sentence

let canvasS3 = null;
let ctxS3 = null;
let animationIdS3 = null;
let isAnimatingS3 = false;
let generatedWords = [];
let currentWordIdx = 0;

const generationSequence = [
    { word: 'crispy', patches: [0, 1, 2, 3] },
    { word: 'red', patches: [4, 5] },
    { word: 'loaded', patches: [8, 9, 10, 11, 12, 13, 14, 15] },
    { word: 'melted', patches: [6, 7, 10, 11] },
    { word: 'pizza', patches: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
];

export function initSection3(containerEl) {
    const html = `
        <p class="section-description">
            As words are generated, the model constantly peeks at the image patches.
            Some words look at all patches, others focus on specific parts.
        </p>

        <div class="canvas-container">
            <canvas id="canvasS3" width="800" height="400"></canvas>
        </div>

        <div class="controls">
            <button id="generateBtn">Generate Caption</button>
            <button id="resetBtnS3">Reset</button>
        </div>

        <div id="generatedCaption" style="margin-top: 1.5rem; padding: 1rem; background: #F9F6F0; border-radius: 8px; min-height: 2rem; font-size: 1.1rem; color: var(--color-text);">
            <span id="captionText"></span><span id="cursor" style="animation: blink 0.7s infinite;">|</span>
        </div>

        <div style="margin-top: 1.5rem;">
            <h3 style="color: var(--color-primary); margin-bottom: 1rem;">Click a word to see attention:</h3>
            <div id="wordButtons" class="token-row"></div>
        </div>

        <style>
            @keyframes blink {
                0%, 49% { opacity: 1; }
                50%, 100% { opacity: 0; }
            }
        </style>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#canvasS3');
    canvasS3 = canvas;
    ctxS3 = canvas.getContext('2d');

    const generateBtn = containerEl.querySelector('#generateBtn');
    const resetBtn = containerEl.querySelector('#resetBtnS3');
    const captionText = containerEl.querySelector('#captionText');
    const cursor = containerEl.querySelector('#cursor');
    const wordButtons = containerEl.querySelector('#wordButtons');

    // Resize canvas
    requestAnimationFrame(() => {
        const wrapper = canvas.parentElement;
        if (wrapper) {
            canvas.width = wrapper.clientWidth || 800;
            canvas.height = 400;
        }
        drawBaselineS3();
    });

    generateBtn.addEventListener('click', async () => {
        if (isAnimatingS3) return;
        generateBtn.disabled = true;
        isAnimatingS3 = true;

        try {
            await animateGenerationS3(captionText, cursor, wordButtons, containerEl);
        } finally {
            generateBtn.disabled = false;
            isAnimatingS3 = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        cancelAnimationFrame(animationIdS3);
        isAnimatingS3 = false;
        generateBtn.disabled = false;
        currentWordIdx = 0;
        generatedWords = [];
        captionText.textContent = '';
        cursor.style.display = 'inline';
        wordButtons.innerHTML = '';
        drawBaselineS3();
    });

    window.addEventListener('resize', () => {
        if (canvasS3) {
            const wrapper = canvasS3.parentElement;
            if (wrapper) {
                canvasS3.width = wrapper.clientWidth || 800;
                drawBaselineS3();
            }
        }
    });
}

function drawBaselineS3() {
    if (!ctxS3 || !canvasS3) return;
    ctxS3.setLineDash([]);
    const width = canvasS3.width;
    const height = canvasS3.height;

    // Background
    ctxS3.fillStyle = '#F9F6F0';
    ctxS3.fillRect(0, 0, width, height);

    // Left side: image patches
    const patchSize = 30;
    const patchSpacing = 35;
    const patchStartX = 20;
    const patchStartY = 80;

    ctxS3.fillStyle = '#4A90D9';
    ctxS3.font = 'bold 10px sans-serif';
    ctxS3.textAlign = 'center';
    ctxS3.fillStyle = '#666';
    ctxS3.fillText('Image Patches', patchStartX + 50, 30);

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const x = patchStartX + j * patchSpacing;
            const y = patchStartY + i * patchSpacing;
            ctxS3.fillStyle = '#FF6B35';
            ctxS3.fillRect(x, y, patchSize, patchSize);
            ctxS3.fillStyle = 'white';
            ctxS3.font = 'bold 8px sans-serif';
            ctxS3.textAlign = 'center';
            ctxS3.fillText('P' + (i * 4 + j + 1), x + patchSize / 2, y + patchSize / 2 + 3);
        }
    }

    // Right side: text generation
    ctxS3.fillStyle = '#666';
    ctxS3.font = 'bold 12px sans-serif';
    ctxS3.textAlign = 'left';
    ctxS3.fillText('Text Generation', width / 2 + 40, 30);

    // Divider line
    ctxS3.strokeStyle = '#DDD';
    ctxS3.lineWidth = 2;
    ctxS3.beginPath();
    ctxS3.moveTo(width / 2, 20);
    ctxS3.lineTo(width / 2, height - 20);
    ctxS3.stroke();
}

function drawAttentionArrows(wordIdx) {
    if (!ctxS3 || !canvasS3) return;
    ctxS3.setLineDash([]);
    drawBaselineS3();

    const wordData = generationSequence[wordIdx];
    if (!wordData) return;

    const width = canvasS3.width;
    const height = canvasS3.height;
    const patchSize = 30;
    const patchSpacing = 35;
    const patchStartX = 20;
    const patchStartY = 80;

    // Draw arrows from patches to word on right
    const wordX = width / 2 + 100;
    const wordY = height / 2;

    wordData.patches.forEach(patchIdx => {
        const row = Math.floor(patchIdx / 4);
        const col = patchIdx % 4;
        const patchX = patchStartX + col * patchSpacing + patchSize / 2;
        const patchY = patchStartY + row * patchSpacing + patchSize / 2;

        ctxS3.strokeStyle = 'rgba(74, 144, 217, 0.6)';
        ctxS3.lineWidth = 2;
        ctxS3.setLineDash([4, 4]);

        ctxS3.beginPath();
        ctxS3.moveTo(patchX, patchY);

        // Curved line
        const controlX = (patchX + wordX) / 2;
        const controlY = (patchY + wordY) / 2 + (Math.random() - 0.5) * 40;
        ctxS3.quadraticCurveTo(controlX, controlY, wordX, wordY);
        ctxS3.stroke();

        // Arrowhead
        ctxS3.setLineDash([]);
        const angle = Math.atan2(wordY - controlY, wordX - controlX);
        ctxS3.fillStyle = 'rgba(74, 144, 217, 0.8)';
        ctxS3.beginPath();
        ctxS3.moveTo(wordX, wordY);
        ctxS3.lineTo(wordX - 8 * Math.cos(angle - Math.PI / 6), wordY - 8 * Math.sin(angle - Math.PI / 6));
        ctxS3.lineTo(wordX - 8 * Math.cos(angle + Math.PI / 6), wordY - 8 * Math.sin(angle + Math.PI / 6));
        ctxS3.fill();
    });

    // Draw the word
    ctxS3.fillStyle = '#FF6B35';
    ctxS3.beginPath();
    ctxS3.arc(wordX, wordY, 25, 0, Math.PI * 2);
    ctxS3.fill();

    ctxS3.fillStyle = 'white';
    ctxS3.font = 'bold 14px sans-serif';
    ctxS3.textAlign = 'center';
    ctxS3.textBaseline = 'middle';
    ctxS3.fillText(wordData.word, wordX, wordY);

    // Show attention strength
    ctxS3.fillStyle = '#666';
    ctxS3.font = '12px sans-serif';
    ctxS3.textAlign = 'center';
    ctxS3.fillText(`Attending to ${wordData.patches.length} patches`, width / 2 + 100, height - 30);
}

async function animateGenerationS3(captionText, cursor, wordButtons, containerEl) {
    return new Promise((resolve) => {
        generatedWords = [];
        let wordIdx = 0;

        function generateNextWord() {
            if (wordIdx >= generationSequence.length) {
                cursor.style.display = 'none';
                showWordButtons(containerEl, generationSequence);
                resolve();
                return;
            }

            const wordData = generationSequence[wordIdx];
            generatedWords.push(wordData.word);

            // Animate this word being generated
            let charIdx = 0;
            const word = wordData.word;

            function addChar() {
                if (charIdx < word.length) {
                    captionText.textContent += word[charIdx];
                    charIdx++;
                    animationIdS3 = setTimeout(addChar, 50);
                } else {
                    captionText.textContent += ' ';
                    wordIdx++;
                    animationIdS3 = setTimeout(generateNextWord, 300);
                }
            }

            addChar();
        }

        generateNextWord();
    });
}

function showWordButtons(containerEl, sequence) {
    const wordButtons = containerEl.querySelector('#wordButtons');
    wordButtons.innerHTML = sequence.map((item, idx) => `
        <span class="token" data-word-idx="${idx}">${item.word}</span>
    `).join('');

    wordButtons.querySelectorAll('.token').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.wordIdx);
            wordButtons.querySelectorAll('.token').forEach(b => b.classList.remove('highlight'));
            btn.classList.add('highlight');
            drawAttentionArrows(idx);
        });
    });
}
