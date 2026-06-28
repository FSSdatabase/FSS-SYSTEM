import { useState } from "react";
import {
  LayoutDashboard, Users, CalendarCheck, BookMarked,
  TrendingUp, FileText, Banknote, Calendar, Settings2,
  BookOpen, Star, Menu, GraduationCap, RefreshCw, Wifi, WifiOff,
  Award, LogOut,
} from "lucide-react";
import { NAVY, GOLD } from "../data/constants";
import { useApp } from "../context/AppContext";

const NAV = [
  { id:"dashboard",          label:"Dashboard",             Icon:LayoutDashboard, roles:null },
  { id:"students",           label:"Student Registry",      Icon:Users,           roles:["director","assistant"] },
  { id:"attendance",         label:"Attendance",            Icon:CalendarCheck,   roles:null },
  { id:"daar",               label:"DAAR",                  Icon:BookMarked,      roles:null },
  { id:"fees",               label:"Fees",                  Icon:Banknote,        roles:["director"] },
  { id:"academics",          label:"Academics",             Icon:TrendingUp,      roles:null },
  { id:"reports",            label:"Reports",               Icon:FileText,        roles:["director","assistant"] },
  { id:"timetable",          label:"Timetable",             Icon:Calendar,        roles:null },
  { id:"manage",             label:"Manage",                Icon:Settings2,       roles:["director"] },
  { id:"placementpromotion", label:"Placement & Promotion", Icon:Award,           roles:["director","assistant","teacher"] },
  { id:"divider",            label:"── QLUS ──",             Icon:null,            divider:true },
  { id:"qlusdashboard",      label:"QLUS Dashboard",        Icon:BookOpen,        roles:null },
  { id:"qurantracker",       label:"Quran Tracker",         Icon:BookOpen,        roles:null },
  { id:"tahfeez",            label:"Tahfeez Center",        Icon:Star,            roles:null },
  { id:"islamicstudies",     label:"Islamic Studies",       Icon:BookMarked,      roles:null },
];

const ROLE_LABEL = { director:"Director", assistant:"Assistant", teacher:"Teacher" };

export default function Layout({ page, setPage, children, user, onLogout }) {
  const [sb, setSb] = useState(true);
  const { settings, loading, online, bootstrap, students, staffList } = useApp();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday:"long", day:"numeric", month:"long", year:"numeric",
  });

  const visibleNav = NAV.filter(n => n.divider || !n.roles || n.roles.includes(user?.role));

  if (!visibleNav.filter(n => !n.divider).find(n => n.id === page) && page !== "dashboard") {
    setPage("dashboard");
  }

  const initials = (user?.name || "?")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"system-ui,sans-serif", background:"#f1f5f9" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside style={{ width:sb?218:48, background:NAVY, display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden", transition:"width .2s" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 8px", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
          <div style={{ width:30, height:30, borderRadius:9, background:GOLD, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <GraduationCap size={15} color={NAVY} />
          </div>
          {sb && (
            <div>
              <div style={{ color:"#fff", fontWeight:700, fontSize:11, whiteSpace:"nowrap" }}>Focus Islamic &amp; Western</div>
              <div style={{ color:"rgba(255,255,255,.4)", fontSize:9 }}>School Management System</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 4px", display:"flex", flexDirection:"column", gap:1 }}>
          {visibleNav.map(({ id, label, Icon, divider }) => {
            if (divider) return sb ? (
              <div key={id} style={{ padding:"4px 8px", fontSize:9, fontWeight:700,
                color:"rgba(255,255,255,.25)", letterSpacing:.8, marginTop:6 }}>
                {label}
              </div>
            ) : <div key={id} style={{ height:1, background:"rgba(255,255,255,.08)", margin:"6px 4px" }} />;

            const active = page === id;
            return (
              <button key={id} onClick={() => setPage(id)} style={{
                display:"flex", alignItems:"center", gap:8, width:"100%",
                padding:"8px 7px", borderRadius:8, border:"none", cursor:"pointer",
                background: active ? "rgba(201,168,76,.22)" : "transparent",
                color:      active ? GOLD : "rgba(255,255,255,.42)",
                transition:"all .15s",
              }}>
                {Icon && <Icon size={14} style={{ flexShrink:0 }} />}
                {sb && <span style={{ fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Session badge */}
        {sb && (
          <div style={{ padding:"0 8px 12px" }}>
            <div style={{ background:"rgba(255,255,255,.06)", borderRadius:9, padding:8, textAlign:"center" }}>
              <div style={{ color:GOLD, fontWeight:700, fontSize:10 }}>{settings.session}</div>
              <div style={{ color:"rgba(255,255,255,.3)", fontSize:9, marginTop:1 }}>Active Session</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Topbar */}
        <header style={{ height:48, background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", padding:"0 14px", gap:10, flexShrink:0 }}>
          <button onClick={() => setSb(s => !s)} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}>
            <Menu size={17} />
          </button>
          <div style={{ width:1, height:16, background:"#e2e8f0" }} />
          <span style={{ fontWeight:700, color:"#0f172a", fontSize:13 }}>
            {NAV.find(n => n.id === page)?.label}
          </span>
          <span style={{ color:"#94a3b8", fontSize:11 }}>{today}</span>

          {/* Online indicator */}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
            <div title={online ? "Connected to Google Sheets" : "Offline — using local data"}
              style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color: online ? "#15803d" : "#94a3b8" }}>
              {online ? <Wifi size={12} /> : <WifiOff size={12} />}
              {sb && <span>{online ? "Live" : "Offline"}</span>}
            </div>
            <button onClick={bootstrap} title="Refresh data" style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}>
              <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            </button>
            <div style={{ width:28, height:28, borderRadius:"50%", background:NAVY, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:10 }}>
              {initials}
            </div>
            {sb && (
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"#0f172a" }}>{user?.name || "Unknown"}</div>
                <div style={{ fontSize:9, color:"#94a3b8" }}>
                  {ROLE_LABEL[user?.role] || user?.role} · {students.filter(s=>s.status==="Active").length} students · {staffList.length} staff
                </div>
              </div>
            )}
            <button onClick={onLogout} title="Log out" style={{
              background:"none", border:"none", cursor:"pointer", color:"#94a3b8",
              display:"flex", alignItems:"center", padding:4,
            }}>
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:12 }}>
          {children}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
