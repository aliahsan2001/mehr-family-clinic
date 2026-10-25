/* Page transition: a soft teal wash drifts across the screen and fades away, like a breath out.
   Slow on purpose (about a second). Reduced motion gets a plain fade. */

import { gsap } from './motion.js';
import { REDUCED } from './env.js';

let wash;

// resolve when the timeline ends, or jump to its end if animation frames stall
function settle(tl, ms) {
  return Promise.race([
    tl.then(() => {}),
    new Promise((r) => setTimeout(() => { tl.progress(1); r(); }, ms)),
  ]);
}

function build() {
  wash = document.createElement('div');
  wash.className = 'teal-wash';
  wash.setAttribute('aria-hidden', 'true');
  wash.innerHTML = '<div class="teal-wash-body"></div><div class="teal-wash-heart"><svg viewBox="0 0 24 24"><use href="#i-heart"/></svg></div>';
  document.body.appendChild(wash);
}

export function cover() {
  if (!wash) build();
  const body = wash.querySelector('.teal-wash-body');
  const heart = wash.querySelector('.teal-wash-heart');
  wash.classList.add('is-active');
  if (REDUCED) return settle(gsap.fromTo(wash, { opacity: 0 }, { opacity: 1, duration: 0.3 }), 600);
  gsap.set(wash, { opacity: 1 });
  const tl = gsap.timeline();
  // breathe in: the wash flows across from the left
  tl.fromTo(body, { xPercent: -100, opacity: 0.4 }, { xPercent: 0, opacity: 1, duration: 0.55, ease: 'sine.inOut' })
    .fromTo(heart, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'sine.out' }, 0.25);
  return settle(tl, 1000);
}

export function reveal() {
  const body = wash.querySelector('.teal-wash-body');
  const heart = wash.querySelector('.teal-wash-heart');
  const done = () => wash.classList.remove('is-active');
  if (REDUCED) return settle(gsap.to(wash, { opacity: 0, duration: 0.3, onComplete: done }), 600);
  // breathe out: it softens and drifts away to the right
  const tl = gsap.timeline({ onComplete: done });
  tl.to(heart, { scale: 1.15, opacity: 0, duration: 0.4, ease: 'sine.in' }, 0)
    .to(body, { xPercent: 100, opacity: 0, duration: 0.65, ease: 'sine.inOut' }, 0.1)
    .set(wash, { opacity: 0 });
  return settle(tl, 1100);
}
