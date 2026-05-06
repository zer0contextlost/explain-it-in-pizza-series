import { Narrator } from './narrator.js';
import { init as initEmbeddings, reset as resetEmbeddings } from './sections/s1-embeddings.js';
import { init as initPositional, reset as resetPositional } from './sections/s2-positional.js';
import { init as initAttention, reset as resetAttention } from './sections/s3-attention.js';
import { init as initSoftmax, reset as resetSoftmax } from './sections/s4-softmax.js';
import { init as initMultihead, reset as resetMultihead } from './sections/s5-multihead.js';
import { init as initFeedforward, reset as resetFeedforward } from './sections/s6-feedforward.js';
import { init as initLayernorm, reset as resetLayernorm } from './sections/s7-layernorm.js';
import { init as initTransformer, reset as resetTransformer } from './sections/s8-transformer-block.js';

const narrator = new Narrator();
window.narrator = narrator;

const SECTION_CONFIG = [
    { id: 1, init: initEmbeddings, reset: resetEmbeddings },
    { id: 2, init: initPositional, reset: resetPositional },
    { id: 3, init: initAttention, reset: resetAttention },
    { id: 4, init: initSoftmax, reset: resetSoftmax },
    { id: 5, init: initMultihead, reset: resetMultihead },
    { id: 6, init: initFeedforward, reset: resetFeedforward },
    { id: 7, init: initLayernorm, reset: resetLayernorm },
    { id: 8, init: initTransformer, reset: resetTransformer }
];

// Initialize sections
function initializeSections() {
    SECTION_CONFIG.forEach(({ id, init }) => {
        const containerEl = document.querySelector(`#section-${id}`);
        const contentDiv = containerEl.querySelector('.section-content');
        try {
            init(contentDiv);
        } catch (err) {
            console.error(`Error initializing section ${id}:`, err);
        }
    });
}

// Setup sound toggle
function setupSoundToggle() {
    const soundBtn = document.getElementById('soundBtn');
    soundBtn.addEventListener('click', () => {
        const enabled = narrator.toggle();
        soundBtn.textContent = enabled ? '🔊' : '🔇';
        soundBtn.title = enabled ? 'Narration enabled' : 'Narration disabled';
    });
    soundBtn.textContent = narrator.enabled ? '🔊' : '🔇';
}

// Setup intersection observer for narration and animations
function setupIntersectionObserver() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    const sectionNum = parseInt(section.dataset.section, 10);
                    if (sectionNum) {
                        narrator.speak(sectionNum);
                    }
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// Setup section tile navigation
function setupTileNavigation() {
    document.querySelectorAll('.tile').forEach(tile => {
        tile.addEventListener('click', () => {
            const sectionNum = tile.dataset.section;
            const section = document.querySelector(`#section-${sectionNum}`);
            section.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Setup hero token grid animation
function setupTokenGrid() {
    const canvas = document.getElementById('tokenGridCanvas');
    if (!canvas) return;

    let rafId = null;
    let selectedToken = null;

    const tokens = ['The', 'pizza', 'thinks', 'for', 'it', 'self'];
    const tokenPositions = [];
    let animationTime = 0;

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = 300;
    }

    function calculateTokenPositions() {
        const padding = 30;
        const availableWidth = canvas.width - 2 * padding;
        const availableHeight = canvas.height - 60;
        const cols = 3;
        const rows = 2;
        const cellWidth = availableWidth / cols;
        const cellHeight = availableHeight / rows;
        const tokenRadius = Math.min(cellWidth, cellHeight) * 0.35;

        tokenPositions.length = 0;
        tokens.forEach((token, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * cellWidth + cellWidth / 2;
            const y = padding + row * cellHeight + cellHeight / 2;
            tokenPositions.push({ x, y, radius: tokenRadius });
        });
    }

    function draw() {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setLineDash([]);

        // Draw connection lines
        ctx.strokeStyle = `rgba(230, 57, 70, ${0.15 + 0.1 * Math.sin(animationTime * 0.005)})`;
        ctx.lineWidth = 1.5;

        for (let i = 0; i < tokenPositions.length; i++) {
            for (let j = i + 1; j < tokenPositions.length; j++) {
                const p1 = tokenPositions[i];
                const p2 = tokenPositions[j];
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }

        // Draw tokens
        tokenPositions.forEach((pos, idx) => {
            const isSelected = selectedToken === idx;
            const baseColor = isSelected ? '#E63946' : '#E9C46A';
            const scale = isSelected ? 1.15 : 1;

            // Draw circle
            ctx.fillStyle = baseColor;
            ctx.strokeStyle = '#6B3A2A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, pos.radius * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw text
            ctx.fillStyle = '#264653';
            ctx.font = 'bold 14px Fredoka One';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tokens[idx], pos.x, pos.y);
        });

        animationTime++;
    }

    function animate() {
        draw();
        rafId = requestAnimationFrame(animate);
    }

    // Initial resize and start animation
    requestAnimationFrame(() => {
        resizeCanvas();
        calculateTokenPositions();
        animate();
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        calculateTokenPositions();
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < tokenPositions.length; i++) {
            const pos = tokenPositions[i];
            const dist = Math.hypot(x - pos.x, y - pos.y);
            if (dist <= pos.radius * 1.15) {
                selectedToken = selectedToken === i ? null : i;
                break;
            }
        }
    });

    return () => {
        if (rafId) cancelAnimationFrame(rafId);
        narrator.stop();
    };
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    setupSoundToggle();
    setupTileNavigation();
    setupTokenGrid();
    initializeSections();
    setupIntersectionObserver();

    // Populate narration text in sections
    SECTION_CONFIG.forEach(({ id }) => {
        const section = document.querySelector(`#section-${id}`);
        const narrationEl = section.querySelector('.section-narration');
        const narrations = {
            1: "Each word, stripped of its letters, becomes a point in a vast mathematical space. Words with similar meanings cluster together, like family recipes passed down through generations.",
            2: "Position matters profoundly. The word 'bank' near 'river' carries a different meaning entirely from 'bank' near 'money'. The kitchen must remember the order, or the recipe becomes chaos.",
            3: "Now — the true magic of the transformer. Every ingredient simultaneously asks every other: what do you mean to me? The anchovy gazes at the caper. The basil contemplates the tomato. All at once. All in parallel.",
            4: "The raw scores of attraction must be tamed. Softmax — like a strict maitre d' — forces every topping to split its attention budget. Pay more attention to one, and you must pay less to another. The mathematics of focus.",
            5: "But one perspective is never enough. Eight specialist critics examine the same pizza simultaneously — one sees texture, another sees heat, another sees color. Together they perceive what none could alone.",
            6: "After the great conversation, each ingredient retreats. Alone at its prep station, it integrates everything it has learned. This private transformation is where understanding deepens into wisdom.",
            7: "Before the next round begins, the calibration scale resets. No flavor may shout above the others. The habanero is brought to heel. The quiet basil, at last, is heard. Balance is not a compromise — it is a necessity.",
            8: "And here — assembled at last — is the full machine. Attention. Transformation. Normalisation. The original ingredient, always added back, so nothing is forgotten. Stack this twelve times, or ninety-six, and you have built the mind behind the machine."
        };
        if (narrationEl && narrations[id]) {
            narrationEl.textContent = narrations[id];
        }
    });
});
