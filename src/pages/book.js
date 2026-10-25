/* Booking: doctor -> day -> time -> details.
   Picking a doctor unfolds their week as a row of 3D day cards; picking a day makes the open
   slots rise up while booked ones stay faded. Confirming turns the pulse line into a check. */

import { DOCTORS, CONFIG } from '../data.js';
import { esc, waLink, store } from '../core/ui.js';
import { REDUCED } from '../core/env.js';
import { gsap, scrollToEl } from '../core/motion.js';
import { doctorToday, nextIn, weekFor, slotsFor, fmtTime, doctorById, DAY_SHORT, DAY_NAMES } from '../core/hours.js';
import { avatar, stateDot } from '../core/people.js';

const STEPS = ['doctor', 'day', 'time', 'details', 'done'];
const PROGRESS = { doctor: 0.1, day: 0.36, time: 0.6, details: 0.84, done: 1 };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DETAILS_KEY = 'mehr-patient';

export async function mount(root) {
  const stage = root.querySelector('[data-stage]');
  const summary = root.querySelector('[data-summary]');
  const fill = root.querySelector('[data-pl-fill]');
  const check = root.querySelector('[data-pl-check]');
  const pills = root.querySelectorAll('[data-step-pill]');

  const preset = new URLSearchParams(location.search).get('doctor');
  const state = {
    step: 'doctor',
    doctor: doctorById(preset) || null,
    day: null,
    slot: null,
    patient: Object.assign({ name: '', phone: '', type: 'new', who: 'Myself', reason: '' }, store.get(DETAILS_KEY, {})),
    ref: null,
  };

  /* ---------- progress line ---------- */
  function paintProgress() {
    const p = PROGRESS[state.step];
    const idx = STEPS.indexOf(state.step);
    fill.style.strokeDashoffset = 1 - p; // eased by a CSS transition
    pills.forEach((li, i) => {
      li.classList.toggle('is-done', i < idx);
      li.classList.toggle('is-current', i === idx);
      li.toggleAttribute('data-clickable', i < idx && state.step !== 'done');
    });
  }

  root.querySelector('[data-steps]').addEventListener('click', (e) => {
    const li = e.target.closest('[data-clickable]');
    if (li) go(li.dataset.stepPill);
  });

  /* ---------- summary card ---------- */
  function paintSummary() {
    const d = state.doctor;
    summary.innerHTML = `
      <p class="mono">Your appointment</p>
      <div class="sum-row ${d ? 'is-set' : ''}">
        ${d ? avatar(d, 'sm') : '<span class="sum-empty" aria-hidden="true"></span>'}
        <div><span class="sum-label">Doctor</span><b>${d ? esc(d.name) : 'Not chosen yet'}</b></div>
      </div>
      <div class="sum-row ${state.day ? 'is-set' : ''}">
        <span class="sum-ico"><svg aria-hidden="true"><use href="#i-calendar"/></svg></span>
        <div><span class="sum-label">Day</span><b>${state.day ? dayLabel(state.day) : '—'}</b></div>
      </div>
      <div class="sum-row ${state.slot ? 'is-set' : ''}">
        <span class="sum-ico"><svg aria-hidden="true"><use href="#i-clock"/></svg></span>
        <div><span class="sum-label">Time</span><b>${state.slot ? `${state.slot.label} · ${CONFIG.slotMinutes} min` : '—'}</b></div>
      </div>
      <p class="sum-fee">Consultation fee <b>Rs ${d?.visiting ? '2,500' : '1,500'}</b><span>Pay at the clinic, cash or card.</span></p>`;
  }

  const dayLabel = (day) => `${DAY_NAMES[day.day]}, ${day.date.getUTCDate()} ${MONTHS[day.date.getUTCMonth()]}`;

  /* ---------- step views ---------- */
  function viewDoctor() {
    stage.innerHTML = `
      <h2 class="stage-title">Who would you like to see?</h2>
      <p class="stage-sub">Not sure? Any family doctor can help, and refer you to a specialist if needed.</p>
      <div class="pick-doctors" role="radiogroup" aria-label="Choose a doctor">
        ${DOCTORS.map((d) => {
          const s = doctorToday(d);
          return `
          <button type="button" class="pick-doctor ${state.doctor?.id === d.id ? 'is-selected' : ''}" role="radio" aria-checked="${state.doctor?.id === d.id}" data-pick-doctor="${d.id}">
            ${avatar(d)}
            <span class="pd-text"><b>${esc(d.name)}</b><span>${esc(d.role)}</span><span class="pd-state">${stateDot(s.state)}${esc(s.state === 'off' ? nextIn(d) : s.label)}</span></span>
            <span class="pd-check" aria-hidden="true"><svg><use href="#i-check"/></svg></span>
          </button>`;
        }).join('')}
      </div>`;
    if (!REDUCED) gsap.from(stage.querySelectorAll('.pick-doctor'), { y: 18, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'sine.out' });
  }

  function viewDay() {
    const week = weekFor(state.doctor);
    stage.innerHTML = `
      <h2 class="stage-title">Which day suits you?</h2>
      <p class="stage-sub">${esc(state.doctor.name)} is in on the highlighted days this week.</p>
      <div class="day-row" role="radiogroup" aria-label="Choose a day">
        ${week.map((d, i) => `
          <button type="button" class="day-card ${d.hours ? '' : 'is-off'} ${state.day?.iso === d.iso ? 'is-selected' : ''}" ${d.hours ? '' : 'disabled'} role="radio" aria-checked="${state.day?.iso === d.iso}" data-pick-day="${i}">
            <span class="dc-day">${i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_SHORT[d.day]}</span>
            <span class="dc-date">${d.date.getUTCDate()}</span>
            <span class="dc-month">${MONTHS[d.date.getUTCMonth()]}</span>
            <span class="dc-hours">${d.hours ? `${fmtTime(d.hours[0])} – ${fmtTime(d.hours[1])}` : 'Not in'}</span>
            <span class="dc-free" data-free="${i}"></span>
          </button>`).join('')}
      </div>
      <button type="button" class="link-btn back-link" data-back="doctor">Choose a different doctor</button>`;
    // show how many slots are still free on each day
    week.forEach((d, i) => {
      const n = slotsFor(state.doctor, d).filter((s) => s.available).length;
      const out = stage.querySelector(`[data-free="${i}"]`);
      if (d.hours) out.textContent = n ? `${n} open` : 'Fully booked';
      if (d.hours && !n) stage.querySelector(`[data-pick-day="${i}"]`).classList.add('is-full');
    });
    // the week unfolds, card by card, like a folded timetable opening out
    if (!REDUCED) gsap.from(stage.querySelectorAll('.day-card'), {
      rotationY: -95, transformOrigin: '0% 50%', opacity: 0, transformPerspective: 900,
      duration: 1.1, stagger: 0.09, ease: 'sine.out',
    });
    state._week = week;
  }

  function viewTime() {
    const slots = slotsFor(state.doctor, state.day);
    const groups = [['Morning', (m) => m < 720], ['Afternoon', (m) => m >= 720 && m < 1020], ['Evening', (m) => m >= 1020]];
    stage.innerHTML = `
      <h2 class="stage-title">Choose a time</h2>
      <p class="stage-sub">${dayLabel(state.day)} with ${esc(state.doctor.name)}. Faded times are already booked.</p>
      ${groups.map(([name, test]) => {
        const g = slots.filter((s) => test(s.min));
        if (!g.length) return '';
        return `<div class="slot-group"><p class="mono">${name}</p><div class="slots" role="radiogroup" aria-label="${name} times">
          ${g.map((s) => `<button type="button" class="slot ${s.available ? '' : 'is-booked'} ${state.slot?.min === s.min ? 'is-selected' : ''}" ${s.available ? '' : 'disabled'} role="radio" aria-checked="${state.slot?.min === s.min}" data-pick-slot="${s.min}" aria-label="${s.label}${s.available ? '' : s.past ? ', passed' : ', booked'}">${s.label}</button>`).join('')}
        </div></div>`;
      }).join('')}
      <button type="button" class="link-btn back-link" data-back="day">Choose a different day</button>`;
    state._slots = slots;
    if (!REDUCED) {
      // open slots rise up to meet you; booked ones stay low and faded
      gsap.from(stage.querySelectorAll('.slot:not(.is-booked)'), { y: 26, opacity: 0, duration: 0.9, stagger: 0.03, ease: 'sine.out' });
      gsap.from(stage.querySelectorAll('.slot.is-booked'), { opacity: 0, duration: 1.2, ease: 'sine.out' });
    }
  }

  function viewDetails() {
    const p = state.patient;
    stage.innerHTML = `
      <h2 class="stage-title">A few details</h2>
      <p class="stage-sub">So reception knows who to expect. We'll only use your number about this visit.</p>
      <form class="details-form" data-details novalidate>
        <div class="field"><label for="b-name">Patient's full name</label><input id="b-name" name="name" autocomplete="name" value="${esc(p.name)}"><p class="field-error" data-error="name"></p></div>
        <div class="field"><label for="b-phone">Mobile number</label><input id="b-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="03XX XXXXXXX" value="${esc(p.phone)}"><p class="field-error" data-error="phone"></p></div>
        <div class="field-row">
          <fieldset class="seg" aria-label="Have you visited before?">
            <label><input type="radio" name="type" value="new" ${p.type === 'new' ? 'checked' : ''}><span>First visit</span></label>
            <label><input type="radio" name="type" value="returning" ${p.type === 'returning' ? 'checked' : ''}><span>Been before</span></label>
          </fieldset>
          <div class="field"><label for="b-who">Booking for</label><select id="b-who" name="who">${['Myself', 'My child', 'A parent', 'Someone else'].map((w) => `<option ${w === p.who ? 'selected' : ''}>${w}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label for="b-reason">What would you like help with? <span class="optional">optional</span></label><textarea id="b-reason" name="reason" rows="3" placeholder="A few words is plenty, e.g. 'fever for three days'">${esc(p.reason)}</textarea></div>
        <button type="submit" class="btn btn-primary btn-block">Confirm appointment</button>
        <button type="button" class="link-btn back-link" data-back="time">Choose a different time</button>
      </form>`;
  }

  function viewDone() {
    const d = state.doctor, p = state.patient;
    stage.innerHTML = `
      <div class="done">
        <p class="mono">Request confirmed · ${esc(state.ref)}</p>
        <h2 class="stage-title">See you on ${DAY_NAMES[state.day.day]}, ${esc(p.name.split(' ')[0] || 'friend')}.</h2>
        <p class="stage-sub">Please arrive 10 minutes early. Reception will call ${esc(p.phone)} if anything changes.</p>
        <dl class="done-card">
          <div><dt>Doctor</dt><dd>${esc(d.name)}</dd></div>
          <div><dt>When</dt><dd>${dayLabel(state.day)} · ${state.slot.label}</dd></div>
          <div><dt>Where</dt><dd>${esc(CONFIG.address)}</dd></div>
          <div><dt>Patient</dt><dd>${esc(p.name)}${p.who !== 'Myself' ? ` (${esc(p.who.toLowerCase())})` : ''} · ${p.type === 'new' ? 'first visit' : 'returning'}</dd></div>
        </dl>
        <div class="done-actions">
          <button type="button" class="btn btn-primary" data-ics><svg aria-hidden="true"><use href="#i-download"/></svg>Add to my calendar</button>
          <a class="btn btn-ghost" data-wa-summary target="_blank" rel="noopener" href="#"><svg aria-hidden="true"><use href="#i-wa"/></svg>Send to reception</a>
        </div>
        <button type="button" class="link-btn back-link" data-restart>Book another appointment</button>
      </div>`;
    stage.querySelector('[data-wa-summary]').href = waLink(summaryText());
    if (!REDUCED) gsap.from(stage.querySelectorAll('.done > *'), { y: 16, opacity: 0, duration: 1, stagger: 0.1, ease: 'sine.out', delay: 0.6 });
  }

  const VIEWS = { doctor: viewDoctor, day: viewDay, time: viewTime, details: viewDetails, done: viewDone };

  function go(step) {
    const render = () => {
      state.step = step;
      VIEWS[step]();
      paintSummary();
      paintProgress();
      stage.querySelector('.stage-title')?.setAttribute('tabindex', '-1');
      stage.querySelector('.stage-title')?.focus({ preventScroll: true });
    };
    if (REDUCED || !stage.children.length) return render();
    // a soft cross-fade between steps
    const out = gsap.to(stage, { opacity: 0, y: -8, duration: 0.35, ease: 'sine.in', onComplete: () => {
      render();
      const back = gsap.fromTo(stage, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'sine.out' });
      setTimeout(() => back.progress(1), 900); // never leave a step invisible if frames stall
      const top = root.querySelector('[data-progress]');
      if (top.getBoundingClientRect().top < 0) scrollToEl(top, -110);
    } });
    setTimeout(() => out.progress(1), 600);
  }

  /* ---------- events ---------- */
  stage.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.dataset.pickDoctor) {
      state.doctor = doctorById(t.dataset.pickDoctor);
      state.day = null; state.slot = null;
      return go('day');
    }
    if (t.dataset.pickDay) {
      state.day = state._week[Number(t.dataset.pickDay)];
      state.slot = null;
      return go('time');
    }
    if (t.dataset.pickSlot) {
      state.slot = state._slots.find((s) => s.min === Number(t.dataset.pickSlot));
      return go('details');
    }
    if (t.dataset.back) return go(t.dataset.back);
    if (t.matches('[data-ics]')) return downloadIcs();
    if (t.matches('[data-restart]')) {
      Object.assign(state, { doctor: null, day: null, slot: null, ref: null });
      gsap.set(check, { opacity: 0 });
      root.querySelector('.progress').classList.remove('is-complete');
      return go('doctor');
    }
  });

  stage.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = Object.fromEntries(new FormData(form));
    Object.assign(state.patient, fd);
    store.set(DETAILS_KEY, state.patient);
    const errors = {};
    if ((fd.name || '').trim().length < 2) errors.name = "Please add the patient's name.";
    if (!/^(\+92|0092|0)?3\d{9}$/.test((fd.phone || '').replace(/[\s-]/g, ''))) errors.phone = 'Please check the number. It should look like 0300 1234567.';
    form.querySelectorAll('[data-error]').forEach((p) => {
      p.textContent = errors[p.dataset.error] || '';
      form.elements[p.dataset.error]?.setAttribute('aria-invalid', errors[p.dataset.error] ? 'true' : 'false');
    });
    const first = Object.keys(errors)[0];
    if (first) return form.elements[first].focus();
    state.ref = 'MFC-' + Date.now().toString(36).slice(-5).toUpperCase();
    confirmLine();
    go('done');
  });

  // the pulse line finishes its run, then becomes a checkmark
  function confirmLine() {
    const prog = root.querySelector('.progress');
    prog.classList.add('is-complete');
    const parts = check.querySelectorAll('circle, path');
    if (REDUCED) { gsap.set(check, { opacity: 1 }); gsap.set(parts, { strokeDashoffset: 0 }); return; }
    gsap.timeline({ delay: 0.3 })
      .to(root.querySelector('.progress-line'), { opacity: 0, scaleX: 0.2, duration: 0.6, ease: 'sine.in' })
      .set(check, { opacity: 1 })
      .fromTo(parts, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.3, ease: 'sine.out' });
  }

  function summaryText() {
    const p = state.patient;
    return [`*Appointment request · ${CONFIG.name}*`, `Ref ${state.ref}`, '', `Doctor: ${state.doctor.name}`, `When: ${dayLabel(state.day)}, ${state.slot.label}`,
      `Patient: ${p.name} (${p.who}, ${p.type === 'new' ? 'first visit' : 'returning'})`, `Phone: ${p.phone}`, ...(p.reason?.trim() ? ['', `Reason: ${p.reason.trim()}`] : [])].join('\n');
  }

  function downloadIcs() {
    // Karachi is UTC+5 all year, so convert straight to UTC
    const startMs = state.day.date.getTime() + (state.slot.min - 300) * 60000;
    const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mehr Family Clinic//Booking//EN', 'BEGIN:VEVENT',
      `UID:${state.ref}@mehrclinic.example`, `DTSTAMP:${stamp(Date.now())}`, `DTSTART:${stamp(startMs)}`, `DTEND:${stamp(startMs + CONFIG.slotMinutes * 60000)}`,
      `SUMMARY:Appointment with ${state.doctor.name}`, `LOCATION:${CONFIG.address.replace(/,/g, '\\,')}`,
      `DESCRIPTION:Mehr Family Clinic · Ref ${state.ref}. Please arrive 10 minutes early.`,
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Clinic appointment in 2 hours', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `mehr-appointment-${state.ref}.ics`;
    a.setAttribute('data-no-barba', '');
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  fill.style.strokeDasharray = 1;
  fill.style.strokeDashoffset = 1;
  gsap.set(check, { opacity: 0 });
  gsap.set(check.querySelectorAll('circle, path'), { strokeDasharray: 1, strokeDashoffset: 1 });
  go(state.doctor ? 'day' : 'doctor');
  return () => {};
}
