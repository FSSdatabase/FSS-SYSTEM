/**
* Sheet helper functions — all CRUD operations for each data type.
*
* Students:   studentId | admNo | name | gender | conv | isl | status | year | tahfeezLevel | tahfeezEnrolled | majlisulIlmLevel
*             (studentId is the PERMANENT internal key — auto-generated once, never edited.
*              admNo is the school's admission number — a display/reference field that has
*              already changed format twice and will keep changing; never used as a foreign
*              key anywhere else in the system. All other sheets that reference a student
*              — Attendance, TahfeezLog, Scores, Fees — key off studentId, not admNo.)
* Staff:      id | name | gender | role | dept | status | year
* Users:      id | name | email | role | pin | status | assignedClasses | createdAt |
*             assignedTahfeezLevels | assignedMajlisulIlmLevels | department | assignedIslamiyyahLevels
* Settings:   key | value
* Attendance_<YEAR>: date | type | group | studentId | status  (one sheet per academic year — see ATTENDANCE section)
* DAAR:       id | date | cls | subject | teacher | topic | subtopic | method | reference | homework | scheme | note | time
* Fees:       admNo | session | discount | concession | arrears | t1 | t2 | t3
* Scores:     cls | subject | term | session | admNo | ca1 | ca2 | ca3 | exam | subtopic
* TahfeezLog: recordId | admNo | date | sabaq | sabqiPages | manzilJuz | murajaahJuz | hizb | pages | quality | teacher | remarks
*
* assignedIslamiyyahLevels: comma-separated QLUS-NORMALIZED level names (e.g.
* "Mutawassid 1,Thanawiy 2 (SIS 2)") — for teachers whose Islamiyyah roster does
* NOT correspond to their assignedClasses (e.g. Fatima Abubakar, "Raudah 3").
* Independent of, and additive with, assignedClasses and assignedTahfeezLevels.
* IMPORTANT: these are normalized values (classToQLUSLevel_ output), NOT raw
* Students.isl dropdown text — the two differ for Primary levels, which carry
* an " Islamiyyah" suffix on the raw field that gets stripped when normalized.
*
* ── ATTENDANCE SCHEMA (migrated from old date|type|cls|recordsJSON shape) ────
* New shape: long/tidy, one row per (date,type,group,studentId), stored in a
* sheet named "Attendance_<academicYear>" e.g. "Attendance_2025-2026", created
* automatically and left untouched at year rollover (archiving by separation).
*   type:  "conv" | "isl" | "tahfeez" | "staff"
*   group: conventional class name | QLUS-normalized isl level | tahfeez level | "staff"
* Islamiyyah group values are ALWAYS classToQLUSLevel_(conv, isl) output, never
* the raw Students.isl dropdown text — this keeps roster queries and teacher
* permission checks (assignedIslamiyyahLevels) speaking the same format.
*/

// ── Generic helpers ──────────────────────────────────────────────────────────
function sheetByName(name) {
  const ss = getSS();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function rowsToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1)
    .filter(row => row.some(cell => cell !== "" && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function findRowIndex(sheet, keyCol, keyVal) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIdx = headers.indexOf(keyCol);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIdx]) === String(keyVal)) return i + 1;
  }
  return -1;
}

function appendObject(sheet, obj) {
  const headers = sheet.getDataRange().getValues()[0];
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : "");
  sheet.appendRow(row);
}

function updateRow(sheet, rowIdx, obj) {
  const headers = sheet.getDataRange().getValues()[0];
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : "");
  sheet.getRange(rowIdx, 1, 1, row.length).setValues([row]);
}

// ── STUDENTS ──────────────────────────────────────────────────────────────────
function getStudents() {
  const sh = sheetByName("Students");
  return rowsToObjects(sh).map(s => ({
    studentId: s.studentId,
    admNo: s.admNo, name: s.name, gender: s.gender,
    conv: s.conv || null, isl: s.isl || null,
    status: s.status, year: Number(s.year),
    tahfeezLevel: s.tahfeezLevel || null,
    tahfeezEnrolled: s.tahfeezEnrolled === true || String(s.tahfeezEnrolled).toUpperCase() === "TRUE",
    majlisulIlmLevel: s.majlisulIlmLevel || null,
  }));
}

