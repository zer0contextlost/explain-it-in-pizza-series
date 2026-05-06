let canvasRef = null;
let ctxRef = null;

const ATTENTION_SCORES = [
    [0.95, 0.30, 0.40, 0.50, 0.20, 0.60],
    [0.20, 0.85, 0.70, 0.30, 0.40, 0.50],
    [0.40, 0.60, 0.90, 0.50, 0.30, 0.40],
    [0.50, 0.20, 0.40, 0.88, 0.60, 0.70],
    [0.30, 0.50, 0.20, 0.60, 0.92, 0.40],
    [0.60, 0.40, 0.50, 0.70, 0.30, 0.87]
];

const TOKENS = ['anchovy', 'basil', 'caper', 'olive', 'garlic', 'tomato'];
const TOKEN_EMOJIS = ['🐟', '🌿', '🫒', '🫒', '🧄', '🍅'];

const QUIZ_DATA = [
    {
        from: 1,
        question: '🌿 BASIL is attending — which ingredient scores highest?',
        correctIdx: 2,
        options: [0, 2, 4, 5],
        explanation: 'Basil → Caper scores 0.70. They share Mediterranean origins.'
    },
    {
        from: 4,
        question: '🧄 What does GARLIC focus on most strongly?',
        correctIdx: 3,
        options: [1, 2, 3, 5],
        explanation: 'Garlic → Olive scores 0.60. Classic pizza base pairing.'
    },
    {
        from: 5,
        question: '🍅 Which ingredient does TOMATO attend to above all?',
        correctIdx: 3,
        options: [0, 2, 3, 4],
        explanation: 'Tomato → Olive scores 0.70. Olive oil brings them together.'
    }
];

function interpolateColor(value) {
    const cream = [255, 248, 240];
    const cheese = [233, 196, 106];
    const tomato = [230, 57, 70];
    let r, g, b;
    if (value < 0.5) {
        const t = value * 2;
        r = Math.round(cream[0] + (cheese[0] - cream[0]) * t);
        g = Math.round(cream[1] + (cheese[1] - cream[1]) * t);
        b = Math.round(cream[2] + (cheese[2] - cream[2]) * t);
    } else {
        const t = (value - 0.5) * 2;
        r = Math.round(cheese[0] + (tomato[0] - cheese[0]) * t);
        g = Math.round(cheese[1] + (tomato[1] - cheese[1]) * t);
        b = Math.round(cheese[2] + (tomato[2] - cheese[2]) * t);
    }
    return `rgb(${r}, ${g}, ${b})`;
}

