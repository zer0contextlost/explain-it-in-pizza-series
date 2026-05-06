# Explain It In Pizza 🍕

> Learning AI has never been this delicious.

An 8-episode interactive web series that teaches AI and machine learning concepts entirely through pizza metaphors. No math degree required. No prior ML knowledge needed. Just an appetite for learning.

Each episode is a standalone, fully interactive experience built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no installation.

---

## Episodes

| # | Title | Concept | Pizza Metaphor |
|---|-------|---------|----------------|
| [Ep1](ep1-ml-basics/) | **How AI Learns** | Training data, neural networks, loss, backprop | Every great chef started by burning a few pies |
| [Ep2](ep2-transformers/) | **The Transformer Kitchen** | Attention, embeddings, multi-head attention | The secret sauce behind ChatGPT, explained in toppings |
| [Ep3](ep3-finetuning/) | **Teaching a Chef Your Style** | Fine-tuning & RLHF | Take a world-class chef and train them to cook YOUR pizza |
| [Ep4](ep4-rag/) | **The Recipe Rolodex** | Retrieval-Augmented Generation | When a chef consults their recipe book before cooking |
| [Ep5](ep5-prompting/) | **How You Write the Order** | Prompt Engineering | The same chef, wildly different results — it's all in the order |
| [Ep6](ep6-agents/) | **The Autonomous Chef** | AI Agents & Tool Use | A chef who can call suppliers, check inventory, AND cook |
| [Ep7](ep7-multimodal/) | **Show Me the Pizza** | Multimodal AI | Show the chef a photo — they'll figure out the rest |
| [Ep8](ep8-hallucination/) | **The Confident Liar** | Hallucination & Safety | The chef who invents dishes that never existed, with complete confidence |

---

## Running Locally

No install needed. Just open any episode directly in a browser:

```
ep1-ml-basics/index.html
ep2-transformers/index.html
...
```

Or serve with any static file server:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080` to start at the series landing page.

---

## What's Inside Each Episode

Every episode follows the same structure:

```
epN-name/
  index.html       — Episode shell, navigation, narration box
  main.js          — Section manager, navigation, sound
  narrator.js      — Web Speech API narrator (British voice)
  style.css        — Episode styles
  sections/
    s1-*.js        — Section 1 interactive
    s2-*.js        — Section 2 interactive
    ...
    s8-*.js        — Section 8 interactive
```

Each section has its own self-contained interactive demo — canvas animations, sliders, buttons, drag interactions — all teaching one specific concept through a pizza analogy.

---

## Technical Notes

- **Vanilla JS only** — no React, no Vue, no build step
- **Google Fonts** — Pacifico, Nunito, Fredoka One
- **Web Speech API** — optional narration with a British voice (easy ElevenLabs swap-in)
- **Canvas animations** — all use `requestAnimationFrame` with proper resize handling
- **ES Modules** — episodes 2, 4, 6, 7 use `type="module"`; others use the global script pattern

---

## Series Concept

AI is complicated. Pizza is universally understood.

Tokens are toppings. Attention is a chef deciding what matters. Fine-tuning is teaching Gordon Ramsay to make your grandma's sauce. Hallucination is a chef confidently serving a dish he invented on the spot.

The goal: make ML concepts genuinely stick for people who've never written a line of Python.

---

## License

MIT