// Generates the next permanent studentId (e.g. "STU00269"), scanning existing
// values so numbering continues correctly even across repeated calls/migrations.
function nextStudentId_() {
  const sh = sheetByName("Students");
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf("studentId");
  let counter = 1;
  if (idIdx >= 0) {
    for (let i = 1; i < data.length; i++) {
      const existing = String(data[i][idIdx] || "");
      const match = existing.match(/^STU(\d+)$/);
      if (match) counter = Math.max(counter, parseInt(match[1], 10) + 1);
    }
  }
  return "STU" + String(counter).padStart(5, "0");
}

function saveStudent(mode, student, origAdmNo) {
  const sh = sheetByName("Students");
  const obj = {
    studentId: student.studentId || nextStudentId_(),
    admNo: student.admNo, name: student.name, gender: student.gender,
    conv: student.conv || "", isl: student.isl || "",
    status: student.status, year: student.year,
    tahfeezLevel: student.tahfeezLevel || "",
    tahfeezEnrolled: student.tahfeezEnrolled === true,
    majlisulIlmLevel: student.majlisulIlmLevel || "",
  };
  if (mode === "add") {
    appendObject(sh, obj);
  } else {
    const idx = findRowIndex(sh, "admNo", origAdmNo);
    if (idx > 0) updateRow(sh, idx, obj);
    else appendObject(sh, obj);
  }
  return { ok:true };
}

function deleteStudent(admNo) {
  const sh = sheetByName("Students");
  const idx = findRowIndex(sh, "admNo", admNo);
  if (idx > 0) sh.deleteRow(idx);
  return { ok:true };
}

// One-time migration: assigns a permanent studentId to every existing Students
// row that doesn't already have one. Safe to re-run — only fills blanks, never
// overwrites an existing studentId, and continues numbering from the highest
// existing STUxxxxx value found. Run this ONCE from the Apps Script editor
// (Run → select migrateStudentIds_ → Run), after adding the studentId column
// header to the Students sheet, and BEFORE the frontend switches to using
// studentId as the attendance/roster key.
function migrateStudentIds_() {
  const sh = sheetByName("Students");
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf("studentId");
  if (idIdx === -1) {
    Logger.log("ERROR: Add a 'studentId' column header to the Students sheet first.");
    return;
  }

  let counter = 1;
  for (let i = 1; i < data.length; i++) {
    const existing = String(data[i][idIdx] || "");
    const match = existing.match(/^STU(\d+)$/);
    if (match) counter = Math.max(counter, parseInt(match[1], 10) + 1);
  }

  let assigned = 0;
  for (let i = 1; i < data.length; i++) {
    if (!data[i][idIdx]) {
      const newId = "STU" + String(counter).padStart(5, "0");
      sh.getRange(i + 1, idIdx + 1).setValue(newId);
      counter++;
      assigned++;
    }
  }
  Logger.log(`Assigned ${assigned} new studentId values. Next available: STU${String(counter).padStart(5, "0")}`);
}

function getStudentByStudentId_(studentId) {
  if (!studentId) return null;
  const sh = sheetByName("Students");
  const rows = rowsToObjects(sh);
  return rows.find(s => String(s.studentId) === String(studentId)) || null;
}

// ── STAFF ────────────────────────────────────────────────────────────────────
function getStaff() {
  const sh = sheetByName("Staff");
  return rowsToObjects(sh).map(s => ({
    id: s.id, name: s.name, gender: s.gender,
    role: s.role, dept: s.dept, status: s.status, year: Number(s.year),
  }));
}

function saveStaff(mode, staff, origId) {
  const sh = sheetByName("Staff");
  if (mode === "add") {
    appendObject(sh, staff);
  } else {
    const idx = findRowIndex(sh, "id", origId);
    if (idx > 0) updateRow(sh, idx, staff);
    else appendObject(sh, staff);
  }
  return { ok:true };
}

