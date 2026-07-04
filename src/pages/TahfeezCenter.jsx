import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib } from "../components/shared";
import { qlusApi } from "../services/qlus_api";
import { TAHFEEZ_LEVELS, TAHFEEZ_CURRICULUM, tahfeezProgressPct } from "../data/tahfeez_constants";
import { qualityInfo, TAH_QUALITY, surahName } from "../data/qlus_constants";
import { today, uid, parseAssigned } from "../utils/helpers";

const TEAL  = "#0f766e";
const NAVY  = "#1F3864";

const BLANK_SESSION = {
  admNo:"", date:today(), sabaq:"", sabqiPages:"", manzilJuz:"",
  murajaahJuz:"", hizb:"", pages:"", quality:"Good", teacher:"", remarks:"",
};

export default function TahfeezCenter({ user }) {
  const { students, staffList } = useApp();

  // ── Scoping: Tahfeez levels are independent of assignedClasses. ──────────
  // A teacher's Tahfeez roster is defined by memorization level, not conventional
  // class — one teacher may cover students across several classes who share a
  // level, so this checks assignedTahfeezLevels, not the Islamiyyah scoping field.
  const isTeacher = user?.role === "teacher";
  const assignedTahfeez = isTeacher ? parseAssigned(user?.assignedTahfeezLevels) : TAHFEEZ_LEVELS;
  // Fails closed: an assigned teacher with no Tahfeez levels set sees none,
  // rather than silently falling back to full access.
  const visibleTahfeezLevels = isTeacher ? assignedTahfeez : TAHFEEZ_LEVELS;

  const [tab,      setTab]     = useState("log");
  const [level,    setLevel]   = useState(visibleTahfeezLevels[0] || TAHFEEZ_LEVELS[0]);
  const [stuId,    setStuId]   = useState("");
  const [sessions, setSessions]= useState([]);
  const [form,     setForm]    = useState({ ...BLANK_SESSION, date:today() });
  const [submitted,setSubmitted]= useState(false);
  const [loading,  setLoading] = useState(false);
  const [deleting, setDeleting]= useState(null);

  // Keep `level` valid if the teacher's assignment changes (e.g. after re-login).
  useEffect(() => {
    if (visibleTahfeezLevels.length && !visibleTahfeezLevels.includes(level)) {
      setLevel(visibleTahfeezLevels[0]);
    }
  }, [visibleTahfeezLevels, level]);

  // Students at selected Tahfeez level. Enrollment is required — a student
  // sitting in a class that happens to correlate with a level is NOT the same
  // as being enrolled in Tahfeez; tahfeezEnrolled is a separate flag.
  const levelStudents = useMemo(() =>
    students.filter(s =>
      s.status === "Active" &&
      s.tahfeezEnrolled === true &&
      s.tahfeezLevel === level
    ),
    [students, level]
  );

  const selectedStudent = levelStudents.find(s => s.admNo === stuId) || levelStudents[0];

  // Load sessions when student changes
  useEffect(() => {
    const id = selectedStudent?.admNo;
    if (!id) return;
    setLoading(true);
    qlusApi.getTahfeezLog({ admNo: id }).then(data => {
      setSessions(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedStudent?.admNo]);

  const teachers = staffList
    .filter(s => ["Teacher","Head of Islamiyyah","Head of Mutawassid","Head of Tahfeez","Class Teacher"].includes(s.role))
    .map(s => s.name);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const submitSession = async () => {
    if (!selectedStudent || !form.date) return;
    const record = {
      ...form,
      recordId: "TL-" + uid(),
      admNo:    selectedStudent.admNo,
      name:     selectedStudent.name,
    };
    const res = await qlusApi.saveTahfeezSession(record);
    if (res) {
      setSessions(prev => [record, ...prev]);
      setForm(f => ({ ...BLANK_SESSION, date:today(), teacher:f.teacher }));
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    }
  };

  const deleteSession = async (recordId) => {
    setDeleting(recordId);
    await qlusApi.deleteTahfeezSession(recordId);
    setSessions(prev => prev.filter(s => s.recordId !== recordId));
    setDeleting(null);
  };

  // Weekly summary stats
  const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0,10);
  const weekSessions = sessions.filter(s => s.date >= weekAgo);
  const weekPages    = weekSessions.reduce((a,s) => a + (Number(s.pages)||0), 0);
  const avgQuality   = (() => {
    const order = { Excellent:4, Good:3, Fair:2, Weak:1 };
    const vals  = weekSessions.map(s => order[s.quality]||0).filter(Boolean);
    if (!vals.length) return null;
    const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
    if (avg>=3.5) return "Excellent";
    if (avg>=2.5) return "Good";
    if (avg>=1.5) return "Fair";
    return "Weak";
  })();

  const qi = qualityInfo(avgQuality);
  const curriculum = TAHFEEZ_CURRICULUM[level] || {};

  return (
    <>
      <TabBar
        tabs={[{ id:"log", label:"Log Session" }, { id:"history", label:"History & Stats" }]}
        active={tab}
        onChange={setTab}
        activeColor={TEAL}
      />

      {/* Selectors */}
      <FilterBar>
        <div>
          <Lbl c="TAHFEEZ LEVEL" />
          <select value={level} onChange={e => { setLevel(e.target.value); setStuId(""); }} style={ib}>
            {visibleTahfeezLevels.length === 0
              ? <option value="">— No Tahfeez levels assigned —</option>
              : visibleTahfeezLevels.map(l => (
                  <option key={l} value={l}>
                    {l} ({students.filter(s=>s.status==="Active"&&s.tahfeezEnrolled===true&&s.tahfeezLevel===l).length})
                  </option>
                ))}
          </select>
        </div>
        <div>
          <Lbl c="STUDENT" />
          <select value={selectedStudent?.admNo || ""} onChange={e => setStuId(e.target.value)} style={ib}>
            {levelStudents.length === 0
              ? <option value="">— No students at this level —</option>
              : levelStudents.map(s => <option key={s.admNo} value={s.admNo}>{s.name}</option>)}
          </select>
        </div>
        {selectedStudent && (
          <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:2 }}>
            <div style={{ padding:"6px 12px", background:TEAL+"15", borderRadius:9, border:`1px solid ${TEAL}30` }}>
              <div style={{ fontSize:9, fontWeight:700, color:TEAL }}>ADMISSION NO.</div>
              <div style={{ fontSize:11, fontWeight:700, color:"#0f172a", fontFamily:"monospace" }}>{selectedStudent.admNo}</div>
            </div>
          </div>
        )}
      </FilterBar>

      {/* Curriculum reference card — direction runs backward through the Quran
          (except Faslus Sadis), so this is framed as a range, not a forward bar. */}
      {curriculum.fromName && (
        <div style={{ background:"#0f766e12", border:"1px solid #0f766e30", borderRadius:12, padding:"10px 16px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:TEAL, marginBottom:4 }}>
            {level} — Tahfeez Memorization Range
          </div>
          <div style={{ fontSize:11, color:"#0f172a" }}>
            <strong>Memorize:</strong> Surah {curriculum.fromName} ({curriculum.fromN}) → Surah {curriculum.toName} ({curriculum.toN})
          </div>
          <div style={{ fontSize:11, color:"#0f172a", marginTop:2 }}>
            <strong>Muraja'ah:</strong> Surah {curriculum.murajaah} downward
          </div>
          {curriculum.note && (
            <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{curriculum.note}</div>
          )}
        </div>
      )}

      {/* ── LOG SESSION ──────────────────────────────────────────────────────── */}
      {tab === "log" && (
        <>
          {!selectedStudent ? (
            <Card style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
              Select a student above to log a Tahfeez session.
            </Card>
          ) : (
            <Card style={{ overflow:"hidden" }}>
              <div style={{ background:TEAL, padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>
                  Log Tahfeez Session — {selectedStudent.name}
                </span>
                <span style={{ color:"rgba(255,255,255,.5)", fontSize:10 }}>{selectedStudent.admNo}</span>
              </div>

              <div style={{ padding:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

                <div>
                  <Lbl c="DATE *" />
                  <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={ib} />
                </div>
                <div>
                  <Lbl c="TEACHER" />
                  <select value={form.teacher} onChange={e=>set("teacher",e.target.value)} style={ib}>
                    <option value="">— Select —</option>
                    {teachers.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <Lbl c="SABAQ (NEW LESSON TODAY)" />
                  <input value={form.sabaq} onChange={e=>set("sabaq",e.target.value)}
                    placeholder="e.g. Surah Al-Mulk v1–10" style={ib} />
                </div>
                <div>
                  <Lbl c="SABQI (YESTERDAY'S LESSON)" />
                  <input value={form.sabqiPages} onChange={e=>set("sabqiPages",e.target.value)}
                    placeholder="e.g. Surah Al-Mulk v1–10 (review)" style={ib} />
                </div>
                <div>
                  <Lbl c="MANZIL (WEEKLY PORTION — JUZ')" />
                  <input value={form.manzilJuz} onChange={e=>set("manzilJuz",e.target.value)}
                    placeholder="e.g. Juz' 28 (review)" style={ib} />
                </div>
                <div>
                  <Lbl c="MURAJA'AH (FULL REVISION — JUZ')" />
                  <input value={form.murajaahJuz} onChange={e=>set("murajaahJuz",e.target.value)}
                    placeholder="e.g. Juz' 29–30" style={ib} />
                </div>
                <div>
                  <Lbl c="HIZB REACHED (0–60)" />
                  <input type="number" min={0} max={60} value={form.hizb}
                    onChange={e=>set("hizb",Math.min(+e.target.value,60))} style={ib} />
                </div>
                <div>
                  <Lbl c="PAGES MEMORIZED TODAY" />
                  <input type="number" min={0} value={form.pages}
                    onChange={e=>set("pages",+e.target.value)} style={ib} />
                </div>

                <div style={{ gridColumn:"1/-1" }}>
                  <Lbl c="RECITATION QUALITY" />
                  <div style={{ display:"flex", gap:8 }}>
                    {TAH_QUALITY.map(q => {
                      const active = form.quality === q.id;
                      return (
                        <button key={q.id} onClick={()=>set("quality",q.id)} style={{
                          flex:1, padding:"8px 0", borderRadius:9, border:"none", cursor:"pointer",
                          fontSize:11, fontWeight:700,
                          background: active ? q.color : "#f1f5f9",
                          color:      active ? "#fff"  : "#64748b",
                          transition: "all .15s",
                        }}>
                          {q.id} <span style={{ fontSize:10, opacity:.8 }}>({q.ar})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ gridColumn:"1/-1" }}>
                  <Lbl c="TEACHER'S REMARKS" />
                  <textarea value={form.remarks} onChange={e=>set("remarks",e.target.value)}
                    rows={2} placeholder="Notes on recitation quality, Makharij, areas to improve…"
                    style={{ ...ib, resize:"none" }} />
                </div>
              </div>

              <div style={{ padding:"12px 16px", background:"#f8fafc", borderTop:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                {submitted
                  ? <span style={{ display:"flex", alignItems:"center", gap:5, color:"#15803d", fontSize:11, fontWeight:700 }}><Check size={13}/> Session logged successfully</span>
                  : <span style={{ fontSize:10, color:"#94a3b8" }}>All sessions are saved permanently to Google Sheets</span>}
                <button onClick={submitSession} disabled={!form.date} style={{
                  background: submitted ? "#15803d" : TEAL, color:"#fff",
                  border:"none", borderRadius:9, padding:"9px 24px",
                  fontSize:11, fontWeight:700, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:6,
                }}>
                  <Plus size={14}/> {submitted ? "Logged!" : "Log Session"}
                </button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── HISTORY & STATS ──────────────────────────────────────────────────── */}
      {tab === "history" && (
        <>
          {selectedStudent && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { l:"Sessions (7 days)", v:weekSessions.length, c:TEAL },
                { l:"Pages (7 days)",    v:weekPages,            c:"#4b2e83" },
                { l:"Avg Quality",       v:avgQuality||"—",      c:qi.color, bg:qi.bg },
              ].map(({ l, v, c, bg }) => (
                <Card key={l} style={{ padding:12, background:bg||"#fff" }}>
                  <div style={{ fontSize:9, fontWeight:700, color:c, letterSpacing:.4, marginBottom:3 }}>{l.toUpperCase()}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:c }}>{v}</div>
                </Card>
              ))}
            </div>
          )}

          <Card style={{ overflow:"hidden" }}>
            <div style={{ background:NAVY, padding:"10px 16px" }}>
              <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>
                {selectedStudent ? `${selectedStudent.name} — Session History` : "Select a student to view history"}
              </span>
            </div>

            {loading && <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>Loading…</div>}

            {!loading && sessions.length === 0 && (
              <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
                No sessions logged yet for this student.<br/>Use the <strong>Log Session</strong> tab to add the first entry.
              </div>
            )}

            {!loading && sessions.map((s, i) => {
              const qi2 = qualityInfo(s.quality);
              return (
                <div key={s.recordId} style={{ padding:"12px 16px", background:i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:TEAL, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, flexShrink:0, textAlign:"center" }}>
                        {s.date.slice(5)}
                      </div>
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:"#0f172a" }}>{s.date}</div>
                        <div style={{ fontSize:9, color:"#94a3b8" }}>{s.teacher || "No teacher recorded"}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {s.quality && (
                        <span style={{ background:qi2.bg, color:qi2.color, fontSize:9, fontWeight:700, padding:"2px 9px", borderRadius:20 }}>
                          {s.quality}
                        </span>
                      )}
                      {s.pages && (
                        <span style={{ background:"#dbeafe", color:"#1d4ed8", fontSize:9, fontWeight:700, padding:"2px 9px", borderRadius:20 }}>
                          {s.pages} pages
                        </span>
                      )}
                      <button onClick={() => deleteSession(s.recordId)} disabled={deleting === s.recordId}
                        style={{ background:"#fee2e2", border:"none", borderRadius:6, padding:"4px 8px", cursor:"pointer", color:"#dc2626", opacity: deleting===s.recordId ? .4 : 1 }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                    {[
                      ["Sabaq",     s.sabaq],
                      ["Sabqi",     s.sabqiPages],
                      ["Manzil",    s.manzilJuz],
                      ["Muraja'ah", s.murajaahJuz],
                    ].map(([label, val]) => val ? (
                      <div key={label}>
                        <span style={{ fontSize:9, fontWeight:700, color:"#94a3b8" }}>{label}: </span>
                        <span style={{ fontSize:11, color:"#0f172a" }}>{val}</span>
                      </div>
                    ) : null)}
                    {s.hizb && (
                      <div>
                        <span style={{ fontSize:9, fontWeight:700, color:"#94a3b8" }}>Hizb reached: </span>
                        <span style={{ fontSize:11, color:"#0f172a", fontWeight:700 }}>{s.hizb}/60</span>
                      </div>
                    )}
                    {s.remarks && (
                      <div style={{ gridColumn:"1/-1" }}>
                        <span style={{ fontSize:9, fontWeight:700, color:"#94a3b8" }}>Remarks: </span>
                        <span style={{ fontSize:11, color:"#475569", fontStyle:"italic" }}>{s.remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </>
      )}
    </>
  );
}
