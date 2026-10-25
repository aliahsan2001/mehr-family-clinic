/* Mehr Family Clinic — site data. Everything a real clinic would edit lives here.
   People, numbers and addresses are placeholders for this concept. */

export const img = (id, w = 800) => `/img/p/${id}-${w > 700 ? 1280 : 640}.webp`;

export const CONFIG = {
  name: 'Mehr Family Clinic',
  // Empty for the concept so WhatsApp lets the visitor choose a chat. Set e.g. '923001234567' for a real clinic.
  whatsappNumber: '',
  phoneDisplay: '+92 21 3400 0000',
  phoneHref: 'tel:+922134000000',
  emergencyDisplay: '+92 21 3400 0911',
  emergencyHref: 'tel:+922134000911',
  email: 'care@mehrclinic.example',
  address: 'Plot 14, Block 7, Gulshan-e-Iqbal, Karachi',
  mapQuery: 'Gulshan-e-Iqbal Block 7, Karachi',
  slotMinutes: 20,
  // 0 = Sunday, 24h clock, Asia/Karachi
  hours: [
    { day: 'Sunday', open: '10:00', close: '14:00' },
    { day: 'Monday', open: '09:00', close: '22:00' },
    { day: 'Tuesday', open: '09:00', close: '22:00' },
    { day: 'Wednesday', open: '09:00', close: '22:00' },
    { day: 'Thursday', open: '09:00', close: '22:00' },
    { day: 'Friday', open: '09:00', close: '22:00' },
    { day: 'Saturday', open: '09:00', close: '22:00' },
  ],
  labHours: 'Samples 8 am – 1 pm, Monday to Saturday. Most reports the same evening.',
};

// schedule: day index -> [start, end]
export const DOCTORS = [
  {
    id: 'ayesha', name: 'Dr. Ayesha Siddiqui', role: 'General Physician', tone: '#0f8b8d',
    quals: 'MBBS, FCPS (Family Medicine)', years: 14, langs: 'Urdu, English',
    about: 'Leads the morning clinic. Long-term care for diabetes, blood pressure and thyroid.',
    schedule: { 1: ['09:00', '14:00'], 2: ['09:00', '14:00'], 3: ['09:00', '14:00'], 4: ['09:00', '14:00'], 5: ['09:00', '12:30'], 6: ['09:00', '14:00'] },
  },
  {
    id: 'imran', name: 'Dr. Imran Qureshi', role: 'General Physician', tone: '#2f6f8f',
    quals: 'MBBS, MCPS (Medicine)', years: 11, langs: 'Urdu, English, Sindhi',
    about: 'Runs the evening clinic for people who work days. Fevers, infections and check-ups.',
    schedule: { 1: ['17:00', '22:00'], 2: ['17:00', '22:00'], 3: ['17:00', '22:00'], 4: ['17:00', '22:00'], 5: ['17:00', '22:00'], 6: ['17:00', '21:00'] },
  },
  {
    id: 'sana', name: 'Dr. Sana Malik', role: "General Physician · Women's health", tone: '#8a5a9e',
    quals: 'MBBS, MRCGP (UK)', years: 9, langs: 'Urdu, English, Punjabi',
    about: "Afternoon clinic focused on women's health, pregnancy check-ins and family planning.",
    schedule: { 1: ['14:00', '18:00'], 3: ['14:00', '18:00'], 5: ['14:30', '18:00'], 6: ['14:00', '17:00'] },
  },
  {
    id: 'kamran', name: 'Dr. Kamran Shah', role: 'General Physician', tone: '#3d7a5c',
    quals: 'MBBS, Dip. Family Medicine', years: 7, langs: 'Urdu, English, Pashto',
    about: 'Covers Sunday and Tuesday afternoons. Minor procedures, dressings and fitness certificates.',
    schedule: { 0: ['10:00', '14:00'], 2: ['14:00', '17:00'], 4: ['14:00', '17:00'] },
  },
  {
    id: 'farhan', name: 'Dr. Farhan Ahmed', role: 'Paediatrician · Visiting', tone: '#c2703d', visiting: true,
    quals: 'MBBS, FCPS (Paediatrics)', years: 16, langs: 'Urdu, English',
    about: 'Newborn checks, vaccinations, growth and fevers. Children of every age.',
    schedule: { 2: ['16:00', '20:00'], 4: ['16:00', '20:00'] },
  },
  {
    id: 'nadia', name: 'Dr. Nadia Hussain', role: 'Dermatologist · Visiting', tone: '#b0566a', visiting: true,
    quals: 'MBBS, FCPS (Dermatology)', years: 12, langs: 'Urdu, English',
    about: 'Acne, eczema, hair loss and skin checks. Minor skin procedures by appointment.',
    schedule: { 3: ['18:00', '21:00'], 6: ['11:00', '15:00'] },
  },
];

export const SERVICES = [
  {
    id: 'consult', title: 'Consultations', icon: 'stethoscope', img: '1758273240360-76b908e7582a',
    blurb: 'Unhurried appointments with a family doctor, or one of our visiting specialists.',
    items: [
      ['General consultation', 1500], ['Specialist consultation', 2500], ['Follow-up within 7 days', 800], ['Home visit (Gulshan & nearby)', 4000],
    ],
  },
  {
    id: 'lab', title: 'Lab tests', icon: 'flask', img: '1639772823849-6efbd173043c',
    blurb: 'On-site sample collection, with reports on WhatsApp the same evening.',
    items: [
      ['Complete blood count (CBC)', 900], ['Fasting sugar', 400], ['HbA1c', 1600], ['Lipid profile', 1800], ['Thyroid (TSH)', 1500], ['Vitamin D', 2800], ['Urine routine', 500],
    ],
  },
  {
    id: 'vaccines', title: 'Vaccinations', icon: 'syringe', img: '1612277795421-9bc7706a4a34',
    blurb: 'Child immunisation on schedule, and the adult jabs people forget about.',
    items: [
      ['Child immunisation visit', 1200], ['Influenza (yearly)', 2200], ['Typhoid', 1800], ['Hepatitis B (per dose)', 1200], ['Tetanus booster', 700],
    ],
  },
  {
    id: 'packages', title: 'Check-up packages', icon: 'clipboard', img: '1666887360680-9dc27a1d2753',
    blurb: 'A full picture in one visit: tests in the morning, results with the doctor that evening.',
    items: [
      ['Basic Health Check', 4500], ['Heart & Diabetes Check', 8900], ["Women's Wellness", 9500], ['Senior Care Check', 11500],
    ],
  },
];

export const PACKAGES = [
  { name: 'Basic Health Check', price: 4500, for: 'Everyone, once a year', includes: ['Doctor consultation', 'Blood pressure & BMI', 'CBC and fasting sugar', 'Urine routine'] },
  { name: 'Heart & Diabetes Check', price: 8900, for: 'Over 35, or family history', includes: ['Everything in Basic', 'Lipid profile and HbA1c', 'ECG', 'Diet advice sheet'] },
  { name: "Women's Wellness", price: 9500, for: 'Women of any age', includes: ['Consultation with Dr. Sana', 'Thyroid and Vitamin D', 'CBC and iron', 'Breast-health guidance'] },
  { name: 'Senior Care Check', price: 11500, for: '60 and over', includes: ['Unhurried 40-minute visit', 'Heart, kidney and liver tests', 'Bone health check', 'Medicines review'] },
];
