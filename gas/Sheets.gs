/**
 * Sheet helper functions — all CRUD operations for each data type.
 * Sheet structure expected (row 1 = headers):
 *
 * Students:   admNo | name | gender | conv | isl | status | year
 * Staff:      id | name | gender | role | dept | status | year
 * Settings:   key | value          (rows: session, feeRate_N1, feeRate_N2, ... )
 * Attendance: date | type | cls | recordsJSON
 * DAAR:       id | date | cls | subject | teacher | topic | subtopic | method | reference | homework | scheme | note | time
 * Fees:       admNo | session | discount | concession | arrears | t1 | t2 | t3
 * Scores:     cls | subject | term | session | admNo | ca1 | ca2 | ca3 | exam | subtopic
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
    if (String(data[i][colIdx]) === String(keyVal)) return i + 1; // 1-indexed sheet row
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
    admNo: s.admNo, name: s.name, gender: s.gender,
    conv: s.conv || null, isl: s.isl || null,
    status: s.status, year: Number(s.year),
  }));
}

function saveStudent(mode, student, origAdmNo) {
  const sh = sheetByName("Students");
  const obj = {
    admNo: student.admNo, name: student.name, gender: student.gender,
    conv: student.conv || "", isl: student.isl || "",
    status: student.status, year: student.year,
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
  // Clear and rewrite
  sh.clearContents();
  sh.appendRow(["key", "value"]);
  sh.appendRow(["session", settings.session]);
  Object.entries(settings.feeRates || {}).forEach(([cls, rate]) => {
    sh.appendRow([`feeRate_${cls}`, rate]);
  });
  return { ok:true };
}

// ── ATTENDANCE ───────────────────────────────────────────────────────────────
function getAttendance(date, type, cls) {
  const sh = sheetByName("Attendance");
  const rows = rowsToObjects(sh);
  const match = rows.find(r => r.date === date && r.type === type && r.cls === (cls || "staff"));
  return match ? JSON.parse(match.recordsJSON) : {};
}

function saveAttendance(date, type, cls, records) {
  const sh = sheetByName("Attendance");
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const dIdx = headers.indexOf("date"), tIdx = headers.indexOf("type"), cIdx = headers.indexOf("cls");
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][dIdx] === date && data[i][tIdx] === type && data[i][cIdx] === (cls || "staff")) {
      foundRow = i + 1; break;
    }
  }
  const obj = { date, type, cls: cls || "staff", recordsJSON: JSON.stringify(records) };
  if (foundRow > 0) updateRow(sh, foundRow, obj);
  else appendObject(sh, obj);
  return { ok:true };
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
