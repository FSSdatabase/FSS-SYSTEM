import { useState, useEffect, useMemo } from "react";
import { Check, Plus, Award } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib } from "../components/shared";
import { qlusApi } from "../services/qlus_api";
import { CONV_CLASSES } from "../data/constants";
import {
  QLUS_SUBJECTS, QLUS_LEVELS, classToQLUSLevel,
  HADITH_CURRICULUM, ACHIEVEMENT_TYPES
} from "../data/qlus_constants";
import { today, uid, parseAssigned } from "../utils/helpers";

const TEAL  = "#0f766e";
const PURPLE= "#4b2e83";

export default function IslamicStudies({ user }) {
  const { students, staffList } = useApp();

  // ── Scoping: same pattern as QuranTracker/Attendance. ──────────────────
  const isTeacher = user?.role === "teacher";
  const assignedConv = isTeacher ? parseAssigned(user?.assignedClasses) : CONV_CLASSES;
  const visibleClasses = isTeacher ? assignedConv : CONV_CLASSES;
  const visibleLevels = useMemo(() => {
    const allowed = new Set(visibleClasses.map(c => classToQLUSLevel(c)));
    return QLUS_LEVELS.filter(l => allowed.has(l));
  }, [visibleClasses]);
  // Used to scope the Achievements-tab student picker, which previously
  // listed every active student in the school regardless of assignment.
  const visibleStudents = useMemo(() =>
    students.filter(s => s.status === "Active" && (!isTeacher || visibleClasses.includes(s.conv))),
  [students, isTeacher, visibleClasses]);

  const [tab,      setTab]     = useState("progress");
  const [level,    setLevel]   = useState(visibleLevels[0] || "Primary 1");
  const [subject,  setSubject] = useState("Hadith");
  const [progress, setProgress]= useState([]);
  const [loading,  setLoading] = useState(false);
  const [saved,    setSaved]   = useState({});

  // Keep `level` valid if the teacher's assignment changes.
  useEffect(() => {
    if (visibleLevels.length && !visibleLevels.includes(level)) {
      setLevel(visibleLevels[0]);
    }
  }, [visibleLevels, level]);

  // Achievement form state
  const [achForm,  setAchForm] = useState({
    admNo:"", awardType:"Khatmah (Full Quran)",
    awardTitle:"", description:"", date:today(), teacher:"",
  });
  const [achSaved, setAchSaved]= useState(false);

  const levelStudents = useMemo(() =>
    students.filter(s => s.status==="Active" && classToQLUSLevel(s.conv,s.isl)===level),
    [students, level]
  );

  const teachers = staffList
    .filter(s=>["Teacher","Head of Islamiyyah","Head of Mutawassid","Class Teacher"].includes(s.role))
    .map(s=>s.name);

  // Load progress when level/subject changes
  useEffect(() => {
    setLoading(true);
    qlusApi.getIslamicProgress({ qlusLevel:level, subject }).then(data=>{
      setProgress(data||[]);
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, [level, subject]);

  const getP = (admNo) => {
    const found = progress.find(p=>p.admNo===admNo);
    return found || {
      admNo, qlusLevel:level, subject,
      unitRef:"", unitTitle:"", completed:"No",
      score:"", date:today(), teacher:"", remarks:"",
    };
  };

  const setField = (admNo, field, val) => {
    setProgress(prev => {
      const idx = prev.findIndex(p=>p.admNo===admNo);
      const updated = { ...getP(admNo), [field]:val };
      if (idx>=0) { const next=[...prev]; next[idx]=updated; return next; }
      return [...prev, updated];
    });
    setSaved(prev=>({...prev,[admNo]:false}));
  };

  const saveEntry = async (admNo) => {
    const record = { ...getP(admNo) };
    record.name  = levelStudents.find(s=>s.admNo===admNo)?.name||"";
    record.date  = record.date||today();
    await qlusApi.saveIslamicProgress(record);
    setSaved(prev=>({...prev,[admNo]:true}));
    setTimeout(()=>setSaved(prev=>({...prev,[admNo]:false})),2500);
  };

  const saveAllInLevel = async () => {
    for (const s of levelStudents) {
      await saveEntry(s.admNo);
    }
  };

  const submitAchievement = async () => {
    if (!achForm.admNo || !achForm.awardType) return;
    const stuName = visibleStudents.find(s=>s.admNo===achForm.admNo)?.name||"";
    const record  = { ...achForm, achievementId:"ACH-"+uid(), name:stuName };
    await qlusApi.saveQuranAchievement(record);
    setAchSaved(true);
    setAchForm(f=>({...f,admNo:"",awardTitle:"",description:""}));
    setTimeout(()=>setAchSaved(false),3000);
  };

  // Subject-specific helpers
  const hadithCur = HADITH_CURRICULUM[level];
  const subjectColor = {
    "Hadith":"#b45309","Fiqh":TEAL,"Tawheed":PURPLE,
    "Seerah":"#2e5e4e","Tarikh":"#475569","Adaab":"#833c00",
    "Azkar":"#0f5b6b","Arabic (Huruf)":PURPLE,
  };
  const color = subjectColor[subject]||TEAL;

  // Completion stats
  const completedCount = levelStudents.filter(s => {
    const p = getP(s.admNo);
    return p.completed==="Yes";
  }).length;

  return (
    <>
      <TabBar
        tabs={[
          { id:"progress",     label:"Subject Progress" },
          { id:"achievements", label:"Achievements" },
        ]}
        active={tab}
        onChange={setTab}
        activeColor={TEAL}
      />

      {/* ── SUBJECT PROGRESS ───────────────────────────────────────────────── */}
      {tab==="progress" && (
        <>
          <FilterBar>
            <div>
              <Lbl c="QLUS LEVEL" />
              <select value={level} onChange={e=>setLevel(e.target.value)} style={ib}>
                {visibleLevels.length === 0
                  ? <option value="">— No classes assigned —</option>
                  : visibleLevels.map(l=>(
                      <option key={l} value={l}>
                        {l} ({students.filter(s=>s.status==="Active"&&classToQLUSLevel(s.conv,s.isl)===l).length})
                      </option>
                    ))}
              </select>
            </div>
            <div>
              <Lbl c="SUBJECT" />
              <select value={subject} onChange={e=>setSubject(e.target.value)} style={ib}>
                {QLUS_SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"flex-end", gap:10, paddingBottom:2 }}>
              <span style={{ fontSize:10, color:"#94a3b8" }}>
                {completedCount}/{levelStudents.length} completed
              </span>
              <button onClick={saveAllInLevel} style={{
                background:color, color:"#fff", border:"none",
                borderRadius:9, padding:"7px 16px", fontSize:10,
                fontWeight:700, cursor:"pointer",
              }}>
                Save All
              </button>
            </div>
          </FilterBar>

          {/* Hadith reference panel */}
          {subject==="Hadith" && hadithCur && (
            <div style={{ background:"#b4530918", border:"1px solid #b4530930", borderRadius:12, padding:"10px 16px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#b45309", marginBottom:2 }}>
                Hadith — Minhajul Muslim As-Sagir
              </div>
              <div style={{ fontSize:11, color:"#0f172a" }}>
                <strong>{level}</strong> · {hadithCur.unit} · Hadiths {hadithCur.hadiths} ({hadithCur.total} hadiths)
                {hadithCur.note && <span style={{ color:"#94a3b8" }}> · {hadithCur.note}</span>}
              </div>
            </div>
          )}

          <Card style={{ overflow:"hidden" }}>
            <div style={{ background:color, padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>
                {subject} — {level} Progress
              </span>
              <span style={{ color:"rgba(255,255,255,.5)", fontSize:10 }}>
                {levelStudents.length} students
              </span>
            </div>

            {loading && (
              <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>Loading…</div>
            )}

            {!loading && levelStudents.length===0 && (
              <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
                No active students at <strong>{level}</strong> level.
              </div>
            )}

            {!loading && levelStudents.map((s, i)=>{
              const p = getP(s.admNo);
              const isSaved = saved[s.admNo];
              const isCompleted = p.completed==="Yes";

              return (
                <div key={s.admNo} style={{
                  padding:"12px 16px",
                  background: isCompleted ? "#f0fdf4" : i%2===0 ? "#fff" : "#f8fafc",
                  borderBottom:"1px solid #f1f5f9",
                  borderLeft: isCompleted ? `3px solid #15803d` : "3px solid transparent",
                }}>
                  {/* Student header */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>
                        {i+1}
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{s.name}</div>
                        <div style={{ fontSize:9, color:"#94a3b8" }}>{s.admNo}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      {/* Completed toggle */}
                      <button onClick={()=>setField(s.admNo,"completed",isCompleted?"No":"Yes")} style={{
                        background: isCompleted?"#dcfce7":"#f1f5f9",
                        color: isCompleted?"#15803d":"#64748b",
                        border:"none", borderRadius:8, padding:"5px 12px",
                        fontSize:10, fontWeight:700, cursor:"pointer",
                        display:"flex", alignItems:"center", gap:4,
                      }}>
                        {isCompleted ? <><Check size={11}/> Completed</> : "Mark Complete"}
                      </button>
                      <button onClick={()=>saveEntry(s.admNo)} style={{
                        background: isSaved?"#dcfce7":color, color: isSaved?"#15803d":"#fff",
                        border:"none", borderRadius:8, padding:"5px 12px",
                        fontSize:10, fontWeight:700, cursor:"pointer",
                      }}>
                        {isSaved?"✓ Saved":"Save"}
                      </button>
                    </div>
                  </div>

                  {/* Fields */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                    <div>
                      <Lbl c="UNIT REF." />
                      <input value={p.unitRef||""} onChange={e=>setField(s.admNo,"unitRef",e.target.value)}
                        placeholder={subject==="Hadith"?"e.g. Hadith 31":"e.g. Unit 1"} style={{ ...ib, fontSize:11 }} />
                    </div>
                    <div style={{ gridColumn:"span 2" }}>
                      <Lbl c="UNIT TITLE / TOPIC" />
                      <input value={p.unitTitle||""} onChange={e=>setField(s.admNo,"unitTitle",e.target.value)}
                        placeholder="e.g. The Hadith on Intentions (Niyyah)" style={{ ...ib, fontSize:11 }} />
                    </div>
                    <div>
                      <Lbl c="SCORE / GRADE" />
                      <input value={p.score||""} onChange={e=>setField(s.admNo,"score",e.target.value)}
                        placeholder="e.g. 85%" style={{ ...ib, fontSize:11 }} />
                    </div>
                    <div>
                      <Lbl c="DATE" />
                      <input type="date" value={p.date||today()} onChange={e=>setField(s.admNo,"date",e.target.value)}
                        style={{ ...ib, fontSize:11 }} />
                    </div>
                    <div>
                      <Lbl c="TEACHER" />
                      <select value={p.teacher||""} onChange={e=>setField(s.admNo,"teacher",e.target.value)}
                        style={{ ...ib, fontSize:11 }}>
                        <option value="">—</option>
                        {teachers.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn:"span 2" }}>
                      <Lbl c="REMARKS" />
                      <input value={p.remarks||""} onChange={e=>setField(s.admNo,"remarks",e.target.value)}
                        placeholder="Notes…" style={{ ...ib, fontSize:11 }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Footer stats */}
            {!loading && levelStudents.length>0 && (
              <div style={{ display:"flex", borderTop:"2px solid #e2e8f0" }}>
                {[
                  { l:"Completed", v:completedCount, c:"#15803d", bg:"#dcfce7" },
                  { l:"In Progress", v:levelStudents.length-completedCount, c:"#b45309", bg:"#fef3c7" },
                  { l:"Completion Rate", v:`${Math.round(completedCount/levelStudents.length*100)||0}%`, c:color, bg:"#f8fafc" },
                ].map(({l,v,c,bg})=>(
                  <div key={l} style={{ flex:1, padding:"12px 14px", borderRight:"1px solid #e2e8f0", background:bg }}>
                    <div style={{ fontSize:9, fontWeight:700, color:c, letterSpacing:.5, marginBottom:2 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:c }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── ACHIEVEMENTS ───────────────────────────────────────────────────── */}
      {tab==="achievements" && (
        <>
          <Card style={{ overflow:"hidden" }}>
            <div style={{ background:"#b45309", padding:"10px 16px" }}>
              <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>
                Award Achievement / Khatmah Certificate
              </span>
            </div>
            <div style={{ padding:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

              <div>
                <Lbl c="STUDENT *" />
                {/* FIXED: previously listed every active student in the school
                    regardless of the logged-in teacher's assignment. Now scoped
                    to visibleStudents, same restriction as the level selector. */}
                <select value={achForm.admNo} onChange={e=>setAchForm(f=>({...f,admNo:e.target.value}))} style={ib}>
                  <option value="">— Select student —</option>
                  {visibleStudents.length === 0
                    ? null
                    : visibleStudents.map(s=>(
                        <option key={s.admNo} value={s.admNo}>{s.name} ({s.admNo})</option>
                      ))}
                </select>
                {isTeacher && visibleStudents.length === 0 && (
                  <div style={{ fontSize:9, color:"#dc2626", marginTop:4 }}>
                    No students in your assigned classes.
                  </div>
                )}
              </div>

              <div>
                <Lbl c="AWARD TYPE *" />
                <select value={achForm.awardType} onChange={e=>setAchForm(f=>({...f,awardType:e.target.value}))} style={ib}>
                  {ACHIEVEMENT_TYPES.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div style={{ gridColumn:"1/-1" }}>
                <Lbl c="AWARD TITLE" />
                <input value={achForm.awardTitle} onChange={e=>setAchForm(f=>({...f,awardTitle:e.target.value}))}
                  placeholder="e.g. Khatmah Al-Quran Al-Karim — First Complete Recitation"
                  style={ib} />
              </div>

              <div style={{ gridColumn:"1/-1" }}>
                <Lbl c="DESCRIPTION / NOTES" />
                <textarea value={achForm.description} onChange={e=>setAchForm(f=>({...f,description:e.target.value}))}
                  rows={2} placeholder="Details about this achievement…"
                  style={{ ...ib, resize:"none" }} />
              </div>

              <div>
                <Lbl c="DATE" />
                <input type="date" value={achForm.date} onChange={e=>setAchForm(f=>({...f,date:e.target.value}))} style={ib} />
              </div>

              <div>
                <Lbl c="AWARDED BY (TEACHER)" />
                <select value={achForm.teacher} onChange={e=>setAchForm(f=>({...f,teacher:e.target.value}))} style={ib}>
                  <option value="">— Select —</option>
                  {teachers.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ padding:"10px 16px", background:"#f8fafc", borderTop:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              {achSaved
                ? <span style={{ display:"flex", alignItems:"center", gap:5, color:"#15803d", fontSize:11, fontWeight:700 }}><Check size={13}/> Achievement saved!</span>
                : <span style={{ fontSize:10, color:"#94a3b8" }}>Achievements are permanently recorded in Google Sheets</span>}
              <button onClick={submitAchievement} disabled={!achForm.admNo} style={{
                background:"#b45309", color:"#fff", border:"none", borderRadius:9,
                padding:"9px 24px", fontSize:11, fontWeight:700, cursor:"pointer",
                display:"flex", alignItems:"center", gap:6,
                opacity: achForm.admNo?1:.45,
              }}>
                <Award size={13}/> Record Achievement
              </button>
            </div>
          </Card>

          {/* Achievement types reference */}
          <Card style={{ padding:14 }}>
            <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:10 }}>Achievement Types Available</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {ACHIEVEMENT_TYPES.map((a, i) => (
                <div key={a} style={{ padding:"8px 12px", background:"#f8fafc", borderRadius:9, border:"1px solid #e2e8f0", fontSize:11, color:"#475569" }}>
                  <span style={{ fontWeight:700, color:"#b45309", marginRight:6 }}>{i+1}.</span>{a}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}
