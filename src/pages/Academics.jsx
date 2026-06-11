import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { CONV_NAME, CONV_CLASSES, SUBJECTS, TERMS, ISL_LEVELS, ISL_SUBJECTS, TAH_QUALITY } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib, PageHeader } from "../components/shared";
import { gradeInfo, calcTotal } from "../utils/helpers";

export default function Academics() {
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
        ? <ConventionalScores students={students} settings={settings} getScore={getScore} setScore={setScore} />
        : <IslamiyyahTracking students={students} settings={settings} getScore={getScore} setScore={setScore} />}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CONVENTIONAL SCORES
════════════════════════════════════════════════════════════════════════ */
function ConventionalScores({ students, settings, getScore, setScore }) {
  const [cls, setCls] = useState("JSS1");
  const [sub, setSub] = useState("Mathematics");
  const [trm, setTrm] = useState("1");
  const [saved, setSaved] = useState(false);

  const rows = useMemo(() => {
    return students.filter(s => s.conv === cls && s.status === "Active").map(s => {
      const sc = getScore(cls, sub, trm, s.admNo);
      return { ...s, sc, total: calcTotal(sc) };
    });
  }, [students, cls, sub, trm, getScore]);

  const totals = rows.map(r => r.total).filter(t => t != null);
  const high = totals.length ? Math.max(...totals) : null;
  const low  = totals.length ? Math.min(...totals) : null;
  const avg  = totals.length ? (totals.reduce((a,b)=>a+b,0)/totals.length).toFixed(1) : null;
  const pass = totals.filter(t => t >= 40).length;

  const onChange = (admNo, field, val) => {
    const max = field === "exam" ? 70 : 10;
    setScore(cls, sub, trm, admNo, field, val === "" ? "" : Math.min(+val, max));
    setSaved(false);
  };

  return (
    <>
      <FilterBar>
        <div><Lbl c="CLASS" />
          <select value={cls} onChange={e => { setCls(e.target.value); setSaved(false); }} style={ib}>
            {CONV_CLASSES.map(c => <option key={c} value={c}>{CONV_NAME[c]}</option>)}
          </select>
        </div>
        <div><Lbl c="SUBJECT" />
          <select value={sub} onChange={e => { setSub(e.target.value); setSaved(false); }} style={ib}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><Lbl c="TERM" />
          <select value={trm} onChange={e => { setTrm(e.target.value); setSaved(false); }} style={ib}>
            {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          {saved && <span style={{ display:"flex", alignItems:"center", gap:5, color:"#16a34a", fontSize:11, fontWeight:700 }}><Check size={13} /> Saved</span>}
          <button onClick={() => setSaved(true)} style={{ background:"#1F3864", color:"#fff", border:"none", borderRadius:9, padding:"8px 20px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Save Scores</button>
        </div>
      </FilterBar>

      <Card style={{ overflow:"hidden" }}>
        <PageHeader title={`${CONV_NAME[cls]} · ${sub} · ${TERMS.find(t=>t.id===trm)?.label}`} color="#b45309" right="CA: /10 each · Exam: /70 · Total: /100" />
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f8fafc" }}>
              {["#","STUDENT","ADM","CA1\n/10","CA2\n/10","CA3\n/10","EXAM\n/70","TOTAL\n/100","GRADE","REMARK"].map(h => (
                <th key={h} style={{ textAlign: h==="STUDENT"?"left":"center", padding:"9px 10px", fontSize:9, fontWeight:700, color:"#64748b", letterSpacing:.4, whiteSpace:"pre", borderBottom:"2px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const info = r.total != null ? gradeInfo(r.total) : null;
              const nb = { width:"100%", border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 6px", fontSize:12, textAlign:"center", outline:"none", fontFamily:"inherit", background: i%2===0?"#fff":"#f8fafc" };
              return (
                <tr key={r.admNo} style={{ background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                  <td style={{ padding:"8px 10px", textAlign:"center", fontSize:11, color:"#94a3b8" }}>{i+1}</td>
                  <td style={{ padding:"8px 10px", fontSize:12, fontWeight:600, color:"#0f172a", whiteSpace:"nowrap" }}>{r.name}</td>
                  <td style={{ padding:"8px 10px", textAlign:"center", fontFamily:"monospace", fontSize:9, color:"#1F3864" }}>{r.admNo.split("/").pop()}</td>
                  {["ca1","ca2","ca3","exam"].map(f => (
                    <td key={f} style={{ padding:"6px 8px", textAlign:"center" }}>
                      <input type="number" value={r.sc[f] ?? ""} min={0} max={f==="exam"?70:10}
                        onChange={e => onChange(r.admNo, f, e.target.value)}
                        style={{ ...nb, width: f==="exam"?52:42 }} />
                    </td>
                  ))}
                  <td style={{ padding:"8px 10px", textAlign:"center", fontSize:13, fontWeight:800, color: info?.c || "#94a3b8" }}>
                    {r.total ?? <span style={{ color:"#cbd5e1", fontWeight:400, fontSize:11 }}>—</span>}
                  </td>
                  <td style={{ padding:"8px 10px", textAlign:"center" }}>
                    {info ? <span style={{ background:info.bg, color:info.c, fontWeight:800, fontSize:11, padding:"3px 10px", borderRadius:6 }}>{info.g}</span> : <span style={{ color:"#cbd5e1", fontSize:11 }}>—</span>}
                  </td>
                  <td style={{ padding:"8px 10px", textAlign:"center", fontSize:11, color:info?.c || "#94a3b8", fontStyle:"italic" }}>{info?.r || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:12 }}>No students in {CONV_NAME[cls]}.</div>}

        {totals.length > 0 && (
          <div style={{ display:"flex", borderTop:"2px solid #e2e8f0" }}>
            {[
              { l:"Highest", v:high, c:"#15803d", bg:"#dcfce7" },
              { l:"Lowest",  v:low,  c:"#dc2626", bg:"#fee2e2" },
              { l:"Class Average", v:avg, c:"#1d4ed8", bg:"#dbeafe" },
              { l:"Pass Rate", v:`${pass}/${totals.length} (${Math.round(pass/totals.length*100)}%)`, c:"#0f766e", bg:"#ccfbf1" },
            ].map(({ l, v, c, bg }) => (
              <div key={l} style={{ flex:1, padding:"12px 14px", borderRight:"1px solid #e2e8f0", background:bg }}>
                <div style={{ fontSize:9, fontWeight:700, color:c, letterSpacing:.5, marginBottom:2 }}>{l.toUpperCase()}</div>
                <div style={{ fontSize:18, fontWeight:800, color:c }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ISLAMIYYAH / TAHFEEZ TRACKING
════════════════════════════════════════════════════════════════════════ */
const TAH_LEVELS = ["Mutawassid 1", "Mutawassid 2", "Mutawassid 3 (Exam Prep)", "Thanawiy 1 (SIS 1)", "Thanawiy 2 (SIS 2)", "Thanawiy 3 (Exam Prep)"];

function IslamiyyahTracking({ students, getScore, setScore, settings }) {
  const [level, setLevel] = useState(ISL_LEVELS[0]);
  const [trackType, setTrackType] = useState("subjects"); // subjects | tahfeez
  const [trm, setTrm] = useState("1");

  const levelStudents = useMemo(() =>
    students.filter(s => s.isl === level && s.status === "Active"),
    [students, level]
  );

  const isTahfeezLevel = TAH_LEVELS.includes(level);

  return (
    <>
      <FilterBar>
        <div style={{ minWidth:220 }}>
          <Lbl c="ISLAMIYYAH / TAHFEEZ LEVEL" />
          <select value={level} onChange={e => setLevel(e.target.value)} style={ib}>
            {ISL_LEVELS.map(l => (
              <option key={l} value={l}>{l} ({students.filter(s=>s.isl===l&&s.status==="Active").length})</option>
            ))}
          </select>
        </div>
        <div><Lbl c="TERM" />
          <select value={trm} onChange={e => setTrm(e.target.value)} style={ib}>
            {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div><Lbl c="TRACKING TYPE" />
          <div style={{ display:"flex", gap:6 }}>
            {[{id:"subjects",l:"Subject Scores"},{id:"tahfeez",l:"Tahfeez Progress"}].map(({id,l}) => (
              <button key={id} onClick={() => setTrackType(id)} style={{
                padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:11, fontWeight:700,
                background: trackType===id ? "#0f766e" : "#f1f5f9",
                color: trackType===id ? "#fff" : "#64748b",
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ marginLeft:"auto", fontSize:10, color:"#94a3b8", paddingBottom:2 }}>
          {levelStudents.length} student{levelStudents.length !== 1 ? "s" : ""} · {settings.session}
        </div>
      </FilterBar>

      {levelStudents.length === 0 && (
        <Card style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
          No active students at <strong>{level}</strong> level.
        </Card>
      )}

      {levelStudents.length > 0 && trackType === "subjects" && (
        <IslSubjectScores level={level} trm={trm} students={levelStudents} getScore={getScore} setScore={setScore} />
      )}

      {levelStudents.length > 0 && trackType === "tahfeez" && (
        <TahfeezProgress level={level} trm={trm} students={levelStudents} getScore={getScore} setScore={setScore} isTahfeez={isTahfeezLevel} />
      )}
    </>
  );
}

function IslSubjectScores({ level, trm, students, getScore, setScore }) {
  const [sub, setSub] = useState(ISL_SUBJECTS[0]);

  const rows = students.map(s => {
    const sc = getScore(`ISL-${level}`, sub, trm, s.admNo);
    return { ...s, sc, total: calcTotal(sc) };
  });

  const onChange = (admNo, field, val) => {
    const max = field === "exam" ? 70 : 10;
    setScore(`ISL-${level}`, sub, trm, admNo, field, val === "" ? "" : Math.min(+val, max));
  };

  return (
    <Card style={{ overflow:"hidden" }}>
      <PageHeader title={`${level} — Islamiyyah Subject Scores`} color="#0f766e"
        right={<select value={sub} onChange={e => setSub(e.target.value)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,.3)", borderRadius:6, color:"#fff", fontSize:10, padding:"3px 8px" }}>
          {ISL_SUBJECTS.map(s => <option key={s} value={s} style={{ color:"#000" }}>{s}</option>)}
        </select>}
      />
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#f8fafc" }}>
            {["#","STUDENT","CA1\n/10","CA2\n/10","CA3\n/10","EXAM\n/70","TOTAL\n/100","GRADE"].map(h => (
              <th key={h} style={{ textAlign: h==="STUDENT"?"left":"center", padding:"9px 10px", fontSize:9, fontWeight:700, color:"#64748b", whiteSpace:"pre", borderBottom:"2px solid #e2e8f0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const info = r.total != null ? gradeInfo(r.total) : null;
            const nb = { width:"100%", border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 6px", fontSize:12, textAlign:"center", outline:"none", fontFamily:"inherit", background: i%2===0?"#fff":"#f8fafc" };
            return (
              <tr key={r.admNo} style={{ background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"8px 10px", textAlign:"center", fontSize:11, color:"#94a3b8" }}>{i+1}</td>
                <td style={{ padding:"8px 10px", fontSize:12, fontWeight:600, color:"#0f172a" }}>{r.name}</td>
                {["ca1","ca2","ca3","exam"].map(f => (
                  <td key={f} style={{ padding:"6px 8px", textAlign:"center" }}>
                    <input type="number" value={r.sc[f] ?? ""} min={0} max={f==="exam"?70:10}
                      onChange={e => onChange(r.admNo, f, e.target.value)}
                      style={{ ...nb, width: f==="exam"?52:42 }} />
                  </td>
                ))}
                <td style={{ padding:"8px 10px", textAlign:"center", fontSize:13, fontWeight:800, color: info?.c || "#94a3b8" }}>{r.total ?? "—"}</td>
                <td style={{ padding:"8px 10px", textAlign:"center" }}>
                  {info ? <span style={{ background:info.bg, color:info.c, fontWeight:800, fontSize:11, padding:"3px 10px", borderRadius:6 }}>{info.g}</span> : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function TahfeezProgress({ level, trm, students, getScore, setScore, isTahfeez }) {
  // Use a special "TAHFEEZ" subject key with custom fields encoded in ca1-ca3/exam slots:
  // ca1 = Juz' completed (number), ca2 = pages this term, ca3 = Tajweed score (1-10), exam = quality index (0-3 mapped to TAH_QUALITY)
  const rows = students.map(s => {
    const sc = getScore(`TAHFEEZ-${level}`, "Tahfeez", trm, s.admNo);
    return { ...s, sc };
  });

  const onChange = (admNo, field, val) => {
    setScore(`TAHFEEZ-${level}`, "Tahfeez", trm, admNo, field, val);
  };

  return (
    <Card style={{ overflow:"hidden" }}>
      <PageHeader title={`${level} — Tahfeez / Memorization Progress`} color="#0f766e" right="Updated weekly by Hifz teacher" />
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#f8fafc" }}>
            {["#","STUDENT","JUZ' COMPLETED","NEW PAGES (TERM)","TAJWEED SCORE /10","RECITATION QUALITY","TEACHER REMARKS"].map(h => (
              <th key={h} style={{ textAlign: h==="STUDENT"||h==="TEACHER REMARKS" ?"left":"center", padding:"9px 10px", fontSize:9, fontWeight:700, color:"#64748b", letterSpacing:.3, borderBottom:"2px solid #e2e8f0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const nb = { border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 6px", fontSize:11, textAlign:"center", outline:"none", fontFamily:"inherit", background: i%2===0?"#fff":"#f8fafc" };
            const quality = r.sc.exam || "";
            const qColors = { Excellent:{c:"#15803d",bg:"#dcfce7"}, Good:{c:"#1d4ed8",bg:"#dbeafe"}, Fair:{c:"#b45309",bg:"#fef3c7"}, Weak:{c:"#dc2626",bg:"#fee2e2"} };
            return (
              <tr key={r.admNo} style={{ background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"8px 10px", textAlign:"center", fontSize:11, color:"#94a3b8" }}>{i+1}</td>
                <td style={{ padding:"8px 10px", fontSize:12, fontWeight:600, color:"#0f172a" }}>{r.name}</td>
                <td style={{ padding:"6px 8px", textAlign:"center" }}>
                  <input type="number" min={0} max={30} value={r.sc.ca1 ?? ""} onChange={e => onChange(r.admNo, "ca1", e.target.value)} style={{ ...nb, width:60 }} placeholder="0–30" />
                </td>
                <td style={{ padding:"6px 8px", textAlign:"center" }}>
                  <input type="number" min={0} value={r.sc.ca2 ?? ""} onChange={e => onChange(r.admNo, "ca2", e.target.value)} style={{ ...nb, width:70 }} placeholder="pages" />
                </td>
                <td style={{ padding:"6px 8px", textAlign:"center" }}>
                  <input type="number" min={0} max={10} value={r.sc.ca3 ?? ""} onChange={e => onChange(r.admNo, "ca3", e.target.value)} style={{ ...nb, width:50 }} placeholder="/10" />
                </td>
                <td style={{ padding:"6px 8px", textAlign:"center" }}>
                  <select value={quality} onChange={e => onChange(r.admNo, "exam", e.target.value)} style={{ ...nb, width:110, color: qColors[quality]?.c, background: qColors[quality]?.bg || "#fff", fontWeight:700 }}>
                    <option value="">— Select —</option>
                    {TAH_QUALITY.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </td>
                <td style={{ padding:"6px 8px" }}>
                  <input value={r.sc.subtopic || ""} onChange={e => onChange(r.admNo, "subtopic", e.target.value)}
                    style={{ ...nb, width:"100%", textAlign:"left" }} placeholder="Notes…" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding:"10px 14px", background:"#fffbe6", fontSize:10, color:"#b45309", borderTop:"1px solid #fed7aa" }}>
        <strong>Juz' Completed</strong> = total Juz' (out of 30) memorized to date. <strong>New Pages</strong> = pages memorized this term. Update weekly for accurate tracking toward Ijazah readiness.
      </div>
    </Card>
  );
}
