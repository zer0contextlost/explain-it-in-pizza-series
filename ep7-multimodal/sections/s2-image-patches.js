// S2: Image Patches 🔲
// Pizza metaphor: Chef reads the photo by chopping it into a 4×4 grid of squares

let animationIdS2 = null;
let isAnimatingS2 = false;
let gridStep = 0;
let hoverPatchIdx = -1;
let hoverTokenIdx = -1;

export function initSection2(containerEl) {
    const html = `
        <p class="section-description">
            An image is not processed as a whole. It's divided into patches,
            each patch becomes a token, just like words in text.
        </p>

        <div style="text-align: center; margin: 2rem 0;">
            <div class="pizza-grid" id="patchGrid">
                ${Array.from({ length: 16 }, (_, i) => `
                    <div class="patch" data-index="${i}">P${i + 1}</div>
                `).join('')}
            </div>
        </div>

        <div class="controls">
            <button id="patchifyBtn">Patchify!</button>
            <button id="resetBtnS2">Reset</button>
        </div>

        <div style="margin-top: 2rem;">
            <h3 style="color: var(--color-primary); margin-bottom: 1rem;">Image Tokens</h3>
            <div class="token-row" id="imageTokenRow"></div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666; text-align: center;">
                <strong id="patchCounter">0 patches = 0 tokens</strong>
            </p>
        </div>

        <div style="margin-top: 2rem;">
            <h3 style="color: var(--color-primary); margin-bottom: 1rem;">Text Tokens (for comparison)</h3>
            <div class="token-row" id="textTokenRow">
                <span class="token">This</span>
                <span class="token">is</span>
                <span class="token">a</span>
                <span class="token">pizza</span>
            </div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666; text-align: center;">
                4 words = 4 tokens. Same structure! (Images usually have more tokens)
            </p>
        </div>
    `;

    containerEl.innerHTML = html;

    const patchifyBtn = containerEl.querySelector('#patchifyBtn');
    const resetBtn = containerEl.querySelector('#resetBtnS2');
    const patchGrid = containerEl.querySelector('#patchGrid');
    const imageTokenRow = containerEl.querySelector('#imageTokenRow');
    const patchCounter = containerEl.querySelector('#patchCounter');

    patchifyBtn.addEventListener('click', async () => {
        if (isAnimatingS2) return;
        patchifyBtn.disabled = true;
        isAnimatingS2 = true;

        try {
            await animatePatchesS2(patchGrid, imageTokenRow, patchCounter);
        } finally {
            patchifyBtn.disabled = false;
            isAnimatingS2 = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        cancelAnimationFrame(animationIdS2);
        isAnimatingS2 = false;
        gridStep = 0;
        hoverPatchIdx = -1;
        hoverTokenIdx = -1;
        patchifyBtn.disabled = false;
        imageTokenRow.innerHTML = '';
        patchCounter.textContent = '0 patches = 0 tokens';

        patchGrid.querySelectorAll('.patch').forEach(patch => {
            patch.style.transform = '';
            patch.style.opacity = '1';
            patch.classList.remove('highlight');
            patch.removeEventListener('mouseenter', null);
            patch.removeEventListener('mouseleave', null);
        });
    });
}

async function animatePatchesS2(patchGrid, imageTokenRow, patchCounter) {
    return new Promise((resolve) => {
        const patches = Array.from(patchGrid.querySelectorAll('.patch'));
        const totalAnimationTime = 1000;
        const startTime = performance.now();

        function animateFrame(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / totalAnimationTime, 1);

            patches.forEach((patch, idx) => {
                const delay = (idx / patches.length) * 0.5;
                const adjustedProgress = Math.max(0, progress - delay);
                const patchProgress = Math.min(adjustedProgress / 0.5, 1);

                if (patchProgress > 0) {
                    const offsetY = (1 - patchProgress) * 300;
                    patch.style.transform = `translateY(-${offsetY}px)`;
                    patch.style.opacity = patchProgress;
                }

                gridStep = Math.floor(progress * patches.length);
            });

            if (progress < 1) {
                animationIdS2 = requestAnimationFrame(animateFrame);
            } else {
                createTokenRow(patches, imageTokenRow, patchCounter);
                addPatchHoverListeners(patches, imageTokenRow);
                resolve();
            }
        }

        animationIdS2 = requestAnimationFrame(animateFrame);
    });
}

function createTokenRow(patches, imageTokenRow, patchCounter) {
    imageTokenRow.innerHTML = patches.map((patch, idx) => `
        <span class="token image-token" data-index="${idx}">
            Patch ${idx + 1}
        </span>
    `).join('');

    patchCounter.textContent = `${patches.length} patches = ${patches.length} tokens`;

    const tokens = imageTokenRow.querySelectorAll('.token');
    const gridPatches = Array.from(patches);

    tokens.forEach((token, idx) => {
        token.addEventListener('mouseenter', () => {
            hoverTokenIdx = idx;
            gridPatches[idx].classList.add('highlight');
            token.classList.add('highlight');
        });
        token.addEventListener('mouseleave', () => {
            hoverTokenIdx = -1;
            gridPatches[idx].classList.remove('highlight');
            token.classList.remove('highlight');
        });
    });
}

function addPatchHoverListeners(patches, imageTokenRow) {
    patches.forEach((patch, idx) => {
        patch.addEventListener('mouseenter', () => {
            hoverPatchIdx = idx;
            patch.classList.add('highlight');
            const token = imageTokenRow.querySelector(`[data-index="${idx}"]`);
            if (token) token.classList.add('highlight');
        });
        patch.addEventListener('mouseleave', () => {
            hoverPatchIdx = -1;
            patch.classList.remove('highlight');
            const token = imageTokenRow.querySelector(`[data-index="${idx}"]`);
            if (token) token.classList.remove('highlight');
        });
    });
}
