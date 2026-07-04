/**
 * Tahfeez Programme — memorization levels, distinct from QLUS Islamiyyah levels.
 * Raudha 1–3 are memorization-intensive stages; naming is deliberately distinct
 * from QLUS_LEVELS' "Raudah" spelling to avoid conflating the two systems.
 */

export const TAHFEEZ_CURRICULUM = {
  "Raudha 1":        { fromN:87, toN:114, fromName:"Al-A'la",        toName:"An-Nas",
                        murajaah:"An-Nas", note:"Refresher: Al-Fatihah, Al-Falaq–An-Nas not counted as a level." },
  "Raudha 2":        { fromN:78, toN:87,  fromName:"An-Naba",        toName:"Al-A'la",
                        murajaah:"An-Nas", note:"Muraja'ah: An-Nas downward." },
  "Raudha 3":        { fromN:74, toN:77,  fromName:"Al-Muddaththir", toName:"Al-Mursalat",
                        murajaah:"An-Nas", note:"Muraja'ah: An-Nas downward." },
  "Faslul Awwal":    { fromN:62, toN:73,  fromName:"Al-Jumu'ah",     toName:"Al-Muzzammil",
                        murajaah:"An-Nas", note:"Muraja'ah: An-Nas downward." },
  "Fasluth Thani":   { fromN:55, toN:61,  fromName:"Ar-Rahman",      toName:"As-Saf",
                        murajaah:"An-Nas", note:"Muraja'ah: An-Nas downward." },
  "Fasluth Thalith": { fromN:46, toN:54,  fromName:"Al-Ahqaf",       toName:"Al-Qamar",
                        murajaah:"An-Nas", note:"Muraja'ah: An-Nas downward." },
  "Faslur Rabi'":    { fromN:36, toN:45,  fromName:"Ya-Sin",         toName:"Al-Jathiyah",
                        murajaah:"An-Nas", note:"Muraja'ah: An-Nas downward." },
  "Faslul Khamis":   { fromN:29, toN:35,  fromName:"Al-Ankabut",     toName:"Fatir",
                        murajaah:"An-Nas", note:"Muraja'ah: An-Nas downward." },
  "Faslus Sadis":    { fromN:2,  toN:28,  fromName:"Al-Baqarah",     toName:"Al-Qasas",
                        murajaah:"An-Nas", note:"Muraja'ah: An-Nas downward." },
};

export const TAHFEEZ_LEVELS = Object.keys(TAHFEEZ_CURRICULUM);

// Direction note: unlike QURAN_CURRICULUM (which progresses fromN→toN forward
// through the Quran), Tahfeez levels progress backward from Surah 114 toward
// Surah 1 as the student advances — except Faslus Sadis, which runs forward
// (2→28). Do not assume a single sign convention if this function is edited.
export const tahfeezProgressPct = (level, currentSurahN) => {
  const c = TAHFEEZ_CURRICULUM[level];
  if (!c || !currentSurahN) return 0;
  const span = c.fromN - c.toN;
  if (span === 0) return 0;
  const covered = c.fromN - currentSurahN;
  return Math.max(0, Math.min(100, Math.round((covered / span) * 100)));
};
