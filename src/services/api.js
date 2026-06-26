/**
 * FSS System — Google Apps Script API Service
 * All data reads and writes go through this file.
 * Set VITE_GAS_URL in your .env file after deploying GAS.
 */

const GAS_URL = import.meta.env.VITE_GAS_URL || "";

const GAS_URL = import.meta.env.VITE_GAS_URL || "";

const getEmail = () => {
  try {
    const u = localStorage.getItem("fss_user");
    return u ? JSON.parse(u).email : "";
  } catch { return ""; }
};

const GAS_URL = import.meta.env.VITE_GAS_URL || "";

const getEmail = () => {
  try {
    const u = localStorage.getItem("fss_user");
    return u ? JSON.parse(u).email : "";
  } catch { return ""; }
};

const GAS_URL = import.meta.env.VITE_GAS_URL || "";

const getEmail = () => {
  try {
    const u = localStorage.getItem("fss_user");
    return u ? JSON.parse(u).email : "";
  } catch { return ""; }
};

const post = async (action, payload = {}) => {
  if (!GAS_URL) {
    console.warn(`[OFFLINE] ${action} — GAS_URL not configured. Using local data.`);
    return null;
  }
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, email: getEmail(), ...payload }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "GAS error");
    return json.data;
  } catch (err) {
    console.error(`[API ERROR] ${action}:`, err.message);
    return null;
  }
};
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, email: getEmail(), ...payload }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "GAS error");
    return json.data;
  } catch (err) {
    console.error(`[API ERROR] ${action}:`, err.message);
    return null;
  }
};
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, email: getEmail(), ...payload }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "GAS error");
    return json.data;
  } catch (err) {
    console.error(`[API ERROR] ${action}:`, err.message);
    return null;
  }
};
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, email: getEmail(), ...payload }),
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "GAS error");
    return json.data;
  } catch (err) {
    console.error(`[API ERROR] ${action}:`, err.message);
    return null;
  }
};

export const api = {
  // ── Students ────────────────────────────────────────────────────────────
  getStudents:   ()                         => post("getStudents"),
  saveStudent:   (mode, student, origAdmNo) => post("saveStudent",  { mode, student, origAdmNo }),
  deleteStudent: (admNo)                    => post("deleteStudent", { admNo }),

  // ── Staff ────────────────────────────────────────────────────────────────
  getStaff:   ()                    => post("getStaff"),
  saveStaff:  (mode, staff, origId) => post("saveStaff",  { mode, staff, origId }),
  deleteStaff:(id)                  => post("deleteStaff",{ id }),

  // ── Attendance ────────────────────────────────────────────────────────────
  getAttendance:  (date, type, cls) => post("getAttendance",  { date, type, cls }),
  saveAttendance: (records)         => post("saveAttendance", { records }),

  // ── DAAR ──────────────────────────────────────────────────────────────────
  getDAAR:      (filters) => post("getDAAR",      { ...filters }),
  saveDAAREntry:(entry)   => post("saveDAAREntry", { entry }),

  // ── Fees ──────────────────────────────────────────────────────────────────
  getFees:    (cls, session) => post("getFees",   { cls, session }),
  saveFee:    (record)       => post("saveFee",   { record }),

  // ── Academic Scores ────────────────────────────────────────────────────────
  getScores:  (cls, subject, term, session) => post("getScores", { cls, subject, term, session }),
  saveScore:  (record)                      => post("saveScore", { record }),

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings:  ()         => post("getSettings"),
  saveSettings: (settings) => post("saveSettings", { settings }),
};
