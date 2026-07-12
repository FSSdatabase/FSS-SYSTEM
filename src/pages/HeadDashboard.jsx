import { useState, useEffect } from "react";
import { RefreshCw, Users, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { NAVY, GOLD } from "../data/constants";
import { Card } from "../components/shared";
import { api } from "../services/api";

const DEPT_COLOR = {
  Conventional: "#1F3864",
  Islamiyyah:   "#0f766e",
  Tahfeez:      "#4b2e83",
};

export default function HeadDashboard({ user }) {
  const department = user?.department || "";
  const color = DEPT_COLOR[department] || NAVY;

  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const data = await api.getDepartmentReport(department);
    if (data && data.ok === false) {
      setError(data.error);
      setReport(null);
    } else {
      setReport(data);
    }
    setLoading(false);
  };

  useEffect(() => { if (department) load(); }, [department]);

  if (!department) {
    return (
      <Card style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
        No department assigned to this account. Contact the Director to set the
        <code style={{ margin:"0 4px" }}>department</code> field on your Users record.
      </Card>
    );
  }

  return (
    <>
      <div style={{ background:`linear-gradient(135deg,${color},${color}cc)`, borderRadius:14, padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:GOLD, fontWeight:800, fontSize:16, letterSpacing:.5 }}>
            Head of {department} — Department Dashboard
          </div>
          <div style={{ color:"rgba(255,255,255,.6)", fontSize:12, marginTop:3 }}>
            Signed in as {user?.name} · Department-wide view
          </div>
        </div>
        <button onClick={load} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.5)" }}>
          <RefreshCw size={16} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
        </button>
      </div>

      {error && (
        <Card style={{ padding:16, background:"#fee2e2", border:"1px solid #fecaca" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, color:"#dc2626", fontSize:12, fontWeight:600 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        </Card>
      )}

      {loading && (
        <Card style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
          Loading department report…
        </Card>
      )}

      {!loading && !error && report && department === "Tahfeez" && (
        <TahfeezReport report={report} color={color} />
      )}
      {!loading && !error && report && department === "Islamiyyah" && (
        <IslamiyyahReport report={report} color={color} />
      )}
      {!loading && !error && report && department === "Conventional" && (
        <ConventionalReport report={report} color={color} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function StatCard({ label, value, sub, color, Icon }) {
  return (
    <Card style={{ padding:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:24, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{value}</div>
          <div style={{ fontSize:10, fontWeight:700, color:"#475569", marginTop:3 }}>{label}</div>
          {sub && <div style={{ fontSize:9, color:"#94a3b8", marginTop:1 }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{ width:32, height:32, borderRadius:9, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon size={15} style={{ color }} />
          </div>
        )}
      </div>
    </Card>
  );
}

function TahfeezReport({ report, color }) {
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        <StatCard label="Tahfeez Students" value={report.totalStudents} color={color} Icon={Users} />
        <StatCard label="Sessions This Week" value={report.weekSessions} color={color} Icon={TrendingUp} />
        <StatCard label="Pages Memorized (7 days)" value={report.weekPages} color={color} Icon={BookOpen} />
      </div>

      <Card style={{ padding:14 }}>
        <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:10 }}>🏆 Top Memorizers This Week</div>
        {(!report.topStudents || report.topStudents.length === 0) ? (
          <div style={{ color:"#94a3b8", fontSize:12, textAlign:"center", padding:16 }}>No sessions logged this week.</div>
        ) : report.topStudents.map((s, i) => (
          <div key={s.admNo} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background: i===0?GOLD:"#f1f5f9", color: i===0?"#fff":"#475569", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>{i+1}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"#0f172a" }}>{s.name}</div>
              <div style={{ fontSize:9, color:"#94a3b8" }}>{s.level}</div>
            </div>
            <div style={{ fontSize:12, fontWeight:800, color }}>{s.pagesThisWeek} pages</div>
          </div>
        ))}
      </Card>

      <Card style={{ padding:14 }}>
        <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
          <AlertTriangle size={13} color="#b45309" /> Students With No Session Logged This Week
        </div>
        {(!report.studentsWithMissingEntriesThisWeek || report.studentsWithMissingEntriesThisWeek.length === 0) ? (
          <div style={{ color:"#15803d", fontSize:12, textAlign:"center", padding:16 }}>All enrolled students have a session logged this week.</div>
        ) : report.studentsWithMissingEntriesThisWeek.map(s => (
          <div key={s.admNo} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #f1f5f9", fontSize:11 }}>
            <span style={{ fontWeight:600, color:"#0f172a" }}>{s.name}</span>
            <span style={{ color:"#94a3b8" }}>{s.level}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function IslamiyyahReport({ report, color }) {
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
        <StatCard label="Islamiyyah Students" value={report.totalStudents} color={color} Icon={Users} />
        <StatCard label="DAAR Entries Today" value={report.daarEntriesToday} color={color} Icon={BookOpen} />
      </div>
      <Card style={{ padding:16, background:"#fffbe6", border:"1px solid #fed7aa" }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#b45309", marginBottom:6 }}>Partial report — backend gap</div>
        <div style={{ fontSize:11, color:"#92400e", lineHeight:1.6 }}>
          Quran Tracker progress summary: <em>{report.quranProgressSummary}</em><br />
          Islamic Studies progress summary: <em>{report.islamicStudiesProgressSummary}</em><br /><br />
          These two figures cannot be computed until the underlying Apps Script functions
          (<code>getQuranProgress</code>/<code>getIslamicProgress</code>) are located and their
          sheet structure confirmed — see the Technical Audit's Apps Script Inventory gap.
        </div>
      </Card>
    </>
  );
}

function ConventionalReport({ report, color }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
      <StatCard label="Conventional Students" value={report.totalStudents} color={color} Icon={Users} />
      <StatCard label="Classes With Attendance Today" value={report.classesWithAttendanceMarkedToday} color={color} Icon={BookOpen} />
      <StatCard label="Total Score Entries" value={report.totalScoreEntries} color={color} Icon={TrendingUp} />
    </div>
  );
}
