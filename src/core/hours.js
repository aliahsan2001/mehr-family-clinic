/* Clinic hours and doctor availability, in Asia/Karachi time. */

import { CONFIG, DOCTORS } from '../data.js';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

export function fmtTime(v) {
  const total = typeof v === 'number' ? v : toMin(v);
  let h = Math.floor(total / 60);
  const m = total % 60;
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}${m ? ':' + String(m).padStart(2, '0') : ''} ${ap}`;
}

// the current date and time as Karachi sees it
export function karachiNow() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return {
    day: DAY_SHORT.indexOf(get('weekday')),
    min: Number(get('hour')) * 60 + Number(get('minute')),
    date: new Date(Date.UTC(Number(get('year')), Number(get('month')) - 1, Number(get('day')))),
  };
}

export function clinicStatus() {
  const { day, min } = karachiNow();
  const h = CONFIG.hours[day];
  const o = toMin(h.open), c = toMin(h.close);
  if (min >= o && min < c) return { open: true, label: `Open now · until ${fmtTime(h.close)}` };
  if (min < o) return { open: false, label: `Closed · opens ${fmtTime(h.open)} today` };
  const next = CONFIG.hours[(day + 1) % 7];
  return { open: false, label: `Closed · opens ${fmtTime(next.open)} tomorrow` };
}

export function paintStatus(root = document) {
  const st = clinicStatus();
  root.querySelectorAll('[data-open-status]').forEach((el) => (el.textContent = st.label));
  root.querySelectorAll('[data-open-wrap]').forEach((el) => el.classList.toggle('is-open', st.open));
  return st;
}

// 'in' (seeing patients now), 'later' (in later today), 'off'
export function doctorToday(doc) {
  const { day, min } = karachiNow();
  const s = doc.schedule[day];
  if (!s) return { state: 'off', label: nextIn(doc) };
  const [a, b] = s.map(toMin);
  if (min >= a && min < b) return { state: 'in', label: `In now · until ${fmtTime(b)}` };
  if (min < a) return { state: 'later', label: `In today from ${fmtTime(a)}` };
  return { state: 'off', label: nextIn(doc) };
}

export function nextIn(doc) {
  const { day } = karachiNow();
  for (let k = 1; k <= 7; k++) {
    const d = (day + k) % 7;
    if (doc.schedule[d]) return `Back ${k === 1 ? 'tomorrow' : 'on ' + DAY_NAMES[d]} · ${fmtTime(doc.schedule[d][0])}`;
  }
  return 'By appointment';
}

/* ---------- bookable slots ---------- */
// deterministic "already booked" pattern, so the same day always looks the same
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 1000) / 1000;
}

export const isoDate = (d) => d.toISOString().slice(0, 10);

// the next 7 days from today (Karachi), each with the doctor's hours if any
export function weekFor(doc) {
  const { date } = karachiNow();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date.getTime() + i * 86400000);
    const day = d.getUTCDay();
    const s = doc.schedule[day];
    return { date: d, iso: isoDate(d), day, offset: i, hours: s || null };
  });
}

export function slotsFor(doc, dayInfo) {
  if (!dayInfo.hours) return [];
  const [a, b] = dayInfo.hours.map(toMin);
  const { min } = karachiNow();
  const out = [];
  for (let t = a; t + CONFIG.slotMinutes <= b; t += CONFIG.slotMinutes) {
    const past = dayInfo.offset === 0 && t <= min + 30;
    const booked = hash(`${doc.id}|${dayInfo.iso}|${t}`) < 0.38;
    out.push({ min: t, label: fmtTime(t), available: !past && !booked, past });
  }
  return out;
}

export const doctorById = (id) => DOCTORS.find((d) => d.id === id);
