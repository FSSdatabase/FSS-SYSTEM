/**
 * QLUS — Quran Learning & Understanding Studio
 * Curriculum constants for all levels
 */

export const SURAHS = [
  [1,"Al-Fatihah","الفاتحة",7],[2,"Al-Baqarah","البقرة",286],[3,"Al-Imran","آل عمران",200],
  [4,"An-Nisa","النساء",176],[5,"Al-Ma'idah","المائدة",120],[6,"Al-An'am","الأنعام",165],
  [7,"Al-A'raf","الأعراف",206],[8,"Al-Anfal","الأنفال",75],[9,"At-Tawbah","التوبة",129],
  [10,"Yunus","يونس",109],[11,"Hud","هود",123],[12,"Yusuf","يوسف",111],
  [13,"Ar-Ra'd","الرعد",43],[14,"Ibrahim","إبراهيم",52],[15,"Al-Hijr","الحجر",99],
  [16,"An-Nahl","النحل",128],[17,"Al-Isra","الإسراء",111],[18,"Al-Kahf","الكهف",110],
  [19,"Maryam","مريم",98],[20,"Ta-Ha","طه",135],[21,"Al-Anbiya","الأنبياء",112],
  [22,"Al-Hajj","الحج",78],[23,"Al-Mu'minun","المؤمنون",118],[24,"An-Nur","النور",64],
  [25,"Al-Furqan","الفرقان",77],[26,"Ash-Shu'ara","الشعراء",227],[27,"An-Naml","النمل",93],
  [28,"Al-Qasas","القصص",88],[29,"Al-Ankabut","العنكبوت",69],[30,"Ar-Rum","الروم",60],
  [31,"Luqman","لقمان",34],[32,"As-Sajdah","السجدة",30],[33,"Al-Ahzab","الأحزاب",73],
  [34,"Saba","سبأ",54],[35,"Fatir","فاطر",45],[36,"Ya-Sin","يس",83],
  [37,"As-Saffat","الصافات",182],[38,"Sad","ص",88],[39,"Az-Zumar","الزمر",75],
  [40,"Ghafir","غافر",85],[41,"Fussilat","فصلت",54],[42,"Ash-Shura","الشورى",53],
  [43,"Az-Zukhruf","الزخرف",89],[44,"Ad-Dukhan","الدخان",59],[45,"Al-Jathiyah","الجاثية",37],
  [46,"Al-Ahqaf","الأحقاف",35],[47,"Muhammad","محمد",38],[48,"Al-Fath","الفتح",29],
  [49,"Al-Hujurat","الحجرات",18],[50,"Qaf","ق",45],[51,"Adh-Dhariyat","الذاريات",60],
  [52,"At-Tur","الطور",49],[53,"An-Najm","النجم",62],[54,"Al-Qamar","القمر",55],
  [55,"Ar-Rahman","الرحمن",78],[56,"Al-Waqi'ah","الواقعة",96],[57,"Al-Hadid","الحديد",29],
  [58,"Al-Mujadila","المجادلة",22],[59,"Al-Hashr","الحشر",24],[60,"Al-Mumtahanah","الممتحنة",13],
  [61,"As-Saf","الصف",14],[62,"Al-Jumu'ah","الجمعة",11],[63,"Al-Munafiqun","المنافقون",11],
  [64,"At-Taghabun","التغابن",18],[65,"At-Talaq","الطلاق",12],[66,"At-Tahrim","التحريم",12],
  [67,"Al-Mulk","الملك",30],[68,"Al-Qalam","القلم",52],[69,"Al-Haqqah","الحاقة",52],
  [70,"Al-Ma'arij","المعارج",44],[71,"Nuh","نوح",28],[72,"Al-Jinn","الجن",28],
  [73,"Al-Muzzammil","المزمل",20],[74,"Al-Muddaththir","المدثر",56],[75,"Al-Qiyamah","القيامة",40],
  [76,"Al-Insan","الإنسان",31],[77,"Al-Mursalat","المرسلات",50],[78,"An-Naba","النبأ",40],
  [79,"An-Nazi'at","النازعات",46],[80,"Abasa","عبس",42],[81,"At-Takwir","التكوير",29],
  [82,"Al-Infitar","الانفطار",19],[83,"Al-Mutaffifin","المطففين",36],[84,"Al-Inshiqaq","الانشقاق",25],
  [85,"Al-Buruj","البروج",22],[86,"At-Tariq","الطارق",17],[87,"Al-A'la","الأعلى",19],
  [88,"Al-Ghashiyah","الغاشية",26],[89,"Al-Fajr","الفجر",30],[90,"Al-Balad","البلد",20],
  [91,"Ash-Shams","الشمس",15],[92,"Al-Layl","الليل",21],[93,"Ad-Duha","الضحى",11],
  [94,"Ash-Sharh","الشرح",8],[95,"At-Tin","التين",8],[96,"Al-Alaq","العلق",19],
  [97,"Al-Qadr","القدر",5],[98,"Al-Bayyinah","البينة",8],[99,"Az-Zalzalah","الزلزلة",8],
  [100,"Al-Adiyat","العاديات",11],[101,"Al-Qari'ah","القارعة",11],[102,"At-Takathur","التكاثر",8],
  [103,"Al-Asr","العصر",3],[104,"Al-Humazah","الهمزة",9],[105,"Al-Fil","الفيل",5],
  [106,"Quraysh","قريش",4],[107,"Al-Ma'un","الماعون",7],[108,"Al-Kawthar","الكوثر",3],
  [109,"Al-Kafirun","الكافرون",6],[110,"An-Nasr","النصر",3],[111,"Al-Masad","المسد",5],
  [112,"Al-Ikhlas","الإخلاص",4],[113,"Al-Falaq","الفلق",5],[114,"An-Nas","الناس",6],
];