function deleteStaff(id) {
  const sh = sheetByName("Staff");
  const idx = findRowIndex(sh, "id", id);
  if (idx > 0) sh.deleteRow(idx);
  return { ok:true };
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
function getSettings() {
  const sh = sheetByName("Settings");
  const rows = rowsToObjects(sh);
  const settings = { session:"2025/2026", feeRates:{} };
  rows.forEach(r => {
    if (r.key === "session") settings.session = r.value;
    else if (String(r.key).startsWith("feeRate_")) {
      const cls = r.key.replace("feeRate_", "");
      settings.feeRates[cls] = Number(r.value);
    }
  });
  return settings;
}

function saveSettingsData(settings) {
  const sh = sheetByName("Settings");
  sh.clearContents();
  sh.appendRow(["key", "value"]);
  sh.appendRow(["session", settings.session]);
  Object.entries(settings.feeRates || {}).forEach(([cls, rate]) => {
    sh.appendRow([`feeRate_${cls}`, rate]);
  });
  return { ok:true };
}

// ── ATTENDANCE (long/tidy format, per-academic-year sheets) ──────────────────
function currentAcademicYear_() {
  const settings = getSettings();
  return String(settings.session || "").replace("/", "-"); // "2025/2026" -> "2025-2026"
}

function attendanceSheetForYear_(academicYear) {
  const sh = sheetByName("Attendance_" + academicYear);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["date", "type", "group", "studentId", "status"]);
  }
  return sh;
}

function getAttendance(date, type, group, academicYear) {
  const sh = attendanceSheetForYear_(academicYear || currentAcademicYear_());
  const rows = rowsToObjects(sh);
  const out = {};
  rows.filter(r => r.date === date && r.type === type && r.group === group)
      .forEach(r => { out[r.studentId] = r.status; });
  return out;
}

function markAttendance(date, type, group, records, academicYear) {
  // records: { studentId: status, ... }
  const sh = attendanceSheetForYear_(academicYear || currentAcademicYear_());
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const dIdx = headers.indexOf("date"), tIdx = headers.indexOf("type"),
        gIdx = headers.indexOf("group"), sIdx = headers.indexOf("studentId"),
        stIdx = headers.indexOf("status");

  const rowByStudent = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][dIdx] === date && data[i][tIdx] === type && data[i][gIdx] === group) {
      rowByStudent[data[i][sIdx]] = i + 1;
    }
  }

  const toAppend = [];
  Object.entries(records).forEach(([studentId, status]) => {
    const rowNum = rowByStudent[studentId];
    if (rowNum) sh.getRange(rowNum, stIdx + 1).setValue(status);
    else toAppend.push([date, type, group, studentId, status]);
  });
  if (toAppend.length > 0) {
    sh.getRange(sh.getLastRow() + 1, 1, toAppend.length, 5).setValues(toAppend);
  }
  return { ok:true };
}

function getTermAttendance(type, group, startDate, endDate, academicYear) {
  const sh = attendanceSheetForYear_(academicYear || currentAcademicYear_());
  return rowsToObjects(sh).filter(r =>
    r.type === type && r.group === group && r.date >= startDate && r.date <= endDate
  );
}

// Roster for a given attendance type+group.
// IMPORTANT: for type "isl", group must be the QLUS-NORMALIZED level
// (classToQLUSLevel_ output) — matched here the same way, NOT raw s.isl text.
// This keeps rosters consistent with assignedIslamiyyahLevels comparisons.
function getAttendanceRoster(type, group) {
  const students = getStudents().filter(s => s.status === "Active");
  if (type === "conv") return students.filter(s => s.conv === group);
  if (type === "isl") return students.filter(s => classToQLUSLevel_(s.conv, s.isl) === group);
  if (type === "tahfeez") return students.filter(s => s.tahfeezEnrolled === true && s.tahfeezLevel === group);
  return [];
}

// ── DAAR ─────────────────────────────────────────────────────────────────────
function getDAAR(filters) {
  const sh = sheetByName("DAAR");
  let rows = rowsToObjects(sh);
  if (filters.date) rows = rows.filter(r => r.date === filters.date);
  if (filters.cls && filters.cls !== "ALL") rows = rows.filter(r => r.cls === filters.cls);
  if (filters.sub && filters.sub !== "ALL") rows = rows.filter(r => r.subject === filters.sub);
  return rows.reverse();
}

function saveDAAREntry(entry) {
  const sh = sheetByName("DAAR");
  appendObject(sh, entry);
  return { ok:true };
}

// ── FEES ─────────────────────────────────────────────────────────────────────
function getFees(cls, session) {
  const sh = sheetByName("Fees");
  const rows = rowsToObjects(sh).filter(r => r.session === session);
  const out = {};
  rows.forEach(r => {
    out[r.admNo] = {
      discount: Number(r.discount) || 0,
      concession: r.concession || "",
      arrears: Number(r.arrears) || 0,
      t1: Number(r.t1) || 0, t2: Number(r.t2) || 0, t3: Number(r.t3) || 0,
    };
  });
  return out;
}

