// Section 3: Calibration & Uncertainty - Scatter Chart
window.initSection3Internal = function(container, sectionNum) {
  container.innerHTML = `
    <p class="section-description">
      Confidence is not correctness. A well-calibrated chef knows the difference between what he is sure of
      and what he is guessing at. The overconfident chef does not know that he does not know.
    </p>

    <div style="margin: var(--spacing-lg) 0;">
      <button id="s3-run-quiz" style="width: 100%;">Run Calibration Quiz</button>
    </div>

    <div class="chef-comparison" id="s3-results" style="display: none; margin: var(--spacing-lg) 0;">
      <div class="chef-card">
        <div class="chef-name">Calibrated Chef</div>
        <canvas id="s3-canvas-calibrated" width="300" height="300" style="border: 2px solid var(--color-border); border-radius: var(--radius-md); width: 100%; height: auto;"></canvas>
        <div class="calibration-score" id="s3-score-calibrated">Score: —</div>
      </div>
      <div class="chef-card">
        <div class="chef-name">Overconfident Chef</div>
        <canvas id="s3-canvas-overconfident" width="300" height="300" style="border: 2px solid var(--color-border); border-radius: var(--radius-md); width: 100%; height: auto;"></canvas>
        <div class="calibration-score" id="s3-score-overconfident">Score: —</div>
      </div>
    </div>

    <div id="s3-questions" style="margin: var(--spacing-lg) 0;"></div>
  `;

  const questions = [
    { q: "In what year was the tomato introduced to Italy?", answer: 1600, tolerance: 50 },
    { q: "How many countries export mozzarella?", answer: 20, tolerance: 10 },
    { q: "What is the ideal temperature for Neapolitan pizza (in °F)?", answer: 850, tolerance: 50 },
    { q: "How many tons of pizza are consumed in Italy per year?", answer: 700, tolerance: 200 },
    { q: "In what decade was the first pizza restaurant opened?", answer: 1800, tolerance: 30 },
    { q: "What percentage of Italians eat pizza regularly?", answer: 85, tolerance: 10 },
    { q: "How many pizzerias are in Italy?", answer: 50000, tolerance: 10000 },
    { q: "What year was pizza Margherita created?", answer: 1889, tolerance: 10 },
    { q: "How many minutes should quality dough ferment?", answer: 480, tolerance: 120 },
    { q: "What is the typical salt content in pizza dough (percent)?", answer: 2, tolerance: 0.5 }
  ];

  let quizData = {
    calibrated: [],
    overconfident: []
  };

  const runBtn = document.getElementById('s3-run-quiz');
  const resultsDiv = document.getElementById('s3-results');

  runBtn.onclick = function() {
    runBtn.disabled = true;
    runBtn.textContent = 'Running Quiz...';

    // Generate responses
    questions.forEach((q, idx) => {
      // Calibrated chef: confidence correlates with accuracy (confidence ± 10% noise)
      const confidenceCalibrated = 40 + Math.random() * 55; // 40-95%
      const rawAccuracy = confidenceCalibrated / 100 + (Math.random() * 0.2 - 0.1);
      const clampedAccuracy = Math.max(0, Math.min(1, rawAccuracy));
      quizData.calibrated.push({
        confidence: confidenceCalibrated,
        correct: clampedAccuracy > 0.5
      });

      // Overconfident chef - always high confidence (0.8-1.0), but random accuracy
      const accuracyOverconfident = Math.random() > 0.4 ? 1 : 0.3;
      quizData.overconfident.push({
        confidence: 80 + Math.random() * 20, // Always 80-100%
        correct: accuracyOverconfident > 0.6
      });
    });

    // Animate results
    setTimeout(() => {
      resultsDiv.style.display = 'grid';
      requestAnimationFrame(() => {
        drawCalibrationCharts();
        calculateScores();
      });
      runBtn.disabled = false;
      runBtn.textContent = 'Run Quiz Again';
    }, 800);
  };

  function drawCalibrationCharts() {
    drawChart('s3-canvas-calibrated', quizData.calibrated);
    drawChart('s3-canvas-overconfident', quizData.overconfident);
  }

  function drawChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 30;

    // Clear
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    // Draw perfect calibration line (diagonal)
    ctx.strokeStyle = '#27AE60';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Confidence', width / 2, height - 5);

    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Accuracy', 0, 0);
    ctx.restore();

    // Plot points with animation
    data.forEach((point, idx) => {
      const x = padding + (point.confidence / 100) * (width - 2 * padding);
      const y = height - padding - (point.correct ? 0.8 : 0.2) * (height - 2 * padding);

      ctx.fillStyle = point.correct ? 'rgba(39, 174, 96, 0.6)' : 'rgba(192, 57, 43, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = point.correct ? '#27AE60' : '#C0392B';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function calculateScores() {
    const calculateCalibrationScore = (data) => {
      let totalError = 0;
      data.forEach(point => {
        const expectedAccuracy = point.confidence / 100;
        const actualAccuracy = point.correct ? 1 : 0;
        totalError += Math.abs(expectedAccuracy - actualAccuracy);
      });
      return Math.round(totalError);
    };

    const scoreCal = calculateCalibrationScore(quizData.calibrated);
    const scoreOverconf = calculateCalibrationScore(quizData.overconfident);

    document.getElementById('s3-score-calibrated').textContent = `Score: ${scoreCal} (lower is better)`;
    document.getElementById('s3-score-overconfident').textContent = `Score: ${scoreOverconf} (lower is better)`;
  }

  // Update narrator
  if (typeof updateNarrator === 'function') {
    updateNarrator(sectionNum);
  }
};