export const surahName = (n) => {
  const s = SURAHS.find(s => s[0] === n);
  return s ? s[1] : "—";
};

export const QURAN_CURRICULUM = {
  "Raudah 1":  { fromN:1,  toN:114, fromName:"Al-Fatihah",    toName:"An-Nas",        murajaah:null,       note:"Full Quran — Tilawah (reading). Hifz by capacity." },
  "Raudah 2":  { fromN:78, toN:114, fromName:"An-Naba",       toName:"An-Nas",        murajaah:"An-Nas",   note:"Tilawah An-Naba → Nas. Muraja'ah: Nas downward." },
  "Raudah 3":  { fromN:74, toN:78,  fromName:"Al-Muddaththir",toName:"An-Naba",       murajaah:"An-Nas",   note:"Tilawah Muddaththir → Naba. Muraja'ah: Nas." },
  "Primary 1": { fromN:58, toN:73,  fromName:"Al-Mujadila",   toName:"Al-Muzzammil",  murajaah:"An-Nas",   note:"Tilawah Mujadila → Muzzammil. Muraja'ah: Nas." },
  "Primary 2": { fromN:46, toN:57,  fromName:"Al-Ahqaf",      toName:"Al-Hadid",      murajaah:"An-Nas",   note:"Tilawah Ahqaf → Hadid. Muraja'ah: Nas." },
  "Primary 3": { fromN:36, toN:46,  fromName:"Ya-Sin",        toName:"Al-Ahqaf",      murajaah:"An-Nas",   note:"Tilawah Ya-Sin → Ahqaf. Muraja'ah: Nas." },
  "Primary 4": { fromN:29, toN:36,  fromName:"Al-Ankabut",    toName:"Ya-Sin",        murajaah:"An-Nas",   note:"Tilawah Ankabut → Ya-Sin. Muraja'ah: Nas." },
  "Primary 5": { fromN:19, toN:29,  fromName:"Maryam",        toName:"Al-Ankabut",    murajaah:"An-Nas",   note:"Tilawah Maryam → Ankabut. Muraja'ah: Nas." },
  "Barnamaj":  { fromN:1,  toN:114, fromName:"Al-Fatihah",    toName:"An-Nas",        murajaah:"Complete", note:"Complete Quran Tilawah/Hifz (1–2 years programme)." },
};

export const HURUF_CURRICULUM = {
  "Raudah 1":  { skills:["Tamyiz (letter recognition)","Verb patterns: Fa'ala (فَعَلَ)"], target:"Recognise all Arabic letters. Read basic words." },
  "Raudah 2":  { skills:["Tamyiz revision","Verb patterns: Fa'ila (فَعِلَ)","Verb patterns: Fa'ula (فَعُلَ)"], target:"Consolidate letter recognition. Distinguish verb patterns." },
  "Raudah 3":  { skills:["Full revision of all patterns","Waslul Kalimaat (joining words)","Fasl (separating) introduction"], target:"Read connected Arabic text slowly. Understand basic word structure." },
  "Primary 1": { skills:["Reading from text (Quran/Hadith)","Basic word recognition in context"], target:"Begin reading from actual Quran and Hadith texts." },
  "Primary 2": { skills:["Independent Quran reading in class","Accelerated Hifz support through reading fluency"], target:"Read Quran independently during class periods." },
  "Primary 3": { skills:["Mastery reading","Makharij focus","Reading without assistance"], target:"Master reading. Correct Makharij in recitation." },
  "Primary 4": { skills:["Reading mastery","Arabic writing","Diverse text memorization"], target:"Read and write Arabic. Memorise from different text types." },
  "Primary 5": { skills:["Near-complete Quran Tilawah","Makharij mastery","Writing complex texts"], target:"Near-complete Tilawah. Master Makharij. Strong writing." },
  "Barnamaj":  { skills:["Complete reading mastery","Beginning Quran comprehension","Analytical reading"], target:"Read everything. Begin to understand Quran directly." },
};

