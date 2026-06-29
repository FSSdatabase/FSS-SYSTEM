/**
 * QLUS API Service — all QLUS data calls go through here
 */
const GAS_URL = import.meta.env.VITE_GAS_URL || "";

const getEmail = () => {
  try {
    const u = localStorage.getItem("fss_user");
    return u ? JSON.parse(u).email : "";
  } catch { return ""; }
};

const post = async (action, payload = {}) => {
  if (!GAS_URL) { console.warn(`[OFFLINE] ${action}`); return null; }
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, email: getEmail(), ...payload }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "GAS error");
    return json.data;
  } catch (err) {
    console.error(`[QLUS API] ${action}:`, err.message);
    return null;
  }
};

export const qlusApi = {
  getQuranProgress:     (filters = {}) => post("getQuranProgress",     { ...filters }),
  saveQuranProgress:    (record)       => post("saveQuranProgress",     { record }),
  getTahfeezLog:        (filters = {}) => post("getTahfeezLog",         { ...filters }),
  saveTahfeezSession:   (record)       => post("saveTahfeezSession",    { record }),
  deleteTahfeezSession: (recordId)     => post("deleteTahfeezSession",  { recordId }),
  getIslamicProgress:   (filters = {}) => post("getIslamicProgress",    { ...filters }),
  saveIslamicProgress:  (record)       => post("saveIslamicProgress",   { record }),
  getQuranAssessments:  (filters = {}) => post("getQuranAssessments",   { ...filters }),
  saveQuranAssessment:  (record)       => post("saveQuranAssessment",   { record }),
  getQuranAchievements: (admNo)        => post("getQuranAchievements",  { admNo }),
  saveQuranAchievement: (record)       => post("saveQuranAchievement",  { record }),
  getDashboardStats:    ()             => post("getQLUSDashboardStats"),
};
