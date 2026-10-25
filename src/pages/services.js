/* Services: each service card draws its icon as it arrives, and tilts gently on hover to
   reveal what's included (touch screens show the list straight away). */

import SplitType from 'split-type';
import { SERVICES, PACKAGES, img } from '../data.js';
import { esc } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { REDUCED } from '../core/env.js';
import { gsap, scrollToEl } from '../core/motion.js';

const rs = (n) => 'Rs ' + n.toLocaleString('en-PK');

export async function mount(root, ctx) {
  root.querySelector('[data-jumps]').innerHTML = SERVICES.map((s) =>
    `<a href="#${s.id}" data-jump="${s.id}">${icon(s.icon)}<span>${esc(s.title)}</span></a>`).join('') +
    '<a href="#packages-list" data-jump="packages-list">' + icon('heart') + '<span>Packages</span></a>';

  root.querySelector('[data-services]').innerHTML = SERVICES.map((s) => `
    <article class="service-card" id="${s.id}" data-reveal data-tilt="4" tabindex="0" aria-labelledby="sv-${s.id}">
      <div class="service-media"><img src="${img(s.img, 640)}" alt="" loading="lazy" decoding="async"></div>
      <div class="service-front">
        <span class="care-icon" data-draw>${icon(s.icon)}</span>
        <h2 id="sv-${s.id}">${esc(s.title)}</h2>
        <p>${esc(s.blurb)}</p>
        <span class="care-from">From ${rs(Math.min(...s.items.map((i) => i[1])))} · <span class="hover-hint">hover to see all</span></span>
      </div>
      <ul class="service-list" aria-label="${esc(s.title)} prices">
        ${s.items.map(([n, p]) => `<li><span>${esc(n)}</span><b>${rs(p)}</b></li>`).join('')}
      </ul>
    </article>`).join('');

  root.querySelector('[data-packages]').innerHTML = PACKAGES.map((p, i) => `
    <article class="package-card ${i === 1 ? 'is-featured' : ''}" data-reveal data-tilt="4">
      ${i === 1 ? '<span class="package-badge">Most chosen</span>' : ''}
      <p class="mono">${esc(p.for)}</p>
      <h3>${esc(p.name)}</h3>
      <p class="package-price">${rs(p.price)}</p>
      <ul>${p.includes.map((x) => `<li><svg aria-hidden="true"><use href="#i-check"/></svg>${esc(x)}</li>`).join('')}</ul>
      <a class="btn ${i === 1 ? 'btn-primary' : 'btn-ghost'} btn-block" href="/book">Book this check-up</a>
    </article>`).join('');

  root.querySelector('[data-jumps]').addEventListener('click', (e) => {
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    e.preventDefault();
    scrollToEl(root.querySelector('#' + a.dataset.jump), -120);
  });

  if (!REDUCED) document.fonts.ready.then(() => root.isConnected && ctx.add(() => {
    const split = new SplitType(root.querySelector('[data-split]'), { types: 'lines, words', lineClass: 'split-line' });
    gsap.from(split.words, { yPercent: 100, opacity: 0, filter: 'blur(6px)', duration: 1.5, stagger: 0.1, ease: 'sine.out' });
  }));

  return () => {};
}