function saveFee(record) {
  const sh = sheetByName("Fees");
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const aIdx = headers.indexOf("admNo"), sIdx = headers.indexOf("session");
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][aIdx] === record.admNo && data[i][sIdx] === record.session) {
      foundRow = i + 1; break;
    }
  }
  if (foundRow > 0) updateRow(sh, foundRow, record);
  else appendObject(sh, record);
  return { ok:true };
}

// ── SCORES ───────────────────────────────────────────────────────────────────
function getScores(cls, subject, term, session) {
  const sh = sheetByName("Scores");
  const rows = rowsToObjects(sh).filter(r =>
    r.cls === cls && r.subject === subject && String(r.term) === String(term) && r.session === session
  );
  const out = {};
  rows.forEach(r => {
    out[r.admNo] = { ca1:r.ca1, ca2:r.ca2, ca3:r.ca3, exam:r.exam, subtopic:r.subtopic || "" };
  });
  return out;
}

function saveScore(record) {
  const sh = sheetByName("Scores");
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idx = { cls:headers.indexOf("cls"), sub:headers.indexOf("subject"), term:headers.indexOf("term"),
                 sess:headers.indexOf("session"), adm:headers.indexOf("admNo") };
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idx.cls] === record.cls && data[i][idx.sub] === record.subject &&
        String(data[i][idx.term]) === String(record.term) &&
        data[i][idx.sess] === record.session && data[i][idx.adm] === record.admNo) {
      foundRow = i + 1; break;
    }
  }
  if (foundRow > 0) updateRow(sh, foundRow, record);
  else appendObject(sh, record);
  return { ok:true };
}

/**
* FSS RBAC SYSTEM — User Auth & Permissions
* ROLES: director (full) | assistant (broad + user mgmt) |
*        head (department-wide) | teacher (assignedClasses/assignedTahfeezLevels/
*        assignedIslamiyyahLevels — all three independent and additive)
*/

const ISLAMIC_TRACK_SUBJECTS_ = [
  "Islamic Studies", "Arabic Language", "Quran Studies / Tahfeez",
  "Fiqh", "Hadith", "Seerah", "Usul al-Fiqh", "Balaghah",
];

function departmentOfDAAREntry_(cls, subject) {
  return ISLAMIC_TRACK_SUBJECTS_.indexOf(subject) >= 0 ? "Islamiyyah" : "Conventional";
}

function departmentOfAction_(action, body) {
  switch (action) {
    case "getAttendance":
    case "markAttendance":
    case "getTermAttendance":
    case "getAttendanceRoster": {
      const t = body.type;
      if (t === "isl") return "Islamiyyah";
      if (t === "tahfeez") return "Tahfeez";
      return "Conventional"; // conv or staff
    }
    case "getScores":
    case "saveScore":
      return "Conventional";
    case "getQuranProgress":
    case "saveQuranProgress":
    case "getIslamicProgress":
    case "saveIslamicProgress":
    case "getQuranAchievements":
    case "saveQuranAchievement":
      return "Islamiyyah";
    case "getTahfeezLog":
    case "saveTahfeezSession":
    case "deleteTahfeezSession":
      return "Tahfeez";
    case "getDAAR":
    case "saveDAAREntry": {
      const subject = (body.entry && body.entry.subject) || body.sub || null;
      return subject ? departmentOfDAAREntry_(null, subject) : null;
    }
    default:
      return null;
  }
}

