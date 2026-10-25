/* Contact: the walking route draws itself from the bus stop to the clinic as you scroll,
   and the directions sharpen from a soft blur as you read down (shared [data-blur]). */

import SplitType from 'split-type';
import { REDUCED } from '../core/env.js';
import { gsap } from '../core/motion.js';

export async function mount(root, ctx) {
  const route = root.querySelector('[data-route]');
  if (REDUCED) {
    route.style.strokeDashoffset = 0;
    return () => {};
  }
  ctx.add(() => {
    gsap.fromTo(route, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: root.querySelector('[data-map]'), start: 'top 75%', end: 'center 40%', scrub: 1.2 },
    });
  });
  document.fonts.ready.then(() => root.isConnected && ctx.add(() => {
    const split = new SplitType(root.querySelector('[data-split]'), { types: 'lines, words', lineClass: 'split-line' });
    gsap.from(split.words, { yPercent: 100, opacity: 0, filter: 'blur(6px)', duration: 1.5, stagger: 0.1, ease: 'sine.out' });
  }));
  return () => {};
}
