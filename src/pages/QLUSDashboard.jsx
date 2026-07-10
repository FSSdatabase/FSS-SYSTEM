import { useState, useEffect } from "react";
import { BookOpen, Star, TrendingUp, Award, RefreshCw } from "lucide-react";
import { NAVY, GOLD } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card } from "../components/shared";
import { qlusApi } from "../services/qlus_api";
import { classToQLUSLevel, QLUS_SUBJECTS, qualityInfo } from "../data/qlus_constants";

const TEAL = "#0f766e";

export default function QLUSDashboard({ setPage }) {
  const { students } = useApp();
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  const active = students.filter(s => s.status === "Active");

  useEffect(() => {
    qlusApi.getDashboardStats().then(d => {
      setStats(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setLoading(true);
    const d = await qlusApi.getDashboardStats();
    setStats(d);
    setLoading(false);
  };

  return (
    <>
      <div style={{ background:`linear-gradient(135deg,${NAVY},${TEAL})`, borderRadius:14, padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:GOLD, fontWeight:800, fontSize:16, letterSpacing:.5 }}>
            QLUS — Quran Learning & Understanding Studio
          </div>
          <div style={{ color:"rgba(255,255,255,.6)", fontSize:12, marginTop:3 }}>
            Focus Islamic &amp; Western School · Integrated Quran Education Module
          </div>
        </div>
        <button onClick={refresh} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.5)" }}>
          <RefreshCw size={16} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          { l:"Students Tracked",   v: stats?.trackedStudents ?? "—",   sub:"In QLUS system",         c:TEAL,    I:BookOpen },
          { l:"Sessions This Week", v: stats?.weekSessions    ?? "—",   sub:"Tahfeez sessions logged", c:"#4b2e83",I:TrendingUp },
          { l:"Pages This Week",    v: stats?.weekPages       ?? "—",   sub:"Quran pages covered",     c:"#b45309",I:Star },
          { l:"Total Achievements", v: stats?.totalAchievements ?? "—", sub:"Khatmah, milestones…",   c:"#15803d",I:Award },
        ].map(({ l, v, sub, c, I }) => (
          <Card key={l} style={{ padding:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10, fontWeight:700, color:"#475569", marginTop:3 }}>{l}</div>
                <div style={{ fontSize:9, color:"#94a3b8", marginTop:1 }}>{sub}</div>
              </div>
              <div style={{ width:32, height:32, borderRadius:9, background:c+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <I size={15} style={{ color:c }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>

        <Card style={{ padding:14 }}>
          <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:10 }}>🏆 Top Memorizers</div>
          {(!stats?.topMemorizers || stats.topMemorizers.length === 0) ? (
            <div style={{ color:"#94a3b8", fontSize:12, textAlign:"center", padding:20 }}>
              No Tahfeez data yet.<br />Log Tahfeez sessions to see rankings.
            </div>
          ) : (
            stats.topMemorizers.map((s, i) => (
              <div key={s.admNo} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background: i===0?GOLD:i===1?"#94a3b8":i===2?"#b45309":"#f1f5f9", color: i<=2?"#fff":"#475569", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#0f172a" }}>{s.name}</div>
                  <div style={{ fontSize:9, color:"#94a3b8" }}>{s.level}</div>
                </div>
                <div style={{ fontSize:12, fontWeight:800, color:TEAL }}>{s.hifzPct}%</div>
              </div>
            ))
          )}
        </Card>

        {/* Quick actions */}
        <Card style={{ padding:14 }}>
          <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:10 }}>Quick Actions</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { l:"Log Tahfeez Session",          fn:()=>setPage("tahfeez"),        bg:NAVY },
              { l:"Update Quran Progress",         fn:()=>setPage("qurantracker"),   bg:TEAL },
              { l:"Record Islamic Studies",        fn:()=>setPage("islamicstudies"), bg:"#4b2e83" },
              // FIXED: previously called setPage("achievements"), a page that does
              // not exist in App.jsx's routing — silently fell through to Dashboard.
              // Achievements live inside the Islamic Studies page's Achievements tab.
              { l:"Award Achievement / Khatmah",  fn:()=>setPage("islamicstudies"), bg:"#b45309" },
            ].map(({ l, fn, bg }) => (
              <button key={l} onClick={fn} style={{ background:bg, color:"#fff", border:"none", borderRadius:9, padding:"10px 14px", fontSize:11, fontWeight:700, cursor:"pointer", textAlign:"left" }}>{l}</button>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ padding:14 }}>
        <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:12 }}>Islamic Subjects Coverage</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {QLUS_SUBJECTS.map(sub => {
            const data = stats?.subjectStats?.[sub];
            const pct = data?.total ? Math.round(data.completed / data.total * 100) : 0;
            return (
              <div key={sub} style={{ padding:"10px 12px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#475569", marginBottom:6 }}>{sub}</div>
                <div style={{ height:6, background:"#e2e8f0", borderRadius:3, overflow:"hidden", marginBottom:4 }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:TEAL, borderRadius:3, transition:"width .4s" }} />
                </div>
                <div style={{ fontSize:10, color:TEAL, fontWeight:700 }}>
                  {data ? `${data.completed}/${data.total} units` : "No data yet"}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
