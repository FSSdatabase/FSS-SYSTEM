export const NAVY = "#1F3864";
export const GOLD = "#C9A84C";

export const CONV_NAME = {
  N1:"Nursery 1", N2:"Nursery 2", N3:"Nursery 3",
  P1:"Primary 1", P2:"Primary 2", P3:"Primary 3",
  P4:"Primary 4", P5:"Primary 5", P6:"Primary 6",
  JSS1:"JSS 1",   JSS2:"JSS 2",   JSS3:"JSS 3",
  SS1:"SS 1",     SS2:"SS 2",     SS3:"SS 3",
  DIP1:"Diploma Yr 1", DIP2:"Diploma Yr 2",
};
export const CONV_CLASSES = Object.keys(CONV_NAME);

export const ISL_LEVELS = [
  // ── Islamiyyah — Raudah (Nursery) ─────────────────────────────────
  "Raudah 1A", "Raudah 1B",                     // Raudah 1: two arms (A & B)
  "Raudah 2",                                     // single arm
  "Raudah 3",                                     // single arm
  // ── Islamiyyah — Primary ──────────────────────────────────────────
  "Pri 1A Islamiyyah", "Pri 1B Islamiyyah",       // Primary 1: two arms (A & B)
  "Pri 2 Islamiyyah",                             // single arm each
  "Pri 3 Islamiyyah",
  "Pri 4 Islamiyyah",
  "Pri 5 Islamiyyah",
  // ── Barnamaj (Primary 6 / Pre-Mutawassid) ─────────────────────────
  "Barnamaj",
  // ── Mutawassid / JIS ──────────────────────────────────────────────
  "Mutawassid 1", "Mutawassid 2", "Mutawassid 3 (Exam Prep)",
  // ── Thanawiy / SIS ────────────────────────────────────────────────
  "Thanawiy 1 (SIS 1)", "Thanawiy 2 (SIS 2)", "Thanawiy 3 (Exam Prep)",
  // ── Tahfeez Section ────────────────────────────────────────────────
  "Tahfeez — Beginner", "Tahfeez — Intermediate", "Tahfeez — Advanced",
  // ── Diploma ────────────────────────────────────────────────────────
  "Diploma — English Language", "Diploma — Arabic Language",
  "Diploma — Islamic Studies",  "Diploma — Computer Studies", "Diploma — Sciences",
  // ── Special Programmes ─────────────────────────────────────────────
  "Majlisul Ilm Islamic (Halaqatul Imamil Bukhari)",
  "Majlisul Ilm Arabic (Halaqatu Ibni Hisham)",
  "Special Programme — Other",
  // ── Skills ─────────────────────────────────────────────────────────
  "Skills — Vocational", "Skills — Trade", "Skills — Entrepreneurship",
];

export const DEFAULT_FEE_RATES = {
  N1:28288, N2:28288, N3:28288,
  P1:28288, P2:28288, P3:28288, P4:28288, P5:28288, P6:28288,
  JSS1:29000, JSS2:29000, JSS3:29000,
  SS1:30000,  SS2:30000,  SS3:30000,
  DIP1:45000, DIP2:45000,
};

export const SUBJECTS = [
  "English Language", "Daily Communication (ESME)", "Mathematics",
  "Basic Science & Technology", "Social Studies", "Islamic Studies",
  "Arabic Language", "Quran Studies / Tahfeez", "Computer Science",
  "Agricultural Science", "Civic Education", "Home Economics",
  "Physical & Health Education", "Fine Art", "French",
  "Fiqh", "Hadith", "Seerah", "Usul al-Fiqh", "Balaghah",
];

export const ROLES = [
  "Principal", "Vice Principal Admin", "Vice Principal Academics",
  "Head of Islamiyyah", "Head of Mutawassid", "Head of Tahfeez",
  "Class Teacher", "Teacher", "Admin Officer", "Bursar",
  "Chief Care Giver", "Care Giver", "Support Staff",
];

