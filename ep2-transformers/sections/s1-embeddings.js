// Predefined embedding vectors for food words
const EMBEDDINGS_DICT = {
    'fresh': [0.8, 0.2, 0.6, 0.3, 0.9, 0.4],
    'basil': [0.7, 0.3, 0.8, 0.2, 0.85, 0.5],
    'on': [0.3, 0.4, 0.2, 0.1, 0.3, 0.2],
    'pizza': [0.9, 0.7, 0.85, 0.6, 0.75, 0.8],
    'pie': [0.85, 0.65, 0.8, 0.55, 0.7, 0.75],
    'cheese': [0.95, 0.8, 0.7, 0.5, 0.6, 0.85],
    'tomato': [0.6, 0.9, 0.3, 0.8, 0.4, 0.7],
    'salt': [0.4, 0.5, 0.1, 0.2, 0.3, 0.6],
    'spice': [0.5, 0.95, 0.2, 0.7, 0.5, 0.8],
    'sweet': [0.3, 0.1, 0.9, 0.4, 0.7, 0.2],
    'hot': [0.2, 0.95, 0.1, 0.5, 0.3, 0.9],
    'dough': [0.85, 0.3, 0.6, 0.7, 0.4, 0.8],
    'crust': [0.8, 0.5, 0.5, 0.75, 0.5, 0.7],
    'bake': [0.7, 0.4, 0.5, 0.6, 0.3, 0.8],
    'oven': [0.75, 0.6, 0.4, 0.7, 0.2, 0.75],
    'olive': [0.6, 0.4, 0.2, 0.3, 0.8, 0.5],
    'pepper': [0.5, 0.85, 0.3, 0.6, 0.4, 0.7],
    'garlic': [0.4, 0.7, 0.1, 0.8, 0.3, 0.6],
    'the': [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
    'a': [0.15, 0.15, 0.15, 0.15, 0.15, 0.15]
};

const DIMENSION_NAMES = ['Salty', 'Spicy', 'Sweet', 'Tangy', 'Rich', 'Fresh'];

function getEmbedding(word) {
    const normalized = word.toLowerCase().trim();
    if (EMBEDDINGS_DICT[normalized]) {
        return EMBEDDINGS_DICT[normalized];
    }
    // Random embedding for unknown words
    return Array.from({ length: 6 }, () => Math.random() * 0.8 + 0.1);
}

function createEmbeddingSvg(embedding, word) {
    const width = 120;
    const height = 100;
    const padding = 8;
    const barSpacing = (width - 2 * padding) / 6;

    let svg = `<svg class="embedding-bars" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Draw dimension name labels at top
    svg += `<text x="${width / 2}" y="12" text-anchor="middle" font-size="9" fill="#6B3A2A" font-weight="bold">${word}</text>`;

    // Draw bars
    embedding.forEach((value, idx) => {
        const x = padding + idx * barSpacing;
        const barWidth = barSpacing * 0.8;
        const maxHeight = height - 28;
        const barHeight = value * maxHeight;
        const y = height - 8 - barHeight;

        // Bar background
        svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#E63946" opacity="0.8" rx="2" ry="2"/>`;

        // Value label
        svg += `<text x="${x + barWidth / 2}" y="${height - 2}" text-anchor="middle" font-size="8" fill="#264653">${value.toFixed(2)}</text>`;
    });

    svg += `</svg>`;
    return svg;
}

export function init(containerEl) {
    if (!containerEl) return;

    const defaultText = 'fresh basil on pizza';
    let currentEmbeddings = {};

    const html = `
        <div style="margin-bottom: 2rem;">
            <div style="margin-bottom: 1rem;">
                <label for="embedding-input" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Enter words (max 8):</label>
                <input
                    type="text"
                    id="embedding-input"
                    value="${defaultText}"
                    style="
                        width: 100%;
                        padding: 0.75rem;
                        border: 2px solid #6B3A2A;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-family: 'Nunito', sans-serif;
                    "
                />
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button id="embedding-update">Update</button>
                <button id="embedding-randomize">Randomize</button>
            </div>
        </div>

        <div id="embedding-tokens" style="
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 2rem 0;
            justify-content: center;
        "></div>
    `;

    containerEl.innerHTML = html;

    const input = containerEl.querySelector('#embedding-input');
    const updateBtn = containerEl.querySelector('#embedding-update');
    const randomizeBtn = containerEl.querySelector('#embedding-randomize');
    const tokensDiv = containerEl.querySelector('#embedding-tokens');

    function updateDisplay() {
        const text = input.value.trim();
        const words = text.split(/\s+/).filter(w => w.length > 0).slice(0, 8);

        currentEmbeddings = {};
        words.forEach(word => {
            currentEmbeddings[word] = getEmbedding(word);
        });

        tokensDiv.innerHTML = '';
        words.forEach(word => {
            const embedding = currentEmbeddings[word];
            const tokenDiv = document.createElement('div');
            tokenDiv.style.cssText = 'text-align: center; flex: 0 1 auto;';
            tokenDiv.innerHTML = `
                <div class="token-pill" style="display: inline-block; margin-bottom: 0.5rem;">${word}</div>
                ${createEmbeddingSvg(embedding, '')}
            `;
            tokensDiv.appendChild(tokenDiv);
        });
    }

    function randomizeEmbeddings() {
        const words = Object.keys(currentEmbeddings);
        words.forEach(word => {
            currentEmbeddings[word] = Array.from({ length: 6 }, () => Math.random() * 0.8 + 0.1);
        });

        tokensDiv.innerHTML = '';
        words.forEach(word => {
            const embedding = currentEmbeddings[word];
            const tokenDiv = document.createElement('div');
            tokenDiv.style.cssText = 'text-align: center; flex: 0 1 auto; animation: bounce 0.6s ease-out;';
            tokenDiv.innerHTML = `
                <div class="token-pill" style="display: inline-block; margin-bottom: 0.5rem;">${word}</div>
                ${createEmbeddingSvg(embedding, '')}
            `;
            tokensDiv.appendChild(tokenDiv);
        });
    }

    updateBtn.addEventListener('click', updateDisplay);
    randomizeBtn.addEventListener('click', randomizeEmbeddings);

    // Initial display
    input.value = defaultText;
    updateDisplay();
}

export function reset() {
    // Cleanup - embeddings don't have timers
}
