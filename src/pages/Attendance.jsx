import { useState } from "react";
import { Check } from "lucide-react";
import { NAVY, CONV_NAME, CONV_CLASSES } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib, PageHeader } from "../components/shared";
import { S_CYCLE, S_LABEL, S_BG, S_FG, today } from "../utils/helpers";

export default function Attendance({ user }) {
  const { students, staffList, getAttRecord, setAttRecord } = useApp();
  const isTeacher = user?.role === "teacher";
  const assignedClasses = isTeacher
    ? (user?.assignedClasses || "").split(",").map(c => c.trim()).filter(Boolean)
    : CONV_CLASSES;
  const visibleClasses = assignedClasses.length > 0 ? assignedClasses : CONV_CLASSES;
  const [tab,   setTab]   = useState("students");
  const [date,  setDate]  = useState(today());
  const [cls,   setCls]   = useState(visibleClasses[0] || "JSS1");
  const [saved, setSaved] = useState(false);
  const [local, setLocal] = useState({});  // unsaved changes: {id: status}

  const isStudents = tab === "students";
  const list = isStudents
    ? students.filter(s => s.conv === cls && s.status === "Active")
    : staffList.filter(s => s.status === "Active");

  const savedRecord = getAttRecord(date, tab, isStudents ? cls : "staff");

  const getStatus = (id) => local[id] ?? savedRecord[id] ?? "P";

  const toggle = (id) => {
    const curr = getStatus(id);
    const next = S_CYCLE[(S_CYCLE.indexOf(curr) + 1) % 4];
    setLocal(prev => ({ ...prev, [id]: next }));
    setSaved(false);
  };

  const saveAll = async () => {
    const merged = { ...savedRecord, ...local };
    await setAttRecord(date, tab, isStudents ? cls : "staff", merged);
    setLocal({});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Stats
  const statuses = list.map(p => getStatus(isStudents ? p.admNo : p.id));
  const countOf  = (s) => statuses.filter(x => x === s).length;

  return (
    <>
      <TabBar
        tabs={[{ id:"students", label:"Student Attendance" }, { id:"staff", label:"Staff Attendance" }]}
        active={tab}
        onChange={(t) => { setTab(t); setLocal({}); setSaved(false); }}
      />

      <FilterBar>
        <div><Lbl c="DATE" /><input type="date" value={date} onChange={e => { setDate(e.target.value); setLocal({}); setSaved(false); }} style={ib} /></div>
        {isStudents && (
          <div>
            <Lbl c="CLASS" />
            <select value={cls} onChange={e => { setCls(e.target.value); setLocal({}); setSaved(false); }} style={ib}>
              {visibleClasses.map(c => (
                <option key={c} value={c}>{CONV_NAME[c]} ({students.filter(s=>s.conv===c&&s.status==="Active").length})</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          {S_CYCLE.map(s => (
            <span key={s} style={{ background:S_BG[s], color:S_FG[s], fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:6 }}>
              {s} = {S_LABEL[s]}
            </span>
          ))}
          <span style={{ fontSize:9, color:"#94a3b8" }}>· tap to cycle</span>
        </div>
      </FilterBar>

      {/* Summary chips */}
      <div style={{ display:"flex", gap:8 }}>
        {S_CYCLE.map(s => (
          <div key={s} style={{ background:S_BG[s], color:S_FG[s], padding:"6px 14px", borderRadius:10, fontSize:11, fontWeight:700 }}>
            {S_LABEL[s]}: {countOf(s)}
          </div>
        ))}
      </div>

      <Card style={{ overflow:"hidden" }}>
        <PageHeader
          title={isStudents ? `${CONV_NAME[cls]} — ${list.length} students` : `All Staff — ${list.length} members`}
          right={date}
        />

        {list.map((person, i) => {
          const pid = isStudents ? person.admNo : person.id;
          const st  = getStatus(pid);
          return (
            <div key={pid} style={{
              display:"flex", alignItems:"center", padding:"9px 14px", gap:10,
              background: i % 2 === 0 ? "#fff" : "#f8fafc",
              borderBottom:"1px solid #f1f5f9",
            }}>
              <div style={{ width:20, fontSize:10, color:"#94a3b8", textAlign:"center", flexShrink:0 }}>{i + 1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#0f172a" }}>{person.name}</div>
                <div style={{ fontSize:9, color:"#94a3b8" }}>
                  {isStudents ? person.admNo : `${person.role} · ${person.dept}`}
                </div>
              </div>
              <button onClick={() => toggle(pid)} style={{
                width:88, padding:"6px 0", borderRadius:8, border:"none",
                background:S_BG[st], color:S_FG[st],
                fontSize:10, fontWeight:800, cursor:"pointer",
              }}>{S_LABEL[st]}</button>
            </div>
          );
        })}

        {list.length === 0 && (
          <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
            No {isStudents ? "students" : "staff"} found.
          </div>
        )}

        {/* Footer */}
        <div style={{ padding:"10px 16px", background:"#f8fafc", borderTop:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {saved
            ? <span style={{ display:"flex", alignItems:"center", gap:5, color:"#16a34a", fontSize:10, fontWeight:700 }}><Check size={12} /> Attendance saved</span>
            : <span style={{ fontSize:10, color:"#94a3b8" }}>Tap status to cycle · P → A → L → E → P</span>}
          <button onClick={saveAll} style={{ background:NAVY, color:"#fff", border:"none", borderRadius:9, padding:"8px 20px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            Save Attendance
          </button>
        </div>
      </Card>
    </>
  );
}
