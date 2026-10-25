/* "Breathe with us": a corner button that opens a short guided breathing exercise for anxious
   visitors. Box-style rhythm: in 4s, hold 4s, out 6s, three rounds. */

import { gsap } from './motion.js';
import { REDUCED } from './env.js';

const STEPS = [
  { label: 'Breathe in', secs: 4, scale: 1 },
  { label: 'Hold', secs: 4, scale: 1 },
  { label: 'Breathe out', secs: 6, scale: 0.55 },
];
const ROUNDS = 3;

export function initBreathe() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'breathe-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'breathe-panel');
  btn.innerHTML = '<span class="breathe-dot" aria-hidden="true"></span><span>Breathe with us</span>';

  const panel = document.createElement('section');
  panel.className = 'breathe-panel';
  panel.id = 'breathe-panel';
  panel.setAttribute('aria-label', 'Guided breathing');
  panel.hidden = true;
  panel.innerHTML = `
    <button type="button" class="icon-btn breathe-close" aria-label="Close breathing guide"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
    <p class="eyebrow">A minute for yourself</p>
    <div class="breathe-stage" aria-hidden="true"><span class="breathe-ring"></span><span class="breathe-orb"></span></div>
    <p class="breathe-cue" aria-live="polite">Ready when you are</p>
    <p class="breathe-sub">Three slow breaths. In through the nose, out through the mouth.</p>
    <button type="button" class="btn btn-primary btn-sm breathe-start">Start</button>`;
  document.body.append(panel, btn);

  const orb = panel.querySelector('.breathe-orb');
  const cue = panel.querySelector('.breathe-cue');
  const start = panel.querySelector('.breathe-start');
  let tl = null;

  const setOpen = (open) => {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('is-open', open);
    if (open) {
      gsap.fromTo(panel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'sine.out' });
      start.focus();
    } else {
      tl?.kill();
      gsap.set(orb, { scale: 0.55 });
      cue.textContent = 'Ready when you are';
      start.textContent = 'Start';
      start.hidden = false;
    }
  };

  btn.addEventListener('click', () => setOpen(panel.hidden));
  panel.querySelector('.breathe-close').addEventListener('click', () => { setOpen(false); btn.focus(); });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); btn.focus(); } });

  start.addEventListener('click', () => {
    start.hidden = true;
    tl?.kill();
    tl = gsap.timeline({
      onComplete: () => {
        cue.textContent = 'Well done. Take your time.';
        start.textContent = 'Again';
        start.hidden = false;
      },
    });
    for (let r = 0; r < ROUNDS; r++) {
      STEPS.forEach((s) => {
        tl.call(() => { cue.textContent = `${s.label}…`; });
        tl.to(orb, { scale: REDUCED ? 0.8 : s.scale, duration: s.secs, ease: 'sine.inOut' });
      });
    }
  });
  gsap.set(orb, { scale: 0.55 });
}