const PERMISSIONS_ = {
  director: { all: true },

  assistant: {
    allow: [
      "getStudents", "saveStudent",
      "getStaff", "saveStaff",
      "getAttendance", "markAttendance", "getTermAttendance", "getAttendanceRoster",
      "getDAAR", "saveDAAREntry",
      "getScores", "saveScore",
      "getPlacements", "savePlacement",
      "getPromotions", "savePromotion", "promoteClass",
      "getOverrides", "saveOverride",
      "getUsers", "createUser", "updateUser", "disableUser", "enableUser",
      "getQuranProgress", "saveQuranProgress",
      "getTahfeezLog", "saveTahfeezSession", "deleteTahfeezSession",
      "getIslamicProgress", "saveIslamicProgress",
      "getQuranAssessments", "saveQuranAssessment",
      "getQuranAchievements", "saveQuranAchievement",
      "getQLUSDashboardStats", "getDepartmentReport",
      "getSettings", "saveSettings",
    ],
  },

  head: {
    allow: [
      "getStudents", "getStaff",
      "getAttendance", "markAttendance", "getTermAttendance", "getAttendanceRoster",
      "getScores", "saveScore",
      "getQuranProgress", "saveQuranProgress",
      "getIslamicProgress", "saveIslamicProgress",
      "getQuranAchievements", "saveQuranAchievement",
      "getTahfeezLog", "saveTahfeezSession", "deleteTahfeezSession",
      "getDAAR", "saveDAAREntry",
      "getDepartmentReport",
      "getQLUSDashboardStats",
    ],
  },

  teacher: {
    allow: [
      "getStudents",
      "getStaff",
      "getSettings",
      "getAttendance", "markAttendance", "getTermAttendance", "getAttendanceRoster",
      "getDAAR", "saveDAAREntry",
      "getScores", "saveScore",
      "getPlacements", "savePlacement",
      "getQuranProgress", "saveQuranProgress",
      "getTahfeezLog", "saveTahfeezSession", "deleteTahfeezSession",
      "getIslamicProgress", "saveIslamicProgress",
      "getQuranAssessments", "saveQuranAssessment",
      "getQuranAchievements", "saveQuranAchievement",
      "getQLUSDashboardStats",
    ],
    classScoped: ["saveDAAREntry", "saveScore", "savePlacement"],
  },
};

function classToQLUSLevel_(conv, isl) {
  if (isl && String(isl).indexOf("Raudah") >= 0) return String(isl).replace(" Islamiyyah", "");
  if (isl && String(isl).indexOf("Pri") >= 0)    return String(isl).replace(" Islamiyyah", "").replace("Pri ", "Primary ");
  if (isl && String(isl).indexOf("Barnamaj") >= 0)   return "Barnamaj";
  if (isl && String(isl).indexOf("Mutawassid") >= 0) return isl;
  if (isl && String(isl).indexOf("Thanawiy") >= 0)   return isl;
  const map = {
    N1:"Raudah 1", N2:"Raudah 2", N3:"Raudah 3",
    P1:"Primary 1", P2:"Primary 2", P3:"Primary 3", P4:"Primary 4", P5:"Primary 5",
    P6:"Barnamaj",
    JSS1:"Mutawassid 1", JSS2:"Mutawassid 2", JSS3:"Mutawassid 3",
    SS1:"Thanawiy 1", SS2:"Thanawiy 2", SS3:"Thanawiy 3",
  };
  return map[conv] || conv || "—";
}

function getStudentByAdmNo_(admNo) {
  if (!admNo) return null;
  const sh = sheetByName("Students");
  const rows = rowsToObjects(sh);
  return rows.find(s => String(s.admNo) === String(admNo)) || null;
}

function getTahfeezSessionAdmNo_(recordId) {
  if (!recordId) return null;
  const sh = sheetByName("TahfeezLog");
  const rows = rowsToObjects(sh);
  const match = rows.find(r => String(r.recordId) === String(recordId));
  return match ? match.admNo : null;
}

function parseCommaList_(str) {
  return (str || "").split(",").map(s => s.trim()).filter(Boolean);
}

function isStudentInTeachersClasses_(user, admNo) {
  const allowed = parseCommaList_(user.assignedClasses);
  if (allowed.length === 0) return false;
  const student = getStudentByAdmNo_(admNo);
  if (!student) return false;
  return allowed.indexOf(student.conv) >= 0;
}

function isStudentInTeachersTahfeezLevels_(user, admNo) {
  const allowed = parseCommaList_(user.assignedTahfeezLevels);
  if (allowed.length === 0) return false;
  const student = getStudentByAdmNo_(admNo);
  if (!student) return false;
  if (student.tahfeezEnrolled !== true && String(student.tahfeezEnrolled).toUpperCase() !== "TRUE") return false;
  return allowed.indexOf(student.tahfeezLevel) >= 0;
}

// For teachers whose Islamiyyah roster doesn't correspond to assignedClasses.
function isStudentInTeachersIslamiyyahLevels_(user, admNo) {
  const allowed = parseCommaList_(user.assignedIslamiyyahLevels);
  if (allowed.length === 0) return false;
  const student = getStudentByAdmNo_(admNo);
  if (!student) return false;
  const level = classToQLUSLevel_(student.conv, student.isl);
  return allowed.indexOf(level) >= 0;
}

