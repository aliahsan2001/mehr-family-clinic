/* Home: the breathing glass heart, and a pulse line that draws itself down the page,
   beating once at each section it reaches. */

import SplitType from 'split-type';
import { DOCTORS, SERVICES, CONFIG } from '../data.js';
import { esc, idle } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { LITE, REDUCED } from '../core/env.js';
import { gsap, ScrollTrigger } from '../core/motion.js';
import { doctorToday, fmtTime, karachiNow, DAY_NAMES } from '../core/hours.js';
import { avatar, stateDot } from '../core/people.js';

export async function mount(root, ctx) {
  const cleanups = [];
  renderToday(root);
  renderCare(root);
  renderHours(root);

  // the heart loads after the words are on screen
  let heart = null;
  if (!LITE) {
    idle().then(async () => {
      if (!root.isConnected) return;
      try {
        const { mountHeart } = await import('../three/heart.js');
        if (root.isConnected) heart = mountHeart(root.querySelector('[data-heart]'));
      } catch (err) {
        console.warn('Glass heart unavailable, showing the drawing', err);
        root.querySelector('[data-heart-wrap]').classList.add('no-webgl');
      }
    });
  }
  cleanups.push(() => heart?.dispose());

  if (!REDUCED) {
    // split only once the serif has loaded, or the lines are measured with the fallback font
    const h1 = root.querySelector('[data-split]');
    gsap.set(h1, { opacity: 0 });
    gsap.from(root.querySelectorAll('[data-hero-fade]'), { y: 16, opacity: 0, duration: 1.4, stagger: 0.15, delay: 0.6, ease: 'sine.out' });
    document.fonts.ready.then(() => {
      if (!root.isConnected) return;
      ctx.add(() => {
        gsap.set(h1, { opacity: 1 });
        const split = new SplitType(h1, { types: 'lines, words', lineClass: 'split-line' });
        gsap.from(split.words, { yPercent: 100, opacity: 0, filter: 'blur(6px)', duration: 1.6, stagger: 0.12, ease: 'sine.out' });
      });
    });
  }

  cleanups.push(pulseLine(root, ctx));
  return () => cleanups.forEach((fn) => fn?.());
}

function renderToday(root) {
  const order = { in: 0, later: 1, off: 2 };
  const list = DOCTORS.map((d) => ({ d, s: doctorToday(d) })).sort((a, b) => order[a.s.state] - order[b.s.state]);
  root.querySelector('[data-today]').innerHTML = list.map(({ d, s }) => `
    <article class="today-card is-${s.state}" data-reveal>
      ${avatar(d)}
      <div class="today-info">
        <h3>${esc(d.name)}</h3>
        <p class="today-role">${esc(d.role)}</p>
        <p class="today-state">${stateDot(s.state)}${esc(s.label)}</p>
      </div>
      <a class="today-book" href="/book?doctor=${d.id}" aria-label="Book with ${esc(d.name)}"><svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
    </article>`).join('');
}

function renderCare(root) {
  root.querySelector('[data-care]').innerHTML = SERVICES.map((s) => `
    <a class="care-card" href="/services#${s.id}" data-reveal data-tilt>
      <span class="care-icon" data-draw>${icon(s.icon)}</span>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.blurb)}</p>
      <span class="care-from">From Rs ${Math.min(...s.items.map((i) => i[1])).toLocaleString('en-PK')}</span>
    </a>`).join('');
}

function renderHours(root) {
  const today = karachiNow().day;
  root.querySelector('[data-hours]').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = CONFIG.hours[d];
    return `<tr class="${d === today ? 'is-today' : ''}"><th scope="row">${DAY_NAMES[d]}${d === today ? ' <span class="today-tag">Today</span>' : ''}</th><td>${fmtTime(h.open)} – ${fmtTime(h.close)}</td></tr>`;
  }).join('');
}

/* ---------- the pulse line ---------- */
function pulseLine(root, ctx) {
  const svg = root.querySelector('[data-pulse]');
  const track = svg.querySelector('.pulse-track');
  const draw = svg.querySelector('.pulse-draw');
  const tip = svg.querySelector('.pulse-tip');
  let length = 1, nodes = [], st;

  function build() {
    const main = root;
    const box = main.getBoundingClientRect();
    const W = main.clientWidth, H = main.scrollHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = H + 'px';
    const container = main.querySelector('.container');
    const left = container ? container.getBoundingClientRect().left - box.left : 20;
    const x = left > 70 ? left - 34 : 12;
    const hero = main.querySelector('.hero');
    let d = `M ${x} ${hero.offsetTop + hero.offsetHeight * 0.55}`;
    nodes.forEach((n) => n.remove());
    nodes = [];
    main.querySelectorAll('[data-pulse-stop]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const y = r.top - box.top + 10;
      // straight down, then one heartbeat (P wave, QRS spike, T wave) beside the heading
      d += ` L ${x} ${y - 18} l 5 4 l -5 4 l 0 2 l 18 6 l -30 8 l 12 6 l 0 6 l 7 5 l -7 5 L ${x} ${y + 60}`;
      const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      node.setAttribute('class', 'pulse-node');
      node.setAttribute('cx', x);
      node.setAttribute('cy', y + 21);
      node.setAttribute('r', 7);
      svg.insertBefore(node, tip);
      nodes.push(node);
    });
    d += ` L ${x} ${H - 40}`;
    track.setAttribute('d', d);
    draw.setAttribute('d', d);
    length = draw.getTotalLength();
    draw.style.strokeDasharray = length;
    update(st ? st.progress : 0);
  }

  function update(p) {
    const at = length * p;
    draw.style.strokeDashoffset = length - at;
    const pt = draw.getPointAtLength(at);
    tip.setAttribute('cx', pt.x);
    tip.setAttribute('cy', pt.y);
    nodes.forEach((n) => n.classList.toggle('is-lit', Number(n.getAttribute('cy')) <= pt.y + 4));
  }

  if (REDUCED) {
    requestAnimationFrame(() => { build(); update(1); });
    return () => {};
  }

  ctx.add(() => {
    st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => update(self.progress),
    });
  });
  const ro = new ResizeObserver(() => build());
  ro.observe(root);
  document.fonts.ready.then(() => root.isConnected && build());
  return () => ro.disconnect();
}
