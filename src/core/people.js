/* Doctors are shown as calm illustrated monograms rather than stock faces (they are
   fictional). Each has its own tone and a soft, slowly turning ring. */

import { esc } from './ui.js';

export function avatar(doc, size = 'md') {
  const initials = doc.name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('').slice(0, 2);
  return `<span class="doc-avatar doc-avatar-${size}" style="--tone:${doc.tone}" aria-hidden="true"><span class="doc-ring"></span><span class="doc-initials">${esc(initials)}</span></span>`;
}

export function stateDot(state) {
  return `<span class="state-dot state-${state}" aria-hidden="true"></span>`;
}