export const DEPTS = [
  "Conventional", "Islamiyyah", "Tahfeez",
  "Diploma", "Special Programmes", "Skills",
  "Administration", "Finance", "Non-Academic",
];

export const TERMS = [
  { id: "1", label: "1st Term" },
  { id: "2", label: "2nd Term" },
  { id: "3", label: "3rd Term" },
];

export const ISL_SUBJECTS = [
  "Fiqh", "Hadith", "Seerah",
  "Arabic Grammar (Nahw)", "Morphology (Sarf)",
  "Quran Recitation", "Islamic History", "Tafsir",
];

export const TAH_QUALITY = ["Excellent", "Good", "Fair", "Weak"];

// Timetable for JSS1 (template — extend for other classes in Manage → Settings)
export const TIMETABLE_JSS1 = {
  Mon: [
    { slot:"8:00–8:40",  sub:"Mathematics",          teacher:"Muhammad Bukhari Usman", color:"#1F3864" },
    { slot:"8:40–9:20",  sub:"English Language",     teacher:"Zainab Muhammad",         color:"#2e5e4e" },
    { slot:"9:20–10:00", sub:"Basic Sci. & Tech",    teacher:"Amina Yusuf Mshelia",     color:"#4b2e83" },
    { slot:"10:00–10:20",sub:"BREAK",                teacher:"",                         color:"#e2e8f0", special:true },
    { slot:"10:20–11:00",sub:"Social Studies",       teacher:"Hafsat Salihu Mai Riga",   color:"#b45309" },
    { slot:"11:00–11:40",sub:"Arabic Language",      teacher:"Aisha Saad",              color:"#0f766e" },
    { slot:"11:40–12:30",sub:"DHUHR / LUNCH",        teacher:"",                         color:"#e8f4ea", special:true },
    { slot:"12:30–1:10", sub:"Islamic Studies",      teacher:"Mahmud Ibrahim Umar",      color:"#0f766e" },
    { slot:"1:10–1:50",  sub:"Computer Science",     teacher:"Amina Yusuf Mshelia",      color:"#4b2e83" },
  ],
  Tue: [
    { slot:"8:00–8:40",  sub:"English Language",     teacher:"Zainab Muhammad",          color:"#2e5e4e" },
    { slot:"8:40–9:20",  sub:"Mathematics",          teacher:"Muhammad Bukhari Usman",   color:"#1F3864" },
    { slot:"9:20–10:00", sub:"Civic Education",      teacher:"Hafsat Salihu Mai Riga",   color:"#b45309" },
    { slot:"10:00–10:20",sub:"BREAK",                teacher:"",                          color:"#e2e8f0", special:true },
    { slot:"10:20–11:00",sub:"Arabic Language",      teacher:"Aisha Saad",               color:"#0f766e" },
    { slot:"11:00–11:40",sub:"Basic Sci. & Tech",    teacher:"Amina Yusuf Mshelia",      color:"#4b2e83" },
    { slot:"11:40–12:30",sub:"DHUHR / LUNCH",        teacher:"",                          color:"#e8f4ea", special:true },
    { slot:"12:30–1:10", sub:"Mathematics",          teacher:"Muhammad Bukhari Usman",   color:"#1F3864" },
    { slot:"1:10–1:50",  sub:"Agricultural Science", teacher:"Fatima Attahir",           color:"#b45309" },
  ],
  Wed: [
    { slot:"8:00–8:40",  sub:"Islamic Studies",      teacher:"Mahmud Ibrahim Umar",      color:"#0f766e" },
    { slot:"8:40–9:20",  sub:"English Language",     teacher:"Zainab Muhammad",          color:"#2e5e4e" },
    { slot:"9:20–10:00", sub:"Mathematics",          teacher:"Muhammad Bukhari Usman",   color:"#1F3864" },
    { slot:"10:00–10:20",sub:"BREAK",                teacher:"",                          color:"#e2e8f0", special:true },
    { slot:"10:20–11:00",sub:"Social Studies",       teacher:"Hafsat Salihu Mai Riga",   color:"#b45309" },
    { slot:"11:00–11:40",sub:"Computer Science",     teacher:"Amina Yusuf Mshelia",      color:"#4b2e83" },
    { slot:"11:40–12:30",sub:"DHUHR / LUNCH",        teacher:"",                          color:"#e8f4ea", special:true },
    { slot:"12:30–1:10", sub:"Fine Art",             teacher:"Nafisa Lukman",            color:"#7b1e1e" },
    { slot:"1:10–1:50",  sub:"Physical Education",   teacher:"Saudat Sufyan",            color:"#b45309" },
  ],
  Thu: [
    { slot:"8:00–8:40",  sub:"Mathematics",          teacher:"Muhammad Bukhari Usman",   color:"#1F3864" },
    { slot:"8:40–9:20",  sub:"Arabic Language",      teacher:"Aisha Saad",               color:"#0f766e" },
    { slot:"9:20–10:00", sub:"English Language",     teacher:"Zainab Muhammad",          color:"#2e5e4e" },
    { slot:"10:00–10:20",sub:"BREAK",                teacher:"",                          color:"#e2e8f0", special:true },
    { slot:"10:20–11:00",sub:"Basic Sci. & Tech",    teacher:"Amina Yusuf Mshelia",      color:"#4b2e83" },
    { slot:"11:00–11:40",sub:"Civic Education",      teacher:"Hafsat Salihu Mai Riga",   color:"#b45309" },
    { slot:"11:40–12:30",sub:"DHUHR / LUNCH",        teacher:"",                          color:"#e8f4ea", special:true },
    { slot:"12:30–1:10", sub:"Islamic Studies",      teacher:"Mahmud Ibrahim Umar",      color:"#0f766e" },
    { slot:"1:10–1:50",  sub:"Home Economics",       teacher:"Nafisa Lukman",            color:"#2e5e4e" },
  ],
  Fri: [
    { slot:"8:00–8:40",  sub:"English Language",     teacher:"Zainab Muhammad",          color:"#2e5e4e" },
    { slot:"8:40–9:20",  sub:"Mathematics",          teacher:"Muhammad Bukhari Usman",   color:"#1F3864" },
    { slot:"9:20–10:00", sub:"Arabic Language",      teacher:"Aisha Saad",               color:"#0f766e" },
    { slot:"10:00–10:20",sub:"BREAK",                teacher:"",                          color:"#e2e8f0", special:true },
    { slot:"10:20–11:00",sub:"Social Studies",       teacher:"Hafsat Salihu Mai Riga",   color:"#b45309" },
    { slot:"11:00–11:40",sub:"Basic Sci. & Tech",    teacher:"Amina Yusuf Mshelia",      color:"#4b2e83" },
    { slot:"11:40–1:30", sub:"JUM'AH PRAYER",        teacher:"",                          color:"#e8f4ea", special:true },
    { slot:"1:30–2:00",  sub:"Islamic Studies",      teacher:"Mahmud Ibrahim Umar",      color:"#0f766e" },
    { slot:"2:00",       sub:"CLOSING",              teacher:"",                          color:"#e2e8f0", special:true },
  ],
  Sat: [
    { slot:"8:00–8:40",  sub:"Quran / Tahfeez",      teacher:"Mahmud Ibrahim Umar",      color:"#0f766e" },
    { slot:"8:40–9:20",  sub:"Arabic Language",      teacher:"Aisha Saad",               color:"#0f766e" },
    { slot:"9:20–10:00", sub:"Islamic Studies",      teacher:"Mahmud Ibrahim Umar",      color:"#0f766e" },
    { slot:"10:00–10:15",sub:"BREAK",                teacher:"",                          color:"#e2e8f0", special:true },
    { slot:"10:15–11:00",sub:"Mathematics",          teacher:"Muhammad Bukhari Usman",   color:"#1F3864" },
    { slot:"11:00",      sub:"CLOSING",              teacher:"",                          color:"#e2e8f0", special:true },
  ],
};
