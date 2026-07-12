import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib } from "../components/shared";
import { CONV_CLASSES, CONV_NAME, ISL_LEVELS, TERMS } from "../data/constants";
import { classToQLUSLevel } from "../data/qlus_constants";
import { parseAssigned } from "../utils/helpers";

const TAHFEEZ_LEGACY_SUBJECTS = [
  "Fiqh","Hadith","Seerah","Arabic Grammar (Nahw)","Morphology (Sarf)",
  "Quran Recitation","Islamic History","Tafsir",
];

export default function Academics({ user }) {
  const { students, settings, getScore, setScore } = useApp();
  const [tab, setTab] = useState("conventional");

  return (
    <>
      <TabBar
        tabs={[
          { id:"conventional", label:"Conventional Scores" },
          { id:"islamiyyah",   label:"Islamiyyah / Tahfeez" },
        ]}
        active={tab}
        onChange={setTab}
        activeColor="#b45309"
      />
      {tab === "conventional"
        ? <ConventionalScores user={user} students={students} settings={settings} getScore={getScore} setScore={setScore} />
        : <IslamiyyahScores  user={user} students={students} settings={settings} getScore={getScore} setScore={setScore} />}
    </>
  );
}

// ── CONVENTIONAL SCORES TAB ──────────────────────────────────────────────────
function ConventionalScores({ user, students, settings, getScore, setScore }) {
  // FIXED: previously had zero teacher scoping — any logged-in user could
  // select and edit ANY conventional class's scores, regardless of
  // assignment. Now matches the same pattern used in Attendance/DAAR:
  // Teacher is restricted to assignedClasses; every other role (Director,
  // Assistant, Head of Conventional/Islamiyyah) sees the full list.
  const isTeacher = user?.role === "teacher";
  const assignedClasses = isTeacher ? parseAssigned(user?.assignedClasses) : CONV_CLASSES;
  const visibleClasses = isTeacher ? assignedClasses : CONV_CLASSES;

  const [cls, setCls]         = useState(visibleClasses[0] || "JSS1");
  const [subject, setSubject] = useState("Mathematics");
  const [term, setTerm]       = useState("1");
  const [saved, setSaved]     = useState(false);

  const rows = useMemo(() =>
    students.filter(s => s.conv === cls && s.status === "Active").map(s => {
      const sc = getScore(cls, subject, term, s.admNo);
      return { ...s, sc };
    }),
    [students, cls, subject, term, getScore]
  );

  const setField = (admNo, field, val) => {
    const max = field === "exam" ? 60 : 20;
    setScore(cls, subject, term, admNo, field, val === "" ? "" : Math.min(+val, max));
    setSaved(false);
  };

  return (
    <>
      <FilterBar>
        <div>
          <Lbl c="CLASS" />
          <select value={cls} onChange={e => setCls(e.target.value)} style={ib}>
            {visibleClasses.length === 0
              ? <option value="">— No classes assigned —</option>
              : visibleClasses.map(c => <option key={c} value={c}>{CONV_NAME[c]}</option>)}
          </select>
        </div>
        <div>
          <Lbl c="SUBJECT" />
          <select value={subject} onChange={e => setSubject(e.target.value)} style={ib}>
            <option>Mathematics</option>
            <option>English Language</option>
            <option>Basic Science & Technology</option>
            <option>Social Studies</option>
            <option>Islamic Studies</option>
            <option>Arabic Language</option>
          </select>
        </div>
        <div>
          <Lbl c="TERM" />
          <select value={term} onChange={e => setTerm(e.target.value)} style={ib}>
            {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </FilterBar>

      <Card style={{ overflow:"hidden" }}>
        <div style={{ background:"#1F3864", padding:"10px 16px" }}>
          <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>
            {cls ? CONV_NAME[cls] : "No class selected"} · {subject} · Term {term}
          </span>
        </div>

        {rows.length === 0 && (
          <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
            {visibleClasses.length === 0
              ? "You have no classes assigned."
              : "No students in this class."}
          </div>
        )}

        {rows.map((s, i) => (
          <div key={s.admNo} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#0f172a" }}>{s.name}</div>
              <div style={{ fontSize:9, color:"#94a3b8" }}>{s.admNo}</div>
            </div>
            {["ca1","ca2","exam"].map(f => (
              <input key={f} type="number" min={0} max={f==="exam"?60:20}
                value={s.sc[f] ?? ""} onChange={e=>setField(s.admNo,f,e.target.value)}
                placeholder={f.toUpperCase()}
                style={{ width:56, border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 6px", fontSize:11, textAlign:"center", outline:"none" }} />
            ))}
          </div>
        ))}
      </Card>
    </>
  );
}

// ── ISLAMIYYAH / TAHFEEZ LEGACY SCORES TAB ──────────────────────────────────
function IslamiyyahScores({ user, students, settings, getScore, setScore }) {
  // FIXED: same gap as the Conventional tab. Scoping here is derived the
  // same way QuranTracker/IslamicStudies do it — a teacher's real,
  // conv+isl-derived levels, not a static conv-only map, so it can't
  // disagree with which students actually show up.
  const isTeacher = user?.role === "teacher";
  const assignedClasses = isTeacher ? parseAssigned(user?.assignedClasses) : CONV_CLASSES;
  const visibleClasses = isTeacher ? assignedClasses : CONV_CLASSES;

  const visibleIslLevels = useMemo(() => {
    if (!isTeacher) return ISL_LEVELS;
    const scopedStudents = students.filter(s => visibleClasses.includes(s.conv));
    const allowedIsl = new Set(scopedStudents.map(s => s.isl).filter(Boolean));
    // ISL_LEVELS has finer-grained entries (e.g. "Raudah 1A"/"Raudah 1B")
    // than the raw isl values on some student records may reflect exactly —
    // include a level if it's an exact match OR its QLUS-derived rollup
    // matches a level derivable from the teacher's assigned conv classes.
    const allowedDerived = new Set(visibleClasses.map(c => classToQLUSLevel(c)));
    return ISL_LEVELS.filter(level =>
      allowedIsl.has(level) || allowedDerived.has(level)
    );
  }, [isTeacher, visibleClasses, students]);

  const [level, setLevel] = useState(visibleIslLevels[0] || ISL_LEVELS[0]);
  const [term, setTerm]   = useState("1");
  const [mode, setMode]   = useState("subjects"); // subjects | tahfeez
  const [subject, setSubject] = useState(TAHFEEZ_LEGACY_SUBJECTS[0]);

  const levelStudents = useMemo(() =>
    students.filter(s => s.isl === level && s.status === "Active"),
    [students, level]
  );

  return (
    <>
      <FilterBar>
        <div style={{ minWidth:220 }}>
          <Lbl c="ISLAMIYYAH / TAHFEEZ LEVEL" />
          <select value={level} onChange={e=>setLevel(e.target.value)} style={ib}>
            {visibleIslLevels.length === 0
              ? <option value="">— No levels assigned —</option>
              : visibleIslLevels.map(l => (
                  <option key={l} value={l}>
                    {l} ({students.filter(s=>s.isl===l && s.status==="Active").length})
                  </option>
                ))}
          </select>
        </div>
        <div>
          <Lbl c="TERM" />
          <select value={term} onChange={e=>setTerm(e.target.value)} style={ib}>
            {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Lbl c="TRACKING TYPE" />
          <div style={{ display:"flex", gap:6 }}>
            {[{ id:"subjects", l:"Subject Scores" }, { id:"tahfeez", l:"Tahfeez Progress" }].map(({id,l}) => (
              <button key={id} onClick={()=>setMode(id)} style={{
                padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:11, fontWeight:700,
                background: mode===id ? "#0f766e" : "#f1f5f9",
                color: mode===id ? "#fff" : "#64748b",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </FilterBar>

      {visibleIslLevels.length === 0 && (
        <Card style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
          You have no Islamiyyah levels assigned within your conventional classes.
        </Card>
      )}

      {visibleIslLevels.length > 0 && levelStudents.length === 0 && (
        <Card style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
          No active students at <strong>{level}</strong> level.
        </Card>
      )}

      {visibleIslLevels.length > 0 && levelStudents.length > 0 && mode === "subjects" && (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:"#0f766e", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>{level} — Islamiyyah Subject Scores</span>
            <select value={subject} onChange={e=>setSubject(e.target.value)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,.3)", borderRadius:6, color:"#fff", fontSize:10, padding:"3px 8px" }}>
              {TAHFEEZ_LEGACY_SUBJECTS.map(s => <option key={s} value={s} style={{ color:"#000" }}>{s}</option>)}
            </select>
          </div>
          {levelStudents.map((s, i) => {
            const sc = getScore(`ISL-${level}`, subject, term, s.admNo);
            const setF = (f, v) => setScore(`ISL-${level}`, subject, term, s.admNo, f, v===""?"":Math.min(+v, f==="exam"?60:20));
            return (
              <div key={s.admNo} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ flex:1, fontSize:11, fontWeight:600, color:"#0f172a" }}>{s.name}</div>
                {["ca1","ca2","exam"].map(f => (
                  <input key={f} type="number" min={0} max={f==="exam"?60:20}
                    value={sc[f] ?? ""} onChange={e=>setF(f, e.target.value)}
                    style={{ width:52, border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 6px", fontSize:11, textAlign:"center", outline:"none" }} />
                ))}
              </div>
            );
          })}
        </Card>
      )}

      {visibleIslLevels.length > 0 && levelStudents.length > 0 && mode === "tahfeez" && (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:"#0f766e", padding:"10px 16px" }}>
            <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>{level} — Tahfeez / Memorization Progress</span>
          </div>
          {levelStudents.map((s, i) => {
            const sc = getScore(`TAHFEEZ-${level}`, "Tahfeez", term, s.admNo);
            const setF = (f, v) => setScore(`TAHFEEZ-${level}`, "Tahfeez", term, s.admNo, f, v);
            return (
              <div key={s.admNo} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ flex:1, fontSize:11, fontWeight:600, color:"#0f172a" }}>{s.name}</div>
                <input value={sc.ca1 ?? ""} onChange={e=>setF("ca1", e.target.value)} placeholder="Juz' completed"
                  style={{ width:100, border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 6px", fontSize:11, textAlign:"center", outline:"none" }} />
                <input value={sc.ca2 ?? ""} onChange={e=>setF("ca2", e.target.value)} placeholder="New pages"
                  style={{ width:90, border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 6px", fontSize:11, textAlign:"center", outline:"none" }} />
                <select value={sc.exam ?? ""} onChange={e=>setF("exam", e.target.value)}
                  style={{ width:110, border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 6px", fontSize:11, textAlign:"center", outline:"none" }}>
                  <option value="">— Quality —</option>
                  <option>Excellent</option><option>Good</option><option>Fair</option><option>Weak</option>
                </select>
              </div>
            );
          })}
        </Card>
      )}
    </>
  );
}
