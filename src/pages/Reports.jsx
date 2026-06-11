import { useState, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { NAVY, GOLD, CONV_NAME, CONV_CLASSES, SUBJECTS, TERMS } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib } from "../components/shared";
import { gradeInfo, calcTotal, getPosition, ordinal } from "../utils/helpers";

// Subjects considered "core" for report cards by section
const REPORT_SUBJECTS = {
  default: ["Mathematics","English Language","Basic Science & Technology","Social Studies","Islamic Studies","Arabic Language"],
};

export default function Reports() {
  const { students, settings, getScore } = useApp();
  const [tab, setTab] = useState("card");
  const [cls, setCls] = useState("JSS1");
  const [trm, setTrm] = useState("1");
  const [stuId, setStuId] = useState("");

  const classStudents = students.filter(s => s.conv === cls && s.status === "Active");
  const subjects = REPORT_SUBJECTS[cls] || REPORT_SUBJECTS.default;

  const currentStu = classStudents.find(s => s.admNo === stuId) || classStudents[0];

  return (
    <>
      <TabBar
        tabs={[
          { id:"card",    label:"Report Card" },
          { id:"broad",   label:"Broadsheet" },
          { id:"summary", label:"Class Summary" },
        ]}
        active={tab}
        onChange={setTab}
        activeColor="#0f766e"
      />

      <FilterBar>
        <div><Lbl c="CLASS" />
          <select value={cls} onChange={e => { setCls(e.target.value); setStuId(""); }} style={ib}>
            {CONV_CLASSES.map(c => <option key={c} value={c}>{CONV_NAME[c]}</option>)}
          </select>
        </div>
        <div><Lbl c="TERM" />
          <select value={trm} onChange={e => setTrm(e.target.value)} style={ib}>
            {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        {tab === "card" && (
          <div><Lbl c="STUDENT" />
            <select value={currentStu?.admNo || ""} onChange={e => setStuId(e.target.value)} style={ib}>
              {classStudents.map(s => <option key={s.admNo} value={s.admNo}>{s.name}</option>)}
            </select>
          </div>
        )}
      </FilterBar>

      {classStudents.length === 0 && (
        <Card style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:12 }}>No active students in {CONV_NAME[cls]}.</Card>
      )}

      {classStudents.length > 0 && tab === "card" && currentStu && (
        <ReportCard student={currentStu} cls={cls} trm={trm} subjects={subjects} session={settings.session} getScore={getScore} students={classStudents} />
      )}

      {classStudents.length > 0 && tab === "broad" && (
        <Broadsheet cls={cls} trm={trm} subjects={subjects} students={classStudents} getScore={getScore} />
      )}

      {classStudents.length > 0 && tab === "summary" && (
        <ClassSummary cls={cls} trm={trm} subjects={subjects} students={classStudents} getScore={getScore} />
      )}
    </>
  );
}

