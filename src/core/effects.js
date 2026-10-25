/* Calm effects shared by every page:
   [data-blur]  text that sharpens from a soft blur, line by line, as you read down
   [data-draw]  thin-line icons that draw themselves when they enter the screen */

import SplitType from 'split-type';
import { gsap, ScrollTrigger } from './motion.js';
import { REDUCED, LITE } from './env.js';

export function blurText(root) {
  root.querySelectorAll('[data-blur]').forEach((el) => {
    if (REDUCED) return;
    const split = new SplitType(el, { types: 'lines', lineClass: 'blur-line' });
    split.lines.forEach((line) => {
      gsap.fromTo(line,
        { filter: 'blur(7px)', opacity: 0.25, y: 6 },
        { filter: 'blur(0px)', opacity: 1, y: 0, ease: 'sine.out',
          scrollTrigger: { trigger: line, start: 'top 92%', end: 'top 68%', scrub: LITE ? false : 0.6, once: LITE } });
    });
  });
}

export function drawIcons(root) {
  root.querySelectorAll('[data-draw]').forEach((el) => {
    const paths = el.querySelectorAll('path');
    if (REDUCED) return;
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, ease: 'sine.inOut', stagger: 0.18 }),
    });
  });
}
