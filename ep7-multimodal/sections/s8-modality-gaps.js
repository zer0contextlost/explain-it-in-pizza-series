// S8: Modality Gaps & Failure Modes 😅
// Pizza metaphor: Vision model confidently identifies a bagel as pepperoni pizza

let isAnimatingS8 = false;
let userScore = 0;

const trickImages = [
    { emoji: '🥯', label: 'Bagel', isConfidentWrong: true, confidence: 94 },
    { emoji: '🍕', label: 'Actual Pizza', isConfidentWrong: false, confidence: 98 },
    { emoji: '🕐', label: 'Pizza Clock', isConfidentWrong: true, confidence: 87 },
    { emoji: '🧀', label: 'Cheese Wheel', isConfidentWrong: true, confidence: 72 },
    { emoji: '📺', label: 'Pizza on TV', isConfidentWrong: false, confidence: 65 },
    { emoji: '🌐', label: 'Circular Rug', isConfidentWrong: true, confidence: 45 },
    { emoji: '🛟', label: 'Donut Floatie', isConfidentWrong: true, confidence: 81 },
    { emoji: '🌮', label: 'Taco Stand Sign', isConfidentWrong: false, confidence: 12 }
];

export function initSection8(containerEl) {
    const html = `
        <p class="section-description">
            The model learns from patterns, but sometimes it finds the wrong pattern.
            Round + red + holes = pizza? Not always.
        </p>

        <div class="guess-gallery" id="guessGallery">
            ${trickImages.map((img, idx) => `
                <div class="guess-item" data-index="${idx}">
                    <span class="guess-emoji">${img.emoji}</span>
                    <span class="guess-label" style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: #666;">${img.label}</span>
                    <div class="guess-buttons">
                        <button class="guess-btn yes" data-answer="yes">Yes</button>
                        <button class="guess-btn no" data-answer="no">No</button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div id="scoreDisplay" style="margin-top: 2rem; text-align: center; display: none;">
            <h2 style="color: var(--color-primary); margin-bottom: 1rem;">Your Score</h2>
            <div class="result-display" style="font-size: 1.5rem; margin-bottom: 1rem;">
                <span id="scoreText">0</span> / ${trickImages.length} correct predictions
            </div>
            <p id="scoreMessage" style="color: #666; line-height: 1.6;"></p>
        </div>

        <div class="controls" style="margin-top: 2rem;">
            <button id="resetBtnS8">Try Again</button>
        </div>
    `;

    containerEl.innerHTML = html;

    const guessGallery = containerEl.querySelector('#guessGallery');
    const scoreDisplay = containerEl.querySelector('#scoreDisplay');
    const scoreText = containerEl.querySelector('#scoreText');
    const scoreMessage = containerEl.querySelector('#scoreMessage');
    const resetBtn = containerEl.querySelector('#resetBtnS8');

    userScore = 0;

    guessGallery.querySelectorAll('.guess-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (isAnimatingS8) return;

            const guessItem = btn.closest('.guess-item');
            const imgIdx = parseInt(guessItem.dataset.index);
            const answer = btn.dataset.answer === 'yes';
            const imgData = trickImages[imgIdx];

            const isCorrect = answer === imgData.isConfidentWrong;
            if (isCorrect) {
                userScore++;
            }

            guessItem.disabled = true;
            guessItem.querySelectorAll('.guess-btn').forEach(b => {
                b.disabled = true;
            });

            isAnimatingS8 = true;

            await showConfidenceS8(guessItem, imgData, isCorrect);

            isAnimatingS8 = false;

            // Check if all answered
            const allAnswered = Array.from(guessGallery.querySelectorAll('.guess-item')).every(item => {
                return Array.from(item.querySelectorAll('.guess-btn')).every(btn => btn.disabled);
            });

            if (allAnswered) {
                setTimeout(() => {
                    showScoreS8(scoreDisplay, scoreText, scoreMessage);
                }, 500);
            }
        });
    });

    resetBtn.addEventListener('click', () => {
        userScore = 0;
        scoreDisplay.style.display = 'none';
        guessGallery.querySelectorAll('.guess-item').forEach(item => {
            item.querySelectorAll('.guess-btn').forEach(btn => {
                btn.disabled = false;
            });
            item.querySelector('.guess-confidence')?.remove();
        });
    });
}

async function showConfidenceS8(guessItem, imgData, isCorrect) {
    return new Promise((resolve) => {
        const confidenceDiv = document.createElement('div');
        confidenceDiv.className = 'guess-confidence';
        confidenceDiv.style.marginTop = '1rem';
        confidenceDiv.innerHTML = `
            <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">
                AI says: <span style="color: ${imgData.confidence > 70 ? 'var(--color-primary)' : '#666'};">${imgData.confidence}% pizza 🍕</span>
            </div>
            <div class="confidence-bar-bg">
                <div class="confidence-bar" style="width: 0%; transition: width 0.8s ease;">
                    <span style="font-size: 0.8rem; padding-right: 0.25rem;"></span>
                </div>
            </div>
            <div style="font-size: 0.8rem; margin-top: 0.5rem; color: #666;">
                ${isCorrect ? '✓ You predicted correctly!' : '✗ The AI was wrong (or you were!)'}
            </div>
        `;

        guessItem.appendChild(confidenceDiv);

        // Animate the bar
        setTimeout(() => {
            const bar = confidenceDiv.querySelector('.confidence-bar');
            bar.style.width = imgData.confidence + '%';
        }, 100);

        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

function showScoreS8(scoreDisplay, scoreText, scoreMessage) {
    scoreDisplay.style.display = 'block';
    scoreText.textContent = userScore;

    let message = '';
    if (userScore === 8) {
        message = 'Perfect! You understand the model\'s blind spots. Not everyone caught all the failures.';
    } else if (userScore >= 6) {
        message = 'Excellent! You predicted the model\'s confusion better than most. The model sometimes sees what it expects to see.';
    } else if (userScore >= 4) {
        message = 'Good effort! The model is confident even when wrong. It has learned shape, color, and roundness — but never tasted a bagel.';
    } else if (userScore >= 2) {
        message = 'Interesting! This shows how pattern-matching can go wrong. The model saw round + red + holes, and it said pizza. It has never eaten.';
    } else {
        message = 'The model sees what it was trained to see. But confidence and correctness are not the same thing.';
    }

    scoreMessage.textContent = message;
}
