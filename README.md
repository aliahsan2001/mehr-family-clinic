# Mehr Family Clinic: "Calm in, care out"

[**Live demo**](https://mehr-family-clinic.vercel.app) · [Source files](./src/) · [Local setup](#run-it)

## Project at a glance

Doctor and date selection, booking confirmation, downloadable calendar events, and lighter-device fallbacks.

**Scope:** Frontend concept for a fictional clinic. Availability is simulated; appointments are not stored or confirmed by a backend.

Concept project 2 of 8 for the Aqoa Systems portfolio. A fictional neighbourhood clinic in Gulshan-e-Iqbal, Karachi.

## What's in it
| Page | Signature moment |
|---|---|
| Home | A glass heart floats in soft teal light and breathes (4 seconds in, 6 out). A pulse line draws itself down the page as you scroll, beating once at each section. "Who's in today" shows each doctor's live status. |
| Services | Thin-line icons draw themselves in. Hover a card and it tilts gently to reveal every price (touch screens show the list). |
| Doctors | Cards flip in 3D to show each weekly timetable. A pulsing dot marks who is in today. |
| Book | Pick a doctor and the week unfolds as 3D day cards. Pick a day and open slots rise while booked ones stay faded. Confirming turns the pulse line into a checkmark. |
| Contact | An illustrated map whose walking route draws itself to the clinic. Directions sharpen from a soft blur as you read. |

**Signature interaction:** booking. It ends with an on-screen confirmation, a downloadable calendar file (.ics, with a 2-hour reminder), and a formatted WhatsApp message for reception.

Also included: soft teal-wash page transitions, a "Breathe with us" guided-breathing button on every page, large readable type (Atkinson Hyperlegible), and buttons that glow rather than bounce. The site has no sound, by design.

## Stack
Vite · Three.js · GSAP + ScrollTrigger · Lenis · Barba.js · SplitType

## Run it
From a terminal:
```bash
npm ci
npm run dev
```
The site uses ES modules, so it needs a server: opening `index.html` by double-clicking won't work. Testing flags: `?lite` forces the lighter version, `?full` forces 3D.

## Deploy on Vercel
Import the repo, leave **Root Directory** at the repository root (`./`), and keep the detected **Vite** preset. `vercel.json` turns on clean URLs.

## Lighter devices
Weaker phones, data-saver users and anyone without WebGL get a drawn heart that breathes with CSS, with the same content. Reduced-motion visitors get simple fades. On phones the week of day cards scrolls sideways with a swipe.

## Before publishing
- Search "Mehr Family Clinic" on Google to check no real clinic uses the name.
- Doctors, prices, numbers and the address are placeholders. Everything lives in `src/data.js`.
- Booked slots are simulated with a fixed pattern. A real clinic would connect a booking backend (the brief suggests a reception dashboard and SMS/WhatsApp reminders).
- Doctors are shown as monogram avatars rather than stock photos, since they're fictional people.

Photos from Unsplash (free licence), self-hosted as WebP in `public/img/p/`.
