import { setNarration } from './narrator.js';
import { initSection1 } from './sections/s1-vision-encoder.js';
import { initSection2 } from './sections/s2-image-patches.js';
import { initSection3 } from './sections/s3-cross-attention.js';
import { initSection4 } from './sections/s4-text-to-image.js';
import { initSection5 } from './sections/s5-audio.js';
import { initSection6 } from './sections/s6-video.js';
import { initSection7 } from './sections/s7-joint-embedding.js';
import { initSection8 } from './sections/s8-modality-gaps.js';

const sectionContainer = document.getElementById('section-container');

const sections = [
    { number: 1, title: '👁️ Vision Encoders', init: initSection1 },
    { number: 2, title: '🔲 Image Patches', init: initSection2 },
    { number: 3, title: '🔀 Cross-Attention', init: initSection3 },
    { number: 4, title: '🎨 Text-to-Image', init: initSection4 },
    { number: 5, title: '🎵 Audio Processing', init: initSection5 },
    { number: 6, title: '🎬 Video Understanding', init: initSection6 },
    { number: 7, title: '🌐 Joint Embedding', init: initSection7 },
    { number: 8, title: '😅 Modality Gaps', init: initSection8 }
];

function renderSections() {
    sectionContainer.innerHTML = '';
    sections.forEach((section) => {
        const sectionEl = document.createElement('section');
        sectionEl.id = `section-${section.number}`;
        sectionEl.className = 'section';
        sectionEl.innerHTML = `<h2 class="section-title">${section.title}</h2><div id="section-${section.number}-content"></div>`;
        sectionContainer.appendChild(sectionEl);

        const contentEl = document.getElementById(`section-${section.number}-content`);
        section.init(contentEl);
        setNarration(section.number);
    });
}

window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        renderSections();
    });
});

