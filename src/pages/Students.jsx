import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, Lbl, ib } from "../components/shared";
import { CONV_CLASSES, CONV_NAME, ISL_LEVELS } from "../data/constants";

const StatusBadge = ({ status }) => (
  <span style={{
    background: status === "Active" ? "#dcfce7" : "#fee2e2",
    color: status === "Active" ? "#15803d" : "#dc2626",
    fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap",
  }}>{status}</span>
);

export default function Students() {
  const { students } = useApp();
  const [q, setQ]             = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [typeFilter, setTypeFilter]   = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("Active");

  const filtered = useMemo(() => students.filter(s => {
    const matchesQ = !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.admNo.toLowerCase().includes(q.toLowerCase());
    const matchesClass = classFilter === "ALL" || s.conv === classFilter || s.isl === classFilter;
    const matchesType =
      typeFilter === "ALL" ||
      (typeFilter === "conv" && s.conv && !s.isl) ||
      (typeFilter === "isl"  && !s.conv && s.isl) ||
      (typeFilter === "both" && s.conv && s.isl);
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesQ && matchesClass && matchesType && matchesStatus;
  }), [students, q, classFilter, typeFilter, statusFilter]);

  return (
    <>
      <FilterBar>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <Search size={13} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name or ADM NO…" style={{ ...ib, paddingLeft:28 }} />
        </div>
        <div>
          <Lbl c="CLASS / LEVEL" />
          <select value={classFilter} onChange={e=>setClassFilter(e.target.value)} style={ib}>
            <option value="ALL">All Classes &amp; Levels</option>
            <optgroup label="Conventional">
              {CONV_CLASSES.map(c => <option key={c} value={c}>{CONV_NAME[c]}</option>)}
            </optgroup>
            <optgroup label="Islamiyyah">
              {ISL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <Lbl c="TYPE" />
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={ib}>
            <option value="ALL">All Types</option>
            <option value="conv">Conventional Only</option>
            <option value="isl">Islamiyyah Only</option>
            <option value="both">Dual Enrolled</option>
          </select>
        </div>
        <div>
          <Lbl c="STATUS" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={ib}>
            <option value="ALL">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div style={{ fontSize:10, color:"#94a3b8", paddingBottom:2 }}>
          {filtered.length} of {students.length}
        </div>
      </FilterBar>

      {/* FIXED: previously capped display at the first 150 rows regardless of
          filter, with a "narrow your filter" message below. Now shows the
          full filtered list — the outer page container already scrolls
          (Layout.jsx's <main> has overflowY:auto), so all matching students
          are reachable by scrolling, not just the first 150. */}
      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#1F3864", position:"sticky", top:0, zIndex:1 }}>
              {["#","ADM. NO.","FULL NAME","GENDER","CONV. CLASS","ISLAMIYYAH LEVEL","STATUS","YR"].map(h => (
                <th key={h} style={{
                  textAlign: ["FULL NAME","ADM. NO.","CONV. CLASS","ISLAMIYYAH LEVEL"].includes(h) ? "left" : "center",
                  padding:"9px 12px", fontSize:10, fontWeight:700, color:"rgba(255,255,255,.8)", letterSpacing:.4,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:12 }}>No students match.</td></tr>
            )}
            {filtered.map((s, i) => (
              <tr key={s.admNo} style={{ background: i%2===0 ? "#fff" : "#f8fafc" }}>
                <td style={{ padding:"8px 12px", textAlign:"center", fontSize:11, color:"#94a3b8" }}>{i+1}</td>
                <td style={{ padding:"8px 12px", fontFamily:"monospace", fontSize:11 }}>{s.admNo}</td>
                <td style={{ padding:"8px 12px", fontWeight:700, fontSize:12 }}>{s.name}</td>
                <td style={{ padding:"8px 12px", textAlign:"center" }}>
                  <span style={{
                    background: s.gender === "M" ? "#dbeafe" : "#fce7f3",
                    color: s.gender === "M" ? "#1d4ed8" : "#be185d",
                    fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:20,
                  }}>{s.gender === "M" ? "Male" : "Female"}</span>
                </td>
                <td style={{ padding:"8px 12px" }}>
                  {s.conv
                    ? <span style={{ background:"#1F3864", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{s.conv}</span>
                    : <span style={{ color:"#cbd5e1", fontSize:10 }}>—</span>}
                </td>
                <td style={{ padding:"8px 12px" }}>
                  {s.isl
                    ? <span style={{ background:"#0f766e18", color:"#0f766e", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20, border:"1px solid #0f766e30" }}>{s.isl}</span>
                    : <span style={{ color:"#cbd5e1", fontSize:10 }}>—</span>}
                </td>
                <td style={{ padding:"8px 12px", textAlign:"center" }}><StatusBadge status={s.status} /></td>
                <td style={{ padding:"8px 12px", textAlign:"center", color:"#94a3b8", fontSize:11 }}>{s.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