/* ─── REPORT CARD ─────────────────────────────────────────────────────────── */
function ReportCard({ student, cls, trm, subjects, session, getScore, students }) {
  const subjectRows = subjects.map(sub => {
    const sc = getScore(cls, sub, trm, student.admNo);
    const total = calcTotal(sc);
    const allTotals = students.map(s => calcTotal(getScore(cls, sub, trm, s.admNo))).filter(t => t != null);
    const pos = total != null ? getPosition(allTotals, total) : null;
    return { sub, sc, total, pos, info: total != null ? gradeInfo(total) : null };
  });

  const grandTotal = subjectRows.reduce((a, r) => a + (r.total || 0), 0);
  const maxTotal   = subjects.length * 100;
  const avg        = subjects.length ? (grandTotal / subjects.length).toFixed(1) : 0;
  const overallInfo= gradeInfo(Number(avg));

  return (
    <Card style={{ overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:NAVY, padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:GOLD, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <GraduationCap size={26} color={NAVY} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ color:GOLD, fontWeight:800, fontSize:15, letterSpacing:.5 }}>FOCUS ISLAMIC &amp; WESTERN SCHOOL</div>
          <div style={{ color:"rgba(255,255,255,.6)", fontSize:11, marginTop:2 }}>
            Academic Report — {TERMS.find(t=>t.id===trm)?.label} · Session {session}
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ color:"rgba(255,255,255,.5)", fontSize:10 }}>ADM. NO.</div>
          <div style={{ color:GOLD, fontWeight:800, fontSize:13, fontFamily:"monospace" }}>{student.admNo}</div>
        </div>
      </div>

      {/* Info strip */}
      <div style={{ display:"flex", background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
        {[["STUDENT NAME", student.name], ["CLASS", CONV_NAME[student.conv]], ["ISLAMIYYAH LEVEL", student.isl || "—"], ["GENDER", student.gender === "M" ? "Male" : "Female"]].map(([l, v]) => (
          <div key={l} style={{ flex:1, padding:"10px 16px", borderRight:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:.5 }}>{l}</div>
            <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", marginTop:2 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Score table */}
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#0f766e" }}>
            {["SUBJECT","CA1\n/10","CA2\n/10","CA3\n/10","EXAM\n/70","TOTAL\n/100","GRADE","POSITION","REMARK"].map(h => (
              <th key={h} style={{ textAlign: h==="SUBJECT"?"left":"center", padding:"9px 12px", fontSize:9, fontWeight:700, color:"rgba(255,255,255,.85)", letterSpacing:.4, whiteSpace:"pre" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjectRows.map(({ sub, sc, total, pos, info }, i) => (
            <tr key={sub} style={{ background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
              <td style={{ padding:"9px 12px", fontSize:12, fontWeight:600, color:"#0f172a" }}>{sub}</td>
              {["ca1","ca2","ca3","exam"].map(f => (
                <td key={f} style={{ padding:"9px 12px", textAlign:"center", fontSize:12, color:"#475569" }}>{sc[f] !== "" && sc[f] != null ? sc[f] : "—"}</td>
              ))}
              <td style={{ padding:"9px 12px", textAlign:"center", fontSize:14, fontWeight:800, color:info?.c || "#94a3b8" }}>{total ?? "—"}</td>
              <td style={{ padding:"9px 12px", textAlign:"center" }}>{info ? <span style={{ background:info.bg, color:info.c, fontWeight:800, fontSize:11, padding:"2px 10px", borderRadius:6 }}>{info.g}</span> : "—"}</td>
              <td style={{ padding:"9px 12px", textAlign:"center", fontSize:11, fontWeight:700, color: pos===1?"#b45309":"#475569" }}>{pos ? ordinal(pos) : "—"}</td>
              <td style={{ padding:"9px 12px", textAlign:"center", fontSize:11, color:info?.c || "#94a3b8", fontStyle:"italic" }}>{info?.r || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary footer */}
      <div style={{ display:"flex", borderTop:"2px solid #e2e8f0" }}>
        {[
          { l:"Grand Total", v:`${grandTotal} / ${maxTotal}`, c:"#0f766e", bg:"#ccfbf1" },
          { l:"Average Score", v:`${avg}%`, c:"#1d4ed8", bg:"#dbeafe" },
          { l:"Overall Grade", v:overallInfo?.g || "—", c:overallInfo?.c || "#94a3b8", bg:overallInfo?.bg || "#f8fafc" },
          { l:"Subjects Sat", v:`${subjectRows.filter(s=>s.total!=null).length} of ${subjects.length}`, c:"#475569", bg:"#f8fafc" },
        ].map(({ l, v, c, bg }) => (
          <div key={l} style={{ flex:1, padding:"14px 16px", borderRight:"1px solid #e2e8f0", background:bg }}>
            <div style={{ fontSize:9, fontWeight:700, color:c, letterSpacing:.5, marginBottom:2 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize:20, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── BROADSHEET ──────────────────────────────────────────────────────────── */
function Broadsheet({ cls, trm, subjects, students, getScore }) {
  const rows = students.map(s => {
    const subs = subjects.map(sub => calcTotal(getScore(cls, sub, trm, s.admNo)));
    const grand = subs.reduce((a, t) => a + (t || 0), 0);
    return { ...s, subs, grand };
  });
  const grandTotals = rows.map(r => r.grand);

  return (
    <Card style={{ overflow:"auto" }}>
      <div style={{ background:"#475569", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>{CONV_NAME[cls]} — Class Broadsheet — {TERMS.find(t=>t.id===trm)?.label}</span>
        <span style={{ color:"rgba(255,255,255,.5)", fontSize:11 }}>{students.length} students · {subjects.length} subjects</span>
      </div>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
        <thead>
          <tr style={{ background:"#f1f5f9" }}>
            <th style={{ textAlign:"left", padding:"9px 12px", fontSize:10, fontWeight:700, color:"#475569", whiteSpace:"nowrap", position:"sticky", left:0, background:"#f1f5f9", zIndex:1 }}>STUDENT</th>
            {subjects.map(s => <th key={s} style={{ textAlign:"center", padding:"9px 8px", fontSize:9, fontWeight:700, color:"#475569", maxWidth:80 }}>{s.replace("Basic Science & Technology","Sci & Tech")}</th>)}
            <th style={{ textAlign:"center", padding:"9px 10px", fontSize:10, fontWeight:700, color:"#475569" }}>TOTAL</th>
            <th style={{ textAlign:"center", padding:"9px 10px", fontSize:10, fontWeight:700, color:"#475569" }}>AVG</th>
            <th style={{ textAlign:"center", padding:"9px 10px", fontSize:10, fontWeight:700, color:"#475569" }}>POS.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => {
            const pos = getPosition(grandTotals, s.grand);
            const avg = (s.grand / subjects.length).toFixed(1);
            return (
              <tr key={s.admNo} style={{ background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"8px 12px", fontSize:11, fontWeight:600, color:"#0f172a", whiteSpace:"nowrap", position:"sticky", left:0, background: i%2===0?"#fff":"#f8fafc", zIndex:1 }}>{s.name}</td>
                {s.subs.map((t, j) => {
                  const info = t != null ? gradeInfo(t) : null;
                  return <td key={j} style={{ padding:"8px 8px", textAlign:"center", fontSize:11, fontWeight:700, color:info?.c || "#cbd5e1" }}>{t != null ? t : "—"}</td>;
                })}
                <td style={{ padding:"8px 10px", textAlign:"center", fontSize:12, fontWeight:800, color:NAVY }}>{s.grand}</td>
                <td style={{ padding:"8px 10px", textAlign:"center", fontSize:11, color:"#475569" }}>{avg}</td>
                <td style={{ padding:"8px 10px", textAlign:"center" }}>
                  <span style={{ background: pos===1?"#fef3c7":pos<=3?"#f0fdf4":"#f8fafc", color: pos===1?"#b45309":pos<=3?"#15803d":"#475569", fontWeight:800, fontSize:11, padding:"2px 8px", borderRadius:6 }}>{ordinal(pos)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

/* ─── CLASS SUMMARY ───────────────────────────────────────────────────────── */
function ClassSummary({ cls, trm, subjects, students, getScore }) {
  const rows = subjects.map(sub => {
    const totals = students.map(s => calcTotal(getScore(cls, sub, trm, s.admNo))).filter(t => t != null);
    const avg  = totals.length ? (totals.reduce((a,b)=>a+b,0)/totals.length).toFixed(1) : null;
    const pass = totals.filter(t => t >= 40).length;
    return { sub, count:totals.length, avg, pass, high: totals.length?Math.max(...totals):null, low: totals.length?Math.min(...totals):null };
  });

  return (
    <Card style={{ overflow:"hidden" }}>
      <div style={{ background:"#0f766e", padding:"10px 16px" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>{CONV_NAME[cls]} — Subject Performance Summary — {TERMS.find(t=>t.id===trm)?.label}</span>
      </div>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#f8fafc" }}>
            {["#","SUBJECT","STUDENTS SAT","CLASS AVG.","HIGHEST","LOWEST","PASS RATE","GRADE BAND"].map(h => (
              <th key={h} style={{ textAlign: h==="SUBJECT"?"left":"center", padding:"9px 12px", fontSize:9, fontWeight:700, color:"#64748b", letterSpacing:.4, borderBottom:"2px solid #e2e8f0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ sub, count, avg, pass, high, low }, i) => {
            const info = avg != null ? gradeInfo(Number(avg)) : null;
            return (
              <tr key={sub} style={{ background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"10px 12px", fontSize:11, color:"#94a3b8", textAlign:"center" }}>{i+1}</td>
                <td style={{ padding:"10px 12px", fontSize:12, fontWeight:600, color:"#0f172a" }}>{sub}</td>
                <td style={{ padding:"10px 12px", textAlign:"center", fontSize:12, color:"#475569" }}>{count}</td>
                <td style={{ padding:"10px 12px", textAlign:"center", fontSize:13, fontWeight:800, color:info?.c || "#94a3b8" }}>{avg ?? "—"}</td>
                <td style={{ padding:"10px 12px", textAlign:"center", fontSize:12, fontWeight:700, color:"#15803d" }}>{high ?? "—"}</td>
                <td style={{ padding:"10px 12px", textAlign:"center", fontSize:12, fontWeight:700, color:"#dc2626" }}>{low ?? "—"}</td>
                <td style={{ padding:"10px 12px", textAlign:"center" }}>
                  {count > 0 ? (
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{pass}/{count}</div>
                      <div style={{ fontSize:10, color: pass/count>=.5?"#15803d":"#dc2626", fontWeight:700 }}>{Math.round(pass/count*100)}%</div>
                    </div>
                  ) : "—"}
                </td>
                <td style={{ padding:"10px 12px", textAlign:"center" }}>{info ? <span style={{ background:info.bg, color:info.c, fontWeight:800, fontSize:11, padding:"3px 10px", borderRadius:6 }}>{info.g} · {info.r}</span> : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
