import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { NAVY, CONV_NAME, CONV_CLASSES, ISL_LEVELS } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, Lbl, ib, TH, TD, EmptyRow, StatusBadge, PageHeader } from "../components/shared";

export default function Students() {
  const { students } = useApp();
  const [q,    setQ]    = useState("");
  const [cf,   setCf]   = useState("ALL");
  const [type, setType] = useState("ALL");
  const [stf,  setStf]  = useState("Active");

  const filtered = useMemo(() => students.filter(s => {
    const qOk   = !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.admNo.toLowerCase().includes(q.toLowerCase());
    const cOk   = cf === "ALL" || s.conv === cf || s.isl === cf;
    const typeOk= type === "ALL"
      || (type === "conv" && s.conv && !s.isl)
      || (type === "isl"  && !s.conv && s.isl)
      || (type === "both" && s.conv && s.isl);
    const stOk  = stf === "ALL" || s.status === stf;
    return qOk && cOk && typeOk && stOk;
  }), [students, q, cf, type, stf]);

  return (
    <>
      <FilterBar>
        {/* Search */}
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <Search size={13} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or ADM NO…" style={{ ...ib, paddingLeft:28 }} />
        </div>

        {/* Class/Level */}
        <div>
          <Lbl c="CLASS / LEVEL" />
          <select value={cf} onChange={e => setCf(e.target.value)} style={ib}>
            <option value="ALL">All Classes &amp; Levels</option>
            <optgroup label="Conventional">
              {CONV_CLASSES.map(c => <option key={c} value={c}>{CONV_NAME[c]}</option>)}
            </optgroup>
            <optgroup label="Islamiyyah">
              {ISL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </optgroup>
          </select>
        </div>

        {/* Enrollment type */}
        <div>
          <Lbl c="TYPE" />
          <select value={type} onChange={e => setType(e.target.value)} style={ib}>
            <option value="ALL">All Types</option>
            <option value="conv">Conventional Only</option>
            <option value="isl">Islamiyyah Only</option>
            <option value="both">Dual Enrolled</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <Lbl c="STATUS" />
          <select value={stf} onChange={e => setStf(e.target.value)} style={ib}>
            <option value="ALL">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div style={{ fontSize:10, color:"#94a3b8", paddingBottom:2 }}>
          {filtered.length} of {students.length}
        </div>
      </FilterBar>

      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:NAVY }}>
              <TH>#</TH>
              <TH left>ADM. NO.</TH>
              <TH left>FULL NAME</TH>
              <TH>GENDER</TH>
              <TH left>CONV. CLASS</TH>
              <TH left>ISLAMIYYAH LEVEL</TH>
              <TH>STATUS</TH>
              <TH>YR</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <EmptyRow cols={8} message="No students match." />}
            {filtered.slice(0, 150).map((s, i) => (
              <tr key={s.admNo} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                <TD muted center>{i + 1}</TD>
                <TD mono>{s.admNo}</TD>
                <TD bold>{s.name}</TD>
                <TD center>
                  <span style={{ background: s.gender==="M"?"#dbeafe":"#fce7f3", color: s.gender==="M"?"#1d4ed8":"#be185d", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>
                    {s.gender === "M" ? "Male" : "Female"}
                  </span>
                </TD>
                <TD>
                  {s.conv
                    ? <span style={{ background:NAVY, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{s.conv}</span>
                    : <span style={{ color:"#cbd5e1", fontSize:10 }}>—</span>}
                </TD>
                <TD>
                  {s.isl
                    ? <span style={{ background:"#0f766e18", color:"#0f766e", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20, border:"1px solid #0f766e30" }}>{s.isl}</span>
                    : <span style={{ color:"#cbd5e1", fontSize:10 }}>—</span>}
                </TD>
                <TD center><StatusBadge status={s.status} /></TD>
                <TD muted center>{s.year}</TD>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 150 && (
          <div style={{ padding:"9px 14px", background:"#fffbe6", textAlign:"center", fontSize:11, color:"#b45309" }}>
            Showing first 150 of {filtered.length}. Narrow your filter to see more.
          </div>
        )}
      </Card>
    </>
  );
}
