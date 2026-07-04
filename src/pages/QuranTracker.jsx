import { useState, useEffect, useMemo } from "react";
import { Check, Save } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib } from "../components/shared";
import { qlusApi } from "../services/qlus_api";
import { CONV_CLASSES } from "../data/constants";
import {
  QURAN_CURRICULUM, HURUF_CURRICULUM, QLUS_LEVELS,
  classToQLUSLevel, qualityInfo, TAH_QUALITY, surahName
} from "../data/qlus_constants";
import { parseAssigned } from "../utils/helpers";

const TEAL = "#0f766e";

export default function QuranTracker({ user }) {
  const { students } = useApp();

  // ── Scoping: identical pattern to Attendance/TahfeezCenter, bridged through
  // classToQLUSLevel since Islamiyyah level IS tied to conventional class. ──
  const isTeacher = user?.role === "teacher";
  const assignedConv = isTeacher ? parseAssigned(user?.assignedClasses) : CONV_CLASSES;
  // Fails closed: a teacher with no assignedClasses sees no levels, not all of them.
  const visibleClasses = isTeacher ? assignedConv : CONV_CLASSES;
  const visibleLevels = useMemo(() => {
    const allowed = new Set(visibleClasses.map(c => classToQLUSLevel(c)));
    return QLUS_LEVELS.filter(l => allowed.has(l));
  }, [visibleClasses]);

  const [tab,      setTab]      = useState("tilawah");
  const [level,    setLevel]    = useState(visibleLevels[0] || "Primary 1");
  const [progress, setProgress] = useState({});  // key: admNo → record
  const [saved,    setSaved]    = useState({});   // key: admNo → bool
  const [loading,  setLoading]  = useState(false);

  // Keep `level` valid if the teacher's assignment changes.
  useEffect(() => {
    if (visibleLevels.length && !visibleLevels.includes(level)) {
      setLevel(visibleLevels[0]);
    }
  }, [visibleLevels, level]);

  // Students at this QLUS level
  const levelStudents = useMemo(() => {
    return students.filter(s => {
      if (s.status !== "Active") return false;
      return classToQLUSLevel(s.conv, s.isl) === level;
    });
  }, [students, level]);

  useEffect(() => {
    if (!level) return;
    setLoading(true);
    qlusApi.getQuranProgress({ qlusLevel: level }).then(data => {
      if (data) {
        const map = {};
        data.forEach(r => { map[r.admNo] = r; });
        setProgress(map);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [level]);

  const curriculum = QURAN_CURRICULUM[level] || {};
  const huruf      = HURUF_CURRICULUM[level] || {};

  // NOTE: hifzPct removed. Memorization is now tracked exclusively in
  // TahfeezCenter, keyed by the independent tahfeezLevel — not by QLUS
  // Islamiyyah level. This tracker owns Tilawah (recitation) only.
  const getP = (admNo) => progress[admNo] || {
    admNo, qlusLevel: level,
    tilawahPct: 0,
    currentSurahN: curriculum.fromN || 1,
    currentSurahName: surahName(curriculum.fromN || 1),
    murajaahStatus: "Not started",
    quality: "", remarks: "", teacher: "",
  };

  const setField = (admNo, field, val) => {
    setProgress(prev => ({
      ...prev,
      [admNo]: { ...getP(admNo), [field]: val },
    }));
    setSaved(prev => ({ ...prev, [admNo]: false }));
  };

  const saveStudent = async (admNo) => {
    const record = getP(admNo);
    record.name = levelStudents.find(s => s.admNo === admNo)?.name || "";
    await qlusApi.saveQuranProgress(record);
    setSaved(prev => ({ ...prev, [admNo]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [admNo]: false })), 2500);
  };

  const pctBar = (pct, color = TEAL) => (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ flex:1, height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
        <div style={{ width:`${Math.min(pct||0,100)}%`, height:"100%", background:color, borderRadius:4, transition:"width .3s" }} />
      </div>
      <span style={{ fontSize:10, fontWeight:700, color, width:32, textAlign:"right" }}>{pct||0}%</span>
    </div>
  );

  return (
    <>
      <TabBar
        tabs={[{ id:"tilawah", label:"Tilawah" }, { id:"huruf", label:"Arabic / Huruf" }]}
        active={tab}
        onChange={setTab}
        activeColor={TEAL}
      />

      <FilterBar>
        <div>
          <Lbl c="QLUS LEVEL" />
          <select value={level} onChange={e => setLevel(e.target.value)} style={ib}>
            {visibleLevels.length === 0
              ? <option value="">— No classes assigned —</option>
              : visibleLevels.map(l => (
                  <option key={l} value={l}>
                    {l} ({students.filter(s => s.status==="Active" && classToQLUSLevel(s.conv,s.isl)===l).length} students)
                  </option>
                ))}
          </select>
        </div>
        <div style={{ marginLeft:"auto", fontSize:10, color:"#94a3b8", paddingBottom:2 }}>
          {levelStudents.length} student{levelStudents.length !== 1 ? "s" : ""} at this level
        </div>
      </FilterBar>

      {/* Curriculum reference card */}
      {curriculum.fromName && (
        <div style={{ background:"#0f766e12", border:"1px solid #0f766e30", borderRadius:12, padding:"10px 16px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:TEAL, marginBottom:4 }}>
            {level} — Quran Curriculum Range
          </div>
          <div style={{ fontSize:11, color:"#0f172a" }}>
            <strong>Tilawah:</strong> Surah {curriculum.fromName} ({curriculum.fromN}) → Surah {curriculum.toName} ({curriculum.toN})
          </div>
          {curriculum.murajaah && (
            <div style={{ fontSize:11, color:"#0f172a", marginTop:2 }}>
              <strong>Muraja'ah:</strong> Surah An-Nas downward · {curriculum.note}
            </div>
          )}
          {!curriculum.murajaah && (
            <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{curriculum.note}</div>
          )}
        </div>
      )}

      {/* ── TILAWAH TAB ────────────────────────────────────────────────────── */}
      {tab === "tilawah" && (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:TEAL, padding:"10px 16px" }}>
            <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>
              {level} — Tilawah (Recitation) Progress
            </span>
          </div>

          {loading && <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>Loading progress data…</div>}

          {!loading && levelStudents.length === 0 && (
            <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
              No active students found at <strong>{level}</strong> level.
            </div>
          )}

          {!loading && levelStudents.map((s, i) => {
            const p   = getP(s.admNo);
            const qi  = qualityInfo(p.quality);
            const isSaved = saved[s.admNo];
            return (
              <div key={s.admNo} style={{ padding:"14px 16px", background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                {/* Student header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{s.name}</div>
                    <div style={{ fontSize:9, color:"#94a3b8" }}>{s.admNo} · {s.conv || s.isl}</div>
                  </div>
                  <button onClick={() => saveStudent(s.admNo)} style={{
                    display:"flex", alignItems:"center", gap:5,
                    background: isSaved ? "#dcfce7" : TEAL, color: isSaved ? "#15803d" : "#fff",
                    border:"none", borderRadius:8, padding:"5px 12px", fontSize:10, fontWeight:700, cursor:"pointer",
                  }}>
                    {isSaved ? <><Check size={11}/> Saved</> : <><Save size={11}/> Save</>}
                  </button>
                </div>

                {/* Progress bar — tilawah only */}
                <div style={{ marginBottom:10 }}>
                  <Lbl c="TILAWAH (READING) %" />
                  {pctBar(p.tilawahPct, TEAL)}
                  <input type="range" min={0} max={100} value={p.tilawahPct||0}
                    onChange={e => setField(s.admNo, "tilawahPct", +e.target.value)}
                    style={{ width:"100%", marginTop:4, accentColor:TEAL }} />
                </div>

                {/* Detail fields */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                  <div>
                    <Lbl c="CURRENT SURAH" />
                    <select value={p.currentSurahN||curriculum.fromN||1}
                      onChange={e => { const n=+e.target.value; setField(s.admNo,"currentSurahN",n); setField(s.admNo,"currentSurahName",surahName(n)); }}
                      style={{ ...ib, fontSize:11 }}>
                      {Array.from({length:114},(_,i)=>i+1).map(n=>(
                        <option key={n} value={n}>{n}. {surahName(n)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Lbl c="MURAJA'AH STATUS" />
                    <select value={p.murajaahStatus||""} onChange={e=>setField(s.admNo,"murajaahStatus",e.target.value)} style={{ ...ib, fontSize:11 }}>
                      <option value="">—</option>
                      <option>Not started</option>
                      <option>In progress</option>
                      <option>On track</option>
                      <option>Needs attention</option>
                    </select>
                  </div>
                  <div>
                    <Lbl c="RECITATION QUALITY" />
                    <select value={p.quality||""} onChange={e=>setField(s.admNo,"quality",e.target.value)}
                      style={{ ...ib, fontSize:11, color:qi.color, fontWeight:700, background:qi.bg }}>
                      <option value="">— Select —</option>
                      {TAH_QUALITY.map(q=><option key={q.id} value={q.id}>{q.id} ({q.ar})</option>)}
                    </select>
                  </div>
                  <div>
                    <Lbl c="TEACHER" />
                    <input value={p.teacher||""} onChange={e=>setField(s.admNo,"teacher",e.target.value)} placeholder="Teacher name" style={{ ...ib, fontSize:11 }} />
                  </div>
                  <div style={{ gridColumn:"1/-1" }}>
                    <Lbl c="REMARKS" />
                    <input value={p.remarks||""} onChange={e=>setField(s.admNo,"remarks",e.target.value)} placeholder="Progress notes, areas needing attention…" style={{ ...ib, fontSize:11 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* ── HURUF / ARABIC TAB ─────────────────────────────────────────────── */}
      {tab === "huruf" && (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:"#4b2e83", padding:"10px 16px" }}>
            <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>
              {level} — Arabic / Huruf Skills
            </span>
          </div>

          {huruf.skills ? (
            <div style={{ padding:16 }}>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:.4, marginBottom:4 }}>TARGET</div>
                <div style={{ fontSize:12, color:"#0f172a", background:"#f8fafc", padding:"10px 14px", borderRadius:10, border:"1px solid #e2e8f0" }}>{huruf.target}</div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:.4, marginBottom:8 }}>SKILLS FOR THIS LEVEL</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {huruf.skills.map((skill, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
                      <div style={{ width:22, height:22, borderRadius:"50%", background:"#4b2e83", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>{i+1}</div>
                      <span style={{ fontSize:12, color:"#0f172a" }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-student Arabic skill tracking */}
              <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:.4, marginBottom:8 }}>STUDENT ARABIC PROGRESS — {level.toUpperCase()}</div>
              {levelStudents.map((s, i) => {
                const p = getP(s.admNo);
                return (
                  <div key={s.admNo} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background: i%2===0?"#fff":"#f8fafc", borderRadius:10, marginBottom:6, border:"1px solid #f1f5f9" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"#0f172a" }}>{s.name}</div>
                      <div style={{ fontSize:9, color:"#94a3b8" }}>{s.admNo}</div>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <select
                        value={p.arabicLevel || ""}
                        onChange={e => { setField(s.admNo, "arabicLevel", e.target.value); }}
                        style={{ ...ib, width:140, fontSize:11 }}>
                        <option value="">— Arabic level —</option>
                        <option>Not yet started</option>
                        <option>In progress</option>
                        <option>Completed</option>
                        <option>Mastered</option>
                      </select>
                      <button onClick={() => saveStudent(s.admNo)} style={{ background:saved[s.admNo]?"#dcfce7":"#4b2e83", color:saved[s.admNo]?"#15803d":"#fff", border:"none", borderRadius:7, padding:"5px 10px", fontSize:10, fontWeight:700, cursor:"pointer" }}>
                        {saved[s.admNo] ? "✓" : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
              No Huruf curriculum defined for <strong>{level}</strong> yet.
            </div>
          )}
        </Card>
      )}
    </>
  );
}