export const QLUS_SUBJECTS = [
  "Tafseer/Tarjamah","Hadith","Fiqh","Tawheed","Seerah","Tarikh",
  "Adaab","Azkar","Arabic (Huruf)","Arabiyyah","Qira'ah/Mudala'ah","Tajweed",
];

export const HADITH_CURRICULUM = {
  "Raudah 1":  { unit:"Level 1 (Age 3–4)",  hadiths:"1–30",  total:30 },
  "Raudah 2":  { unit:"Level 1 (Age 3–4)",  hadiths:"31–60", total:60, note:"Review + new" },
  "Raudah 3":  { unit:"Level 2 (Age 4–5)",  hadiths:"1–30",  total:30 },
  "Primary 1": { unit:"Level 2 (Age 4–5)",  hadiths:"31–60", total:60, note:"Review + new" },
  "Primary 2": { unit:"Level 3 (Age 5–6)",  hadiths:"1–60",  total:60, note:"Review + new" },
  "Primary 3": { unit:"Level 4 (Age 6–7)",  hadiths:"1–60",  total:60, note:"Review + new" },
  "Primary 4": { unit:"Level 5 (Age 7–8)",  hadiths:"1–60",  total:60, note:"Review + new" },
  "Primary 5": { unit:"Level 6 (Age 8–9)",  hadiths:"1–60",  total:60, note:"Review + new" },
  "Barnamaj":  { unit:"Level 7 (Age 9–10)", hadiths:"1–60",  total:60, note:"Review + new" },
};

export const TAH_QUALITY = [
  { id:"Excellent", ar:"ممتاز", color:"#15803d", bg:"#dcfce7" },
  { id:"Good",      ar:"جيد",   color:"#1d4ed8", bg:"#dbeafe" },
  { id:"Fair",      ar:"مقبول", color:"#b45309", bg:"#fef3c7" },
  { id:"Weak",      ar:"ضعيف",  color:"#dc2626", bg:"#fee2e2" },
];

export const qualityInfo = (q) => TAH_QUALITY.find(x => x.id === q) || { id:q, color:"#94a3b8", bg:"#f1f5f9" };

export const QLUS_LEVELS = [
  "Raudah 1","Raudah 2","Raudah 3",
  "Primary 1","Primary 2","Primary 3","Primary 4","Primary 5",
  "Barnamaj",
  "Mutawassid 1","Mutawassid 2","Mutawassid 3",
  "Thanawiy 1","Thanawiy 2","Thanawiy 3",
];

export const classToQLUSLevel = (conv, isl) => {
  if (isl && isl.includes("Raudah"))     return isl.replace(" Islamiyyah","");
  if (isl && isl.includes("Pri"))        return isl.replace(" Islamiyyah","").replace("Pri ","Primary ");
  if (isl && isl.includes("Barnamaj"))   return "Barnamaj";
  if (isl && isl.includes("Mutawassid")) return isl;
  if (isl && isl.includes("Thanawiy"))   return isl;
  const map = {
    N1:"Raudah 1",N2:"Raudah 2",N3:"Raudah 3",
    P1:"Primary 1",P2:"Primary 2",P3:"Primary 3",P4:"Primary 4",P5:"Primary 5",
    P6:"Barnamaj",
    JSS1:"Mutawassid 1",JSS2:"Mutawassid 2",JSS3:"Mutawassid 3",
    SS1:"Thanawiy 1",SS2:"Thanawiy 2",SS3:"Thanawiy 3",
  };
  return map[conv] || conv || "—";
};

export const ACHIEVEMENT_TYPES = [
  "Khatmah (Full Quran)",
  "Hifz Milestone (5 Juz)",
  "Hifz Milestone (10 Juz)",
  "Hifz Milestone (15 Juz)",
  "Hifz Milestone (20 Juz)",
  "Hifz Milestone (25 Juz)",
  "Hifz Milestone (30 Juz — Complete)",
  "Tajweed Certificate",
  "Hadith Completion",
  "Best Recitation — Term",
  "Best Understanding — Term",
  "Other",
];