function checkPermission_(action, body) {
  const email = body.email;
  const cls = body.cls || (body.record && body.record.cls) || (body.entry && body.entry.cls) || null;

  Logger.log("PERMISSION CHECK — action: " + action + " | email: " + email + " | cls: " + cls);
  if (!email) return { ok:false, error:"Not logged in." };

  const user = getUserByEmail_(email);
  if (!user) return { ok:false, error:"User not found." };
  if (user.status !== "Active") return { ok:false, error:"Account disabled. Contact the Director." };

  const role = user.role;
  const rules = PERMISSIONS_[role];
  if (!rules) return { ok:false, error:"Unknown role: " + role };

  if (rules.all) return { ok:true, user };

  if (!rules.allow || rules.allow.indexOf(action) === -1) {
    return { ok:false, error:`Your role (${role}) is not permitted to perform "${action}".` };
  }

  if (role === "head") {
    if (action === "getDepartmentReport") {
      if (body.department && body.department !== user.department) {
        return { ok:false, error:`You oversee the ${user.department} department, not ${body.department}.` };
      }
      return { ok:true, user };
    }
    const dept = departmentOfAction_(action, body);
    if (dept && dept !== user.department) {
      return { ok:false, error:`You are Head of ${user.department}, not ${dept}. This action is outside your department.` };
    }
    return { ok:true, user };
  }

  if (rules.classScoped && rules.classScoped.indexOf(action) >= 0 && cls) {
    const allowed = parseCommaList_(user.assignedClasses);
    if (allowed.length > 0 && allowed.indexOf(cls) === -1) {
      return { ok:false, error:`You are not assigned to class "${cls}".` };
    }
  }

  if (role === "teacher") {
    const ISLAMIYYAH_SCOPED = ["saveQuranProgress", "saveIslamicProgress", "saveQuranAchievement"];
    if (ISLAMIYYAH_SCOPED.indexOf(action) >= 0) {
      const admNo = body.record && body.record.admNo;
      if (admNo &&
          !isStudentInTeachersClasses_(user, admNo) &&
          !isStudentInTeachersIslamiyyahLevels_(user, admNo)) {
        return { ok:false, error:"You are not assigned to this student's class or Islamiyyah level." };
      }
    }
    if (action === "saveTahfeezSession") {
      const admNo = body.record && body.record.admNo;
      if (admNo && !isStudentInTeachersTahfeezLevels_(user, admNo)) {
        return { ok:false, error:"You are not assigned to this student's Tahfeez level." };
      }
    }
    if (action === "deleteTahfeezSession") {
      const admNo = getTahfeezSessionAdmNo_(body.recordId);
      if (admNo && !isStudentInTeachersTahfeezLevels_(user, admNo)) {
        return { ok:false, error:"You are not assigned to this student's Tahfeez level." };
      }
    }
    if (action === "getQuranProgress" || action === "getIslamicProgress") {
      const requestedLevel = body.qlusLevel;
      if (requestedLevel) {
        const allowedConv = parseCommaList_(user.assignedClasses);
        const allowedFromConv = allowedConv.map(c => classToQLUSLevel_(c, null));
        const allowedDirect = parseCommaList_(user.assignedIslamiyyahLevels);
        const allAllowed = allowedFromConv.concat(allowedDirect);
        if (allAllowed.length > 0 && allAllowed.indexOf(requestedLevel) === -1) {
          return { ok:false, error:`You are not assigned to level "${requestedLevel}".` };
        }
      }
    }
    if (action === "getTahfeezLog") {
      const admNo = body.admNo;
      if (admNo && !isStudentInTeachersTahfeezLevels_(user, admNo)) {
        return { ok:false, error:"You are not assigned to this student's Tahfeez level." };
      }
    }

    // ── Attendance scoping — group values for "isl" are QLUS-normalized ──
    if (action === "markAttendance") {
      const { type, group } = body;
      if (type === "conv") {
        const allowed = parseCommaList_(user.assignedClasses);
        if (allowed.length > 0 && allowed.indexOf(group) === -1)
          return { ok:false, error:`You are not assigned to class "${group}".` };
      } else if (type === "isl") {
        const allowedFromConv = parseCommaList_(user.assignedClasses).map(c => classToQLUSLevel_(c, null));
        const allowedDirect = parseCommaList_(user.assignedIslamiyyahLevels);
        const allAllowed = allowedFromConv.concat(allowedDirect);
        if (allAllowed.length > 0 && allAllowed.indexOf(group) === -1)
          return { ok:false, error:`You are not assigned to level "${group}".` };
      } else if (type === "tahfeez") {
        const allowed = parseCommaList_(user.assignedTahfeezLevels);
        if (allowed.length > 0 && allowed.indexOf(group) === -1)
          return { ok:false, error:`You are not assigned to Tahfeez level "${group}".` };
      }
    }
  }

  return { ok:true, user };
}

