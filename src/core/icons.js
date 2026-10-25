/* Thin-line icons. Every path carries pathLength="1", so any icon can draw itself in with a
   single CSS rule (stroke-dasharray: 1; stroke-dashoffset: 1 -> 0). */

const P = {
  stethoscope: ['M6 3v6a4 4 0 0 0 8 0V3', 'M10 13v2a5 5 0 0 0 10 0v-2', 'M20 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M5 3h2M13 3h2'],
  flask: ['M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3', 'M7 15h10'],
  syringe: ['M18 2l4 4M20 4l-9.5 9.5M14.5 5.5l4 4', 'M13 8l-8.5 8.5-1 4 4-1L16 11', 'M9 12l1.5 1.5M7 14l1.5 1.5'],
  clipboard: ['M9 4h6v3H9z', 'M15 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2', 'M9 12l2 2 4-4M9 17h6'],
  heart: ['M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z'],
  pulse: ['M2 12h4l2-5 4 10 2.5-6 1.5 3H22'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16M8 3v4M16 3v4'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  phone: ['M5 3h3.5l1.7 4.4-2.3 1.4a11 11 0 0 0 7.3 7.3l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'],
  pin: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  wa: ['M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.8 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z', 'M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a5 5 0 0 1-2.9-2.9l1-1-1-2-1.6 1z'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  arrow: ['M5 12h14M13 6l6 6-6 6'],
  back: ['M15 6l-6 6 6 6'],
  close: ['M6 6l12 12M18 6L6 18'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9 12l2 2 4-4'],
  leaf: ['M5 19c0-9 6-14 15-14 0 9-5 15-14 15', 'M5 19l7-7'],
  alert: ['M12 3l10 18H2z', 'M12 10v5M12 18v.01'],
  baby: ['M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M9 12h.01M15 12h.01M10 15.5a3 3 0 0 0 4 0', 'M12 5c0-1.5 1-2 2-2'],
  sparkle: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z'],
  mail: ['M3 5h18v14H3z', 'M3.5 6.5l8.5 6.5 8.5-6.5'],
  car: ['M5 16l1.5-6h11l1.5 6', 'M3 16h18v3H3z', 'M7 19v1.5M17 19v1.5', 'M7.5 13h.01M16.5 13h.01'],
  bus: ['M5 4h14v13H5z', 'M5 11h14M8 17v3M16 17v3', 'M8 14h.01M16 14h.01'],
  chat: ['M4 5h16v11H9l-5 4z', 'M8 10h8M8 13h5'],
  star: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  download: ['M12 4v11M7 10l5 5 5-5', 'M5 20h14'],
};

const paths = (name) => P[name].map((d) => `<path d="${d}" pathLength="1"/>`).join('');

// inline icon (used where it should draw itself in)
export const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths(name)}</svg>`;

export function injectIcons() {
  if (document.getElementById('i-heart')) return;
  const symbols = Object.keys(P).map((n) =>
    `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths(n)}</symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`);
}
