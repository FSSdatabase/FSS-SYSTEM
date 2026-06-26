import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { REAL_STUDENTS } from "../data/students";
import { REAL_STAFF }    from "../data/staff";
import { DEFAULT_FEE_RATES } from "../data/constants";
import { api }           from "../services/api";
import { today }         from "../utils/helpers";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [students,  setStudents]  = useState(REAL_STUDENTS);
  const [staffList, setStaffList] = useState(REAL_STAFF);
  const [settings,  setSettings]  = useState({
    session:  "2025/2026",
    feeRates: { ...DEFAULT_FEE_RATES },
  });
  const [attendance,  setAttendance]  = useState({});
  const [daarEntries, setDaarEntries] = useState([]);
  const [feeData,     setFeeData]     = useState({});
  const [scores,      setScores]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [online,      setOnline]      = useState(false);

  // ── Bootstrap ──────────────────────────────────────────────────────────
  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const [stu, stf, sett] = await Promise.all([
        api.getStudents(),
        api.getStaff(),
        api.getSettings(),
      ]);
      if (stu)  { setStudents(stu);  setOnline(true); }
      if (stf)  { setStaffList(stf); }
      if (sett) { setSettings(sett); }
    } catch (_) {
      // GAS not configured — running offline with seed data
    }
    setLoading(false);
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  // ── Attendance helpers ─────────────────────────────────────────────────
  const attKey = (date, type, cls) => `${date}|${type}|${cls || "staff"}`;

  const getAttRecord = (date, type, cls) => attendance[attKey(date, type, cls)] || {};

  const setAttRecord = async (date, type, cls, records) => {
    const key = attKey(date, type, cls);
    setAttendance(prev => ({ ...prev, [key]: records }));
    await api.saveAttendance({ date, type, cls, records });
  };

  // ── Fee helpers ────────────────────────────────────────────────────────
  const getFD = (admNo) => feeData[admNo] || { discount:0, concession:"", arrears:0, t1:0, t2:0, t3:0 };
  const setFD = (admNo, field, val) => {
    const updated = { ...getFD(admNo), [field]: val };
    setFeeData(prev => ({ ...prev, [admNo]: updated }));
    api.saveFee({ admNo, session: settings.session, ...updated });
  };

  // ── Score helpers ──────────────────────────────────────────────────────
  const sKey     = (cls, sub, term) => `${cls}|${sub}|${term}`;
  const getScore = (cls, sub, term, admNo) => (scores[sKey(cls, sub, term)] || {})[admNo] || { ca1:"", ca2:"", ca3:"", exam:"" };
  const setScore = (cls, sub, term, admNo, field, val) => {
    const k = sKey(cls, sub, term);
    setScores(prev => ({
      ...prev,
      [k]: { ...(prev[k] || {}), [admNo]: { ...getScore(cls, sub, term, admNo), [field]: val } },
    }));
  };

  // ── DAAR helpers ───────────────────────────────────────────────────────
  const addDaarEntry = async (entry) => {
    try {
      const result = await api.saveDAAREntry(entry);
      if (result === null) {
        // Offline — add locally only
        setDaarEntries(prev => [entry, ...prev]);
        return { ok: true };
      }
      setDaarEntries(prev => [entry, ...prev]);
      return { ok: true };
    } catch (err) {
      // Backend rejected — permission error or other
      return { ok: false, error: err.message };
    }
  };

  // ── Student / Staff CRUD ───────────────────────────────────────────────
  const saveStudent = async (mode, student, origAdmNo) => {
    if (mode === "add") setStudents(prev => [...prev, student]);
    else setStudents(prev => prev.map(s => s.admNo === origAdmNo ? student : s));
    await api.saveStudent(mode, student, origAdmNo);
  };

  const deleteStudent = async (admNo) => {
    setStudents(prev => prev.filter(s => s.admNo !== admNo));
    await api.deleteStudent(admNo);
  };

  const saveStaff = async (mode, staff, origId) => {
    if (mode === "add") setStaffList(prev => [...prev, staff]);
    else setStaffList(prev => prev.map(s => s.id === origId ? staff : s));
    await api.saveStaff(mode, staff, origId);
  };

  const deleteStaff = async (id) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
    await api.deleteStaff(id);
  };

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    await api.saveSettings(newSettings);
  };

  return (
    <AppContext.Provider value={{
      students, staffList, settings, attendance, daarEntries, feeData, scores,
      loading, online,
      setStudents, setStaffList,
      getAttRecord, setAttRecord,
      getFD, setFD,
      getScore, setScore,
      addDaarEntry,
      saveStudent, deleteStudent,
      saveStaff, deleteStaff,
      saveSettings,
      bootstrap,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};
