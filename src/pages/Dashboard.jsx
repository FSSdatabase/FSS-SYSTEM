import { Users, BookMarked, Banknote, CalendarCheck, GraduationCap } from "lucide-react";
import { NAVY, GOLD, CONV_NAME } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card } from "../components/shared";
import { naira } from "../utils/helpers";

export default function Dashboard({ setPage, user }) {
  const { students, staffList, daarEntries, feeData, settings } = useApp();
  const isDirector = user?.role === "director";
const isDirector = user?.role === "director";
console.log("DEBUG — current user object:", user);
  
  const active    = students.filter(s => s.status === "Active");
  const convStu   = active.filter(s => s.conv);
  const islStu    = active.filter(s => s.isl);
  const dualStu   = active.filter(s => s.conv && s.isl);
  const male      = active.filter(s => s.gender === "M").length;
  const female    = active.filter(s => s.gender === "F").length;

  // Fee quick stats for all classes
  const allFeeRows = convStu.map(s => {
    const d    = feeData[s.admNo] || { discount:0, t1:0, t2:0, t3:0, arrears:0 };
    const rate = settings.feeRates[s.conv] || 0;
    const act  = Math.max(rate - (d.discount || 0), 0);
    const paid = (+d.t1||0) + (+d.t2||0) + (+d.t3||0);
    const bal  = act * 3 + (+d.arrears||0) - paid;
    return { paid, bal, act };
  });
  const totalCollected  = allFeeRows.reduce((a, r) => a + r.paid, 0);
  const totalOutstanding= allFeeRows.reduce((a, r) => a + (r.bal > 0 ? r.bal : 0), 0);

  const classGroups = [
    { label:"Nursery",   keys:["N1","N2","N3"],                   color:"#1F5C6B" },
    { label:"Primary",   keys:["P1","P2","P3","P4","P5"],         color:"#2E5E4E" },
    { label:"JSS",       keys:["JSS1","JSS2","JSS3"],             color:"#4B2E83" },
    { label:"SS",        keys:["SS1"],                            color:"#7B1E1E" },
    { label:"Isl. Only", keys:["_islOnly"],                       color:"#0f766e" },
  ];

  const grpCount = (keys) => {
    if (keys[0] === "_islOnly") return active.filter(s => !s.conv && s.isl).length;
    return students.filter(s => keys.includes(s.conv) && s.status === "Active").length;
  };

  const quickActions = [
    { label:"Add Student",        fn:() => setPage("manage"),     bg:NAVY },
    { label:"Mark Attendance",    fn:() => setPage("attendance"), bg:"#4B2E83" },
    { label:"Submit DAAR",        fn:() => setPage("daar"),       bg:"#2E5E4E" },
    { label:"Enter CA Scores",    fn:() => setPage("academics"),  bg:"#b45309" },
    ...(isDirector ? [{ label:"View Fees", fn:() => setPage("fees"), bg:"#0f766e" }] : []),
    { label:"Generate Report",    fn:() => setPage("reports"),    bg:"#475569" },
  ];

  return (
    <>
      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          { label:"Total Students", value:active.length,     sub:"All sections",        color:NAVY,      Icon:Users         },
          { label:"Staff",          value:staffList.filter(s=>s.status==="Active").length, sub:"Active staff", color:"#4B2E83", Icon:GraduationCap },
          { label:"DAAR Today",     value:daarEntries.filter(e=>e.date===new Date().toISOString().slice(0,10)).length, sub:"Lessons logged today", color:"#2E5E4E", Icon:BookMarked },
          ...(isDirector ? [{ label:"Fees Collected", value:naira(totalCollected), sub:`${naira(totalOutstanding)} outstanding`, color:"#b45309", Icon:Banknote }] : []),
        ].map(({ label, value, sub, color, Icon }) => (
          <Card key={label} style={{ padding:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:10, fontWeight:700, color:"#475569", marginTop:3 }}>{label}</div>
                <div style={{ fontSize:9, color:"#94a3b8", marginTop:1 }}>{sub}</div>
              </div>
              <div style={{ width:32, height:32, borderRadius:9, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {/* Class distribution */}
        <Card style={{ padding:14 }}>
          <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:12 }}>Students by Group</div>
          {classGroups.map(({ label, keys, color }) => {
            const cnt = grpCount(keys);
            const pct = active.length ? Math.round(cnt / active.length * 100) : 0;
            return (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#0f172a", width:72 }}>{label}</div>
                <div style={{ flex:1, height:10, background:"#f1f5f9", borderRadius:5, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:5, transition:"width .4s" }} />
                </div>
                <div style={{ fontSize:11, fontWeight:700, color, width:28, textAlign:"right" }}>{cnt}</div>
              </div>
            );
          })}
          <div style={{ marginTop:8, fontSize:10, color:"#94a3b8" }}>
            Dual-enrolled: {dualStu.length} · Isl-only: {active.filter(s=>!s.conv&&s.isl).length}
          </div>
        </Card>

        {/* Gender + quick stats */}
        <Card style={{ padding:14 }}>
          <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:12 }}>Gender Distribution</div>
          {[{ label:"Male", v:male, c:"#1d4ed8" }, { label:"Female", v:female, c:"#be185d" }].map(({ label, v, c }) => {
            const pct = active.length ? Math.round(v / active.length * 100) : 0;
            return (
              <div key={label} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:"#0f172a" }}>{label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:c }}>{v} ({pct}%)</span>
                </div>
                <div style={{ height:10, background:"#f1f5f9", borderRadius:5, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:c, borderRadius:5 }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { label:"Conventional", v:convStu.length,                              c:NAVY },
              { label:"Islamiyyah",   v:islStu.length,                               c:"#0f766e" },
              ...(isDirector ? [
                { label:"Collected",    v:naira(totalCollected),                       c:"#15803d" },
                { label:"Outstanding",  v:naira(totalOutstanding),                     c:"#dc2626" },
              ] : []),
            ].map(({ label, v, c }) => (
              <div key={label} style={{ padding:"8px 10px", background:"#f8fafc", borderRadius:8 }}>
                <div style={{ fontSize:8, fontWeight:700, color:"#94a3b8", letterSpacing:.4, marginBottom:2 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize:13, fontWeight:800, color:c }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card style={{ padding:14 }}>
        <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:10 }}>Quick Actions</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
          {quickActions.map(({ label, fn, bg }) => (
            <button key={label} onClick={fn} style={{
              background:bg, color:"#fff", border:"none", borderRadius:9,
              padding:"10px 8px", fontSize:10, fontWeight:700, cursor:"pointer", textAlign:"center",
            }}>{label}</button>
          ))}
        </div>
      </Card>

      {/* Recent DAAR */}
      {daarEntries.length > 0 && (
        <Card style={{ padding:14 }}>
          <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:10 }}>Recent DAAR Entries</div>
          {daarEntries.slice(0, 5).map((e, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:"#f8fafc", borderRadius:9, marginBottom:6 }}>
              <div style={{ width:34, height:34, borderRadius:8, background:NAVY, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, flexShrink:0 }}>{e.cls}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.subject}</div>
                <div style={{ fontSize:10, color:"#94a3b8" }}>{e.topic} · {e.teacher} · {e.time}</div>
              </div>
              <span style={{ background: e.scheme==="Yes"?"#dcfce7":e.scheme==="Partially"?"#fef3c7":"#fee2e2", color: e.scheme==="Yes"?"#15803d":e.scheme==="Partially"?"#b45309":"#dc2626", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{e.scheme}</span>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