// ── DEPARTMENT REPORTS ─────────────────────────────────────────────────────────
function getDepartmentReport(department) {
  if (department === "Tahfeez") return getTahfeezDepartmentReport_();
  if (department === "Islamiyyah") return getIslamiyyahDepartmentReport_();
  if (department === "Conventional") return getConventionalDepartmentReport_();
  return { ok: false, error: "Unknown department: " + department };
}

function getTahfeezDepartmentReport_() {
  const students = getStudents().filter(s => s.status === "Active" && s.tahfeezEnrolled === true);
  const logSheet = sheetByName("TahfeezLog");
  const sessions = rowsToObjects(logSheet);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const weekSessions = sessions.filter(s => s.date >= weekAgo);
  const weekPages = weekSessions.reduce((sum, s) => sum + (Number(s.pages) || 0), 0);

  const pagesByStudent = {};
  weekSessions.forEach(s => {
    pagesByStudent[s.admNo] = (pagesByStudent[s.admNo] || 0) + (Number(s.pages) || 0);
  });
  const topStudents = Object.entries(pagesByStudent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([admNo, pages]) => {
      const stu = students.find(s => s.admNo === admNo);
      return { admNo, name: stu ? stu.name : admNo, level: stu ? stu.tahfeezLevel : null, pagesThisWeek: pages };
    });

  const studentsWithSessionsThisWeek = new Set(weekSessions.map(s => s.admNo));
  const missingEntries = students
    .filter(s => !studentsWithSessionsThisWeek.has(s.admNo))
    .map(s => ({ admNo: s.admNo, name: s.name, level: s.tahfeezLevel }));

  return {
    totalStudents: students.length,
    weekSessions: weekSessions.length,
    weekPages: weekPages,
    topStudents: topStudents,
    studentsWithMissingEntriesThisWeek: missingEntries,
  };
}

function getIslamiyyahDepartmentReport_() {
  const students = getStudents().filter(s => s.status === "Active" && (s.conv || s.isl));

  const daarSheet = sheetByName("DAAR");
  const daarRows = rowsToObjects(daarSheet);
  const today_ = new Date().toISOString().slice(0, 10);
  const islamicDAARToday = daarRows.filter(r =>
    r.date === today_ && ISLAMIC_TRACK_SUBJECTS_.indexOf(r.subject) >= 0
  );

  return {
    totalStudents: students.length,
    daarEntriesToday: islamicDAARToday.length,
    quranProgressSummary: "UNAVAILABLE — getQuranProgress sheet structure not yet confirmed",
    islamicStudiesProgressSummary: "UNAVAILABLE — getIslamicProgress sheet structure not yet confirmed",
  };
}

function getConventionalDepartmentReport_() {
  const students = getStudents().filter(s => s.status === "Active" && s.conv);
  const today_ = new Date().toISOString().slice(0, 10);

  const attSheet = attendanceSheetForYear_(currentAcademicYear_());
  const attRows = rowsToObjects(attSheet);
  const todayAttendance = attRows.filter(r => r.date === today_ && r.type === "conv");
  const classesMarkedToday = new Set(todayAttendance.map(r => r.group)).size;

  const scoresSheet = sheetByName("Scores");
  const scoreRows = rowsToObjects(scoresSheet);
  const conventionalScores = scoreRows.filter(r =>
    !String(r.cls).startsWith("ISL-") && !String(r.cls).startsWith("TAHFEEZ-")
  );

  return {
    totalStudents: students.length,
    classesWithAttendanceMarkedToday: classesMarkedToday,
    totalScoreEntries: conventionalScores.length,
  };
}

// ── USERS SHEET ───────────────────────────────────────────────────────────────

