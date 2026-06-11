import { useState } from "react";
import { CONV_NAME, CONV_CLASSES, TIMETABLE_JSS1 } from "../data/constants";
import { Card, FilterBar, Lbl, ib, InfoBox } from "../components/shared";

const DAYS = [
  { id:"Mon", label:"Monday" },
  { id:"Tue", label:"Tuesday" },
  { id:"Wed", label:"Wednesday" },
  { id:"Thu", label:"Thursday" },
  { id:"Fri", label:"Friday" },
  { id:"Sat", label:"Saturday" },
];

export default function Timetable() {
  const [cls, setCls] = useState("JSS1");
  const [day, setDay] = useState("Mon");

  // Currently only JSS1 has a sample timetable; other classes show placeholder
  const hasData = cls === "JSS1";
  const periods = hasData ? TIMETABLE_JSS1[day] : [];

  return (
    <>
      <FilterBar>
        <div><Lbl c="CLASS" />
          <select value={cls} onChange={e => setCls(e.target.value)} style={ib}>
            {CONV_CLASSES.map(c => <option key={c} value={c}>{CONV_NAME[c]}</option>)}
          </select>
        </div>
        <div style={{ flex:1 }}>
          <Lbl c="DAY" />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {DAYS.map(({ id, label }) => (
              <button key={id} onClick={() => setDay(id)} style={{
                padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:11, fontWeight:700,
                background: day===id ? "#1F3864" : "#f1f5f9",
                color: day===id ? "#fff" : "#64748b",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </FilterBar>

      {!hasData && (
        <InfoBox type="warning">
          No timetable data entered for <strong>{CONV_NAME[cls]}</strong> yet. Use <strong>Manage → Settings</strong> (or edit <code>src/data/constants.js → TIMETABLE_JSS1</code> as a template) to add timetables for other classes. JSS1 is provided as a working example.
        </InfoBox>
      )}

      {hasData && (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:"#1F3864", padding:"10px 16px" }}>
            <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>
              {CONV_NAME[cls]} — {DAYS.find(d=>d.id===day)?.label} Timetable
            </span>
          </div>
          <div style={{ padding:14, display:"flex", flexDirection:"column", gap:6 }}>
            {periods.map((p, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding: p.special ? "8px 14px" : "10px 14px",
                background: p.special ? p.color : "#f8fafc",
                borderRadius:10,
                borderLeft: p.special ? "none" : `4px solid ${p.color}`,
              }}>
                <div style={{ width:90, fontSize:11, fontWeight:700, color: p.special ? "#475569" : "#0f172a", flexShrink:0 }}>{p.slot}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight: p.special?700:600, color: p.special ? "#475569" : "#0f172a", letterSpacing: p.special?.5:0 }}>
                    {p.sub}
                  </div>
                  {p.teacher && <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{p.teacher}</div>}
                </div>
                {!p.special && (
                  <div style={{ width:8, height:8, borderRadius:"50%", background:p.color, flexShrink:0 }} />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <InfoBox type="info">
        <strong>Note:</strong> This is a sample weekly timetable for JSS1. Each school day includes core subjects, breaks, Dhuhr/lunch, and Friday Jum'ah accommodation. Customize per class in <code>src/data/constants.js</code> — the structure is fully editable and supports any subject/teacher/time combination.
      </InfoBox>
    </>
  );
}