function drawAttentionHeatmap(canvas, ctx, selectedToken) {
    ctx.setLineDash([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 55;
    const cellSize = Math.floor((canvas.width - 2 * padding) / 6);
    const size = 6 * cellSize;

    for (let from = 0; from < 6; from++) {
        for (let to = 0; to < 6; to++) {
            const value = ATTENTION_SCORES[from][to];
            const x = padding + to * cellSize;
            const y = padding + from * cellSize;
            const opacity = (selectedToken !== null && from !== selectedToken) ? 0.2 : 1;

            ctx.globalAlpha = opacity;
            ctx.fillStyle = interpolateColor(value);
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.globalAlpha = 1;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);

            if (selectedToken === from) {
                ctx.fillStyle = '#264653';
                ctx.font = 'bold 9px Nunito';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(value.toFixed(2), x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    // Highlight selected row outline
    if (selectedToken !== null) {
        ctx.strokeStyle = '#E63946';
        ctx.lineWidth = 3;
        ctx.strokeRect(padding, padding + selectedToken * cellSize, size, cellSize);
    }

    ctx.fillStyle = '#264653';
    ctx.font = 'bold 11px Nunito';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    TOKENS.forEach((token, i) => {
        ctx.fillText(token, padding - 8, padding + i * cellSize + cellSize / 2);
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    TOKENS.forEach((token, i) => {
        ctx.save();
        ctx.translate(padding + i * cellSize + cellSize / 2, padding - 8);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(token, 0, 0);
        ctx.restore();
    });
}

function buildBars(container, fromIdx) {
    const scores = ATTENTION_SCORES[fromIdx];
    const maxScore = Math.max(...scores);
    container.innerHTML = `<p style="font-weight:700;margin-bottom:0.75rem;color:#6B3A2A;">
        ${TOKEN_EMOJIS[fromIdx]} <strong>${TOKENS[fromIdx]}</strong> attends to:</p>`;

    scores.forEach((score, toIdx) => {
        const pct = (score / maxScore) * 100;
        const isTop = score === maxScore;
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.45rem;';
        row.innerHTML = `
            <div style="width:70px;text-align:right;font-size:0.85rem;font-weight:600;color:#264653;">${TOKEN_EMOJIS[toIdx]} ${TOKENS[toIdx]}</div>
            <div style="flex:1;height:24px;background:#FDEBD0;border-radius:6px;border:2px solid #6B3A2A;position:relative;overflow:hidden;">
                <div style="height:100%;width:0%;background:${isTop ? '#E63946' : '#F4A261'};border-radius:4px;transition:width 0.5s cubic-bezier(.22,1,.36,1);"></div>
                <span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:0.8rem;font-weight:700;color:#264653;">${score.toFixed(2)}</span>
            </div>
            ${isTop ? '<span style="font-size:1.1rem;">👑</span>' : ''}
        `;
        container.appendChild(row);
        setTimeout(() => {
            row.querySelector('div > div').style.width = pct + '%';
        }, 30 + toIdx * 60);
    });
}

export function init(containerEl) {
    if (!containerEl) return;

    let selectedToken = null;
    let quizIdx = 0;
    let quizScore = 0;
    let quizAnswered = false;

    const html = `
        <div style="margin-bottom:1.5rem;">
            <p style="margin-bottom:0.75rem;font-weight:600;">Click any ingredient to see its attention scores:</p>
            <div id="attention-tokens" style="display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;margin-bottom:1.5rem;"></div>
            <div style="display:flex;flex-direction:column;gap:1.5rem;align-items:flex-start;">
                <canvas id="attentionCanvas" style="width:100%;max-width:480px;height:auto;display:block;margin:0 auto;"></canvas>
                <div id="attention-bars" style="width:100%;max-width:480px;margin:0 auto;display:none;padding:1rem;background:#FFF8F0;border-radius:10px;border:2px solid #F4A261;"></div>
            </div>
        </div>

        <!-- Q, K, V explainer -->
        <div style="margin-top:2rem;border-top:2px dashed #6B3A2A;padding-top:1.5rem;">
            <p style="font-weight:700;margin-bottom:0.75rem;color:#6B3A2A;">🔑 How are those scores actually computed?</p>
            <p style="font-size:0.9rem;color:#264653;margin-bottom:0.85rem;line-height:1.6;">
                The attention heatmap shows <em>scores</em>, but each score comes from three learned vectors that every token generates:
            </p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1rem;max-width:540px;">
                <div style="background:#E9C46A;border:2px solid #6B3A2A;border-radius:10px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.5rem;">❓</div>
                    <div style="font-weight:700;font-size:0.95rem;margin:0.3rem 0;">Query (Q)</div>
                    <div style="font-size:0.78rem;color:#264653;">"What am I looking for?"</div>
                </div>
                <div style="background:#F4A261;border:2px solid #6B3A2A;border-radius:10px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.5rem;">🏷️</div>
                    <div style="font-weight:700;font-size:0.95rem;margin:0.3rem 0;">Key (K)</div>
                    <div style="font-size:0.78rem;color:#264653;">"What do I advertise?"</div>
                </div>
                <div style="background:#E63946;color:#fff;border:2px solid #6B3A2A;border-radius:10px;padding:0.75rem;text-align:center;">
                    <div style="font-size:1.5rem;">🎁</div>
                    <div style="font-weight:700;font-size:0.95rem;margin:0.3rem 0;">Value (V)</div>
                    <div style="font-size:0.78rem;">"What I actually contribute"</div>
                </div>
            </div>
            <p style="font-size:0.88rem;color:#264653;line-height:1.6;background:#FFF8F0;border-radius:8px;padding:0.75rem;border-left:4px solid #E63946;max-width:540px;">
                <strong>The formula:</strong> score(basil→caper) = basil's <strong>Q</strong> · caper's <strong>K</strong> ÷ √d<sub>k</sub><br>
                The heatmap you're clicking is the result of that dot-product for every pair. Then softmax (next section) turns those scores into probabilities — and those probabilities weight-sum the <strong>V</strong> vectors to produce the final output.
            </p>
        </div>

        <div style="margin-top:2rem;border-top:2px dashed #6B3A2A;padding-top:1.5rem;">
            <p style="font-weight:700;margin-bottom:0.4rem;color:#6B3A2A;">🧩 Attention Quiz</p>
            <p style="font-size:0.85rem;color:#555;margin-bottom:1.25rem;">Can you predict which ingredient gets the most attention?</p>
            <div id="quiz-box" style="background:#FFF8F0;border-radius:12px;border:2px solid #E9C46A;padding:1.25rem;"></div>
            <div id="quiz-score" style="margin-top:1rem;font-weight:700;font-size:1.05rem;display:none;"></div>
        </div>
    `;

    containerEl.innerHTML = html;

    const canvas = containerEl.querySelector('#attentionCanvas');
    const tokensDiv = containerEl.querySelector('#attention-tokens');
    const barsDiv = containerEl.querySelector('#attention-bars');
    const quizBox = containerEl.querySelector('#quiz-box');
    const quizScoreDiv = containerEl.querySelector('#quiz-score');

    canvasRef = canvas;
    ctxRef = canvas.getContext('2d');

    TOKENS.forEach((token, idx) => {
        const pill = document.createElement('button');
        pill.className = 'token-pill';
        pill.style.cssText = 'cursor:pointer;border:none;background:#F4A261;color:#264653;padding:0.4rem 0.85rem;border-radius:20px;font-family:Nunito,sans-serif;font-weight:700;font-size:0.9rem;transition:all 0.2s;';
        pill.textContent = TOKEN_EMOJIS[idx] + ' ' + token;
        pill.addEventListener('click', () => {
            selectedToken = selectedToken === idx ? null : idx;
            updateDisplay();
        });
        tokensDiv.appendChild(pill);
    });

    function updateDisplay() {
        tokensDiv.querySelectorAll('button').forEach((pill, idx) => {
            pill.style.background = selectedToken === idx ? '#E63946' : '#F4A261';
            pill.style.color = selectedToken === idx ? '#fff' : '#264653';
        });
        resizeCanvas();
        drawAttentionHeatmap(canvas, ctxRef, selectedToken);
        if (selectedToken !== null) {
            barsDiv.style.display = 'block';
            buildBars(barsDiv, selectedToken);
        } else {
            barsDiv.style.display = 'none';
        }
    }

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.min(480, rect.width - 20);
        canvas.height = canvas.width + 50;
    }

    window.addEventListener('resize', () => { resizeCanvas(); drawAttentionHeatmap(canvas, ctxRef, selectedToken); });

    requestAnimationFrame(() => {
        resizeCanvas();
        drawAttentionHeatmap(canvas, ctxRef, selectedToken);
    });

    // Quiz
    function renderQuiz() {
        if (quizIdx >= QUIZ_DATA.length) {
            quizBox.innerHTML = `<p style="font-size:1.2rem;text-align:center;">🎉 Quiz complete!</p>`;
            quizScoreDiv.style.display = 'block';
            quizScoreDiv.innerHTML = `Score: <span style="color:${quizScore === QUIZ_DATA.length ? '#2A9D8F' : '#E63946'}">${quizScore}/${QUIZ_DATA.length}</span> — ${quizScore === QUIZ_DATA.length ? 'Perfect! You understand attention! 🏆' : 'Keep studying the heatmap above!'}`;
            return;
        }

        const q = QUIZ_DATA[quizIdx];
        quizAnswered = false;

        quizBox.innerHTML = `
            <p style="font-weight:700;margin-bottom:1rem;font-size:1rem;">${q.question}</p>
            <div id="quiz-options" style="display:flex;flex-wrap:wrap;gap:0.6rem;"></div>
            <div id="quiz-feedback" style="display:none;margin-top:1rem;padding:0.75rem;border-radius:8px;font-size:0.9rem;"></div>
        `;

        const optionsDiv = quizBox.querySelector('#quiz-options');
        const feedbackDiv = quizBox.querySelector('#quiz-feedback');

        q.options.forEach(tokenIdx => {
            const btn = document.createElement('button');
            btn.style.cssText = 'padding:0.5rem 1rem;border:2px solid #6B3A2A;border-radius:20px;background:#fff;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700;font-size:0.9rem;transition:all 0.2s;';
            btn.textContent = TOKEN_EMOJIS[tokenIdx] + ' ' + TOKENS[tokenIdx];
            btn.addEventListener('click', () => {
                if (quizAnswered) return;
                quizAnswered = true;

                // Highlight selected token in heatmap
                selectedToken = q.from;
                updateDisplay();

                const isCorrect = tokenIdx === q.correctIdx;
                if (isCorrect) quizScore++;

                optionsDiv.querySelectorAll('button').forEach(b => {
                    b.disabled = true;
                    b.style.opacity = '0.5';
                });
                btn.style.opacity = '1';
                btn.style.background = isCorrect ? '#2A9D8F' : '#E63946';
                btn.style.color = '#fff';
                if (!isCorrect) {
                    optionsDiv.querySelectorAll('button')[q.options.indexOf(q.correctIdx)]
                        && optionsDiv.querySelectorAll('button').forEach(b => {
                            if (b.textContent.includes(TOKENS[q.correctIdx])) {
                                b.style.opacity = '1';
                                b.style.background = '#2A9D8F';
                                b.style.color = '#fff';
                            }
                        });
                }

                feedbackDiv.style.display = 'block';
                feedbackDiv.style.background = isCorrect ? '#D4EDDA' : '#FDECEA';
                feedbackDiv.style.border = `1px solid ${isCorrect ? '#2A9D8F' : '#E63946'}`;
                feedbackDiv.innerHTML = `${isCorrect ? '✅' : '❌'} ${q.explanation}`;

                const nextBtn = document.createElement('button');
                nextBtn.style.cssText = 'margin-top:1rem;display:block;padding:0.5rem 1.25rem;background:#6B3A2A;color:#fff;border:none;border-radius:20px;cursor:pointer;font-family:Nunito,sans-serif;font-weight:700;';
                nextBtn.textContent = quizIdx + 1 < QUIZ_DATA.length ? 'Next Question →' : 'See Results';
                nextBtn.addEventListener('click', () => {
                    quizIdx++;
                    renderQuiz();
                });
                feedbackDiv.appendChild(nextBtn);
            });
            optionsDiv.appendChild(btn);
        });
    }

    renderQuiz();
}

export function reset() {
    canvasRef = null;
    ctxRef = null;
}