function getUsers() {
  const sh = sheetByName("Users");
  return rowsToObjects(sh).map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role,
    status: u.status, assignedClasses: u.assignedClasses || "",
    assignedTahfeezLevels: u.assignedTahfeezLevels || "",
    assignedMajlisulIlmLevels: u.assignedMajlisulIlmLevels || "",
    assignedIslamiyyahLevels: u.assignedIslamiyyahLevels || "",
    department: u.department || "",
    createdAt: u.createdAt,
  }));
}

function getUserByEmail_(email) {
  const sh = sheetByName("Users");
  const rows = rowsToObjects(sh);
  const match = rows.find(u => String(u.email).toLowerCase().trim() === String(email).toLowerCase().trim());
  return match || null;
}

function createUser(record) {
  const sh = sheetByName("Users");
  const existing = getUserByEmail_(record.email);
  if (existing) return { ok:false, error: "A user with this email already exists." };

  const obj = {
    id: "U" + new Date().getTime(),
    name: record.name,
    email: String(record.email).toLowerCase().trim(),
    role: record.role,
    pin: "",
    status: "Active",
    assignedClasses: record.assignedClasses || "",
    assignedTahfeezLevels: record.assignedTahfeezLevels || "",
    assignedMajlisulIlmLevels: record.assignedMajlisulIlmLevels || "",
    assignedIslamiyyahLevels: record.assignedIslamiyyahLevels || "",
    department: record.department || "",
    createdAt: new Date(),
  };
  appendObject(sh, obj);
  return { ok:true, id: obj.id };
}

function updateUser(email, updates) {
  const sh = sheetByName("Users");
  const idx = findRowIndex(sh, "email", String(email).toLowerCase().trim());
  if (idx <= 0) return { ok:false, error: "User not found." };

  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const existing = {};
  headers.forEach((h, i) => existing[h] = data[idx - 1][i]);

  const merged = { ...existing, ...updates };
  updateRow(sh, idx, merged);
  return { ok:true };
}

function disableUser(email) {
  return updateUser(email, { status: "Disabled" });
}

function enableUser(email) {
  return updateUser(email, { status: "Active" });
}


// ── LOGIN / PIN SETUP ────────────────────────────────────────────────────────

function login(email, pin) {
  const user = getUserByEmail_(email);
  if (!user) return { ok:false, error: "No account found for this email. Ask the Director to create one." };
  if (user.status !== "Active") return { ok:false, error: "This account has been disabled." };

  if (!user.pin) {
    return { ok:false, needsPinSetup:true, error: "First login — please set your PIN." };
  }

  if (String(user.pin) !== String(pin)) {
    return { ok:false, error: "Incorrect PIN." };
  }

  return {
    ok:true,
    user: {
      name: user.name, email: user.email, role: user.role,
      assignedClasses: user.assignedClasses || "",
      assignedTahfeezLevels: user.assignedTahfeezLevels || "",
      assignedMajlisulIlmLevels: user.assignedMajlisulIlmLevels || "",
      assignedIslamiyyahLevels: user.assignedIslamiyyahLevels || "",
      department: user.department || "",
    },
  };
}

function setPin(email, newPin) {
  if (!newPin || String(newPin).length < 4 || String(newPin).length > 6) {
    return { ok:false, error: "PIN must be 4–6 digits." };
  }
  const user = getUserByEmail_(email);
  if (!user) return { ok:false, error: "No account found for this email." };
  if (user.pin) return { ok:false, error: "PIN already set. Use 'Reset PIN' instead (Director only)." };

  const result = updateUser(email, { pin: String(newPin) });
  if (!result.ok) return result;

  return {
    ok:true,
    user: {
      name: user.name, email: user.email, role: user.role,
      assignedClasses: user.assignedClasses || "",
      assignedTahfeezLevels: user.assignedTahfeezLevels || "",
      assignedMajlisulIlmLevels: user.assignedMajlisulIlmLevels || "",
      assignedIslamiyyahLevels: user.assignedIslamiyyahLevels || "",
      department: user.department || "",
    },
  };
}

function resetPin(email) {
  return updateUser(email, { pin: "" });
}

function setupAssistantAccount() {
  const result = createUser({
    name: "AMINA HARUN MUHAMMAD",
    email: "aminaharuna886@gmail.com",
    role: "assistant"
  });
  Logger.log(result);
}

function resetZainabPin() {
  const result = resetPin("zainabmuhd787@gmail.com");
  Logger.log(result);
}
