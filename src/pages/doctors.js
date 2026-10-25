/* Doctors: cards flip in 3D to show each weekly timetable. A pulsing dot marks who is in today. */

import SplitType from 'split-type';
import { DOCTORS } from '../data.js';
import { esc } from '../core/ui.js';
import { REDUCED } from '../core/env.js';
import { gsap, ScrollTrigger } from '../core/motion.js';
import { doctorToday, fmtTime, karachiNow, DAY_SHORT } from '../core/hours.js';
import { avatar, stateDot } from '../core/people.js';

export async function mount(root, ctx) {
  const today = karachiNow().day;
  const grid = root.querySelector('[data-doctors]');

  grid.innerHTML = DOCTORS.map((d) => {
    const s = doctorToday(d);
    const rows = [1, 2, 3, 4, 5, 6, 0].map((day) => {
      const h = d.schedule[day];
      return `<li class="${day === today ? 'is-today' : ''} ${h ? '' : 'is-off'}"><span>${DAY_SHORT[day]}</span><span>${h ? `${fmtTime(h[0])} – ${fmtTime(h[1])}` : '—'}</span></li>`;
    }).join('');
    return `
      <article class="doctor" data-doc="${d.id}" data-kind="${d.visiting ? 'visiting' : 'gp'}" data-state="${s.state}" data-reveal>
        <div class="doctor-inner" data-flip>
          <div class="doctor-face doctor-front">
            <div class="doctor-top">
              ${avatar(d, 'lg')}
              <span class="doctor-badge is-${s.state}">${stateDot(s.state)}${s.state === 'in' ? 'In now' : s.state === 'later' ? 'In today' : 'Not in today'}</span>
            </div>
            <h2>${esc(d.name)}</h2>
            <p class="doctor-role">${esc(d.role)}</p>
            <p class="doctor-quals mono">${esc(d.quals)}</p>
            <p class="doctor-about">${esc(d.about)}</p>
            <dl class="doctor-meta">
              <div><dt>Experience</dt><dd>${d.years} years</dd></div>
              <div><dt>Speaks</dt><dd>${esc(d.langs)}</dd></div>
            </dl>
            <p class="doctor-next">${esc(s.label)}</p>
            <button type="button" class="btn btn-ghost btn-block" data-flip-btn aria-label="See ${esc(d.name)}'s timetable"><svg aria-hidden="true"><use href="#i-calendar"/></svg>See weekly timetable</button>
          </div>
          <div class="doctor-face doctor-back" aria-label="${esc(d.name)}'s timetable">
            <div class="doctor-back-head">${avatar(d, 'sm')}<div><h3>${esc(d.name)}</h3><p class="mono">Weekly timetable</p></div></div>
            <ul class="timetable">${rows}</ul>
            <a class="btn btn-primary btn-block" href="/book?doctor=${d.id}">Book with ${esc(d.name.replace('Dr. ', 'Dr '))}</a>
            <button type="button" class="link-btn flip-back" data-flip-btn>Turn the card back</button>
          </div>
        </div>
      </article>`;
  }).join('');

  // flipping
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-flip-btn]');
    if (!b) return;
    const inner = b.closest('[data-flip]');
    const flipped = !inner.classList.contains('is-flipped');
    inner.classList.toggle('is-flipped', flipped);
    const front = inner.querySelector('.doctor-front'), back = inner.querySelector('.doctor-back');
    front.inert = flipped;
    back.inert = !flipped;
    setTimeout(() => (flipped ? back.querySelector('a') : front.querySelector('[data-flip-btn]'))?.focus({ preventScroll: true }), 500);
  });
  grid.querySelectorAll('.doctor-back').forEach((b) => (b.inert = true));

  // filters
  const filters = root.querySelector('[data-filters]');
  filters.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filters.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.filter;
    grid.querySelectorAll('.doctor').forEach((card) => {
      const show = f === 'all' || card.dataset.kind === f || (f === 'today' && card.dataset.state !== 'off');
      if (show && card.hidden) { card.hidden = false; if (!REDUCED) gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'sine.out' }); }
      else if (!show) card.hidden = true;
    });
    ScrollTrigger.refresh();
  });

  if (!REDUCED) document.fonts.ready.then(() => root.isConnected && ctx.add(() => {
    const split = new SplitType(root.querySelector('[data-split]'), { types: 'lines, words', lineClass: 'split-line' });
    gsap.from(split.words, { yPercent: 100, opacity: 0, filter: 'blur(6px)', duration: 1.5, stagger: 0.1, ease: 'sine.out' });
  }));
  return () => {};
}
