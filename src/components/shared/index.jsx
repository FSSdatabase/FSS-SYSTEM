import { NAVY } from "../../data/constants";

export const ib = {
  width:"100%", border:"1px solid #e2e8f0", borderRadius:8,
  padding:"8px 10px", fontSize:12, fontFamily:"inherit",
  outline:"none", boxSizing:"border-box", background:"#fff",
};

export const Card = ({ children, style }) => (
  <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", ...style }}>
    {children}
  </div>
);

export const Lbl = ({ c }) => (
  <div style={{ fontSize:10, fontWeight:700, color:"#64748b", marginBottom:4, letterSpacing:.4 }}>{c}</div>
);

export const Badge = ({ label, color, bg }) => (
  <span style={{ background: bg, color, fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>
    {label}
  </span>
);

export const SchemeBadge = ({ v }) => {
  const map = {
    Yes:      { bg:"#dcfce7", c:"#15803d" },
    Partially:{ bg:"#fef3c7", c:"#b45309" },
    No:       { bg:"#fee2e2", c:"#dc2626" },
  };
  const s = map[v] || { bg:"#f1f5f9", c:"#64748b" };
  return <span style={{ background:s.bg, color:s.c, fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:20 }}>{v}</span>;
};

export const StatusBadge = ({ status }) => {
  const map = {
    CLEARED:  { bg:"#dcfce7", c:"#15803d" },
    PARTIAL:  { bg:"#fef3c7", c:"#b45309" },
    DEFAULTER:{ bg:"#fee2e2", c:"#dc2626" },
    WAIVER:   { bg:"#fce4d6", c:"#833c00" },
    Active:   { bg:"#dcfce7", c:"#15803d" },
    Inactive: { bg:"#fee2e2", c:"#dc2626" },
  };
  const s = map[status] || { bg:"#f1f5f9", c:"#64748b" };
  return <span style={{ background:s.bg, color:s.c, fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap" }}>{status}</span>;
};

export const PageHeader = ({ title, color = NAVY, right }) => (
  <div style={{ background:color, padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
    <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>{title}</span>
    {right && <span style={{ color:"rgba(255,255,255,.55)", fontSize:10 }}>{right}</span>}
  </div>
);

export const TH = ({ children, left }) => (
  <th style={{
    textAlign: left ? "left" : "center",
    padding:"9px 12px", fontSize:10, fontWeight:700,
    color:"rgba(255,255,255,.8)", letterSpacing:.4,
  }}>{children}</th>
);

export const TD = ({ children, center, bold, mono, muted }) => (
  <td style={{
    padding:"8px 12px",
    textAlign: center ? "center" : "left",
    fontSize: mono ? 11 : 12,
    fontWeight: bold ? 700 : 400,
    fontFamily: mono ? "monospace" : "inherit",
    color: muted ? "#94a3b8" : "#0f172a",
    borderBottom:"1px solid #f1f5f9",
  }}>{children}</td>
);

export const EmptyRow = ({ cols, message }) => (
  <tr>
    <td colSpan={cols} style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:12 }}>
      {message || "No records found."}
    </td>
  </tr>
);

export const Btn = ({ children, onClick, color = NAVY, ghost, disabled, size = "md", icon: Icon }) => {
  const pad = size === "sm" ? "5px 12px" : "8px 18px";
  const fs  = size === "sm" ? 10 : 11;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: ghost ? "#f1f5f9" : disabled ? "#cbd5e1" : color,
        color: ghost ? "#475569" : "#fff",
        border:"none", borderRadius:9, padding:pad,
        fontSize:fs, fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
        display:"flex", alignItems:"center", gap:5,
        transition:"opacity .15s",
      }}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
};

export const TabBar = ({ tabs, active, onChange, activeColor = NAVY }) => (
  <Card style={{ padding:4, width:"fit-content", display:"flex", gap:4 }}>
    {tabs.map(({ id, label }) => (
      <button key={id} onClick={() => onChange(id)} style={{
        padding:"6px 16px", borderRadius:9, border:"none", cursor:"pointer",
        fontSize:11, fontWeight:700,
        background: active === id ? activeColor : "transparent",
        color:      active === id ? "#fff" : "#64748b",
        transition:"all .15s",
      }}>{label}</button>
    ))}
  </Card>
);

export const FilterBar = ({ children }) => (
  <Card style={{ padding:10, display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
    {children}
  </Card>
);

export const Select = ({ label, value, onChange, options, style }) => (
  <div>
    {label && <Lbl c={label} />}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...ib, ...style }}>
      {options.map(({ val, text }) => <option key={val} value={val}>{text}</option>)}
    </select>
  </div>
);

export const Input = ({ label, value, onChange, placeholder, type = "text", style }) => (
  <div>
    {label && <Lbl c={label} />}
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{ ...ib, ...style }}
    />
  </div>
);

export const Textarea = ({ label, value, onChange, placeholder, rows = 2 }) => (
  <div>
    {label && <Lbl c={label} />}
    <textarea
      value={value} placeholder={placeholder} rows={rows}
      onChange={e => onChange(e.target.value)}
      style={{ ...ib, resize:"none" }}
    />
  </div>
);

export const InfoBox = ({ type = "info", children }) => {
  const colors = {
    info:    { bg:"#eff6ff", c:"#1e40af", border:"#bfdbfe" },
    warning: { bg:"#fffbe6", c:"#b45309", border:"#fed7aa" },
    success: { bg:"#f0fdf4", c:"#15803d", border:"#bbf7d0" },
    error:   { bg:"#fef2f2", c:"#dc2626", border:"#fecaca" },
  };
  const s = colors[type];
  return (
    <div style={{
      background:s.bg, color:s.c, border:`1px solid ${s.border}`,
      borderRadius:10, padding:"9px 14px", fontSize:11,
    }}>
      {children}
    </div>
  );
};
