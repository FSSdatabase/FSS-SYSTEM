import { useState, useMemo } from "react";
import { NAVY, CONV_NAME, CONV_CLASSES } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, Lbl, ib, PageHeader, StatusBadge } from "../components/shared";
import { naira, feeStatus } from "../utils/helpers";

export default function Fees() {
  const { students, settings, getFD, setFD } = useApp();
  const [cls, setCls] = useState("JSS1");

  const rate = settings.feeRates[cls] || 0;

  const rows = useMemo(() => {
    return students
      .filter(s => s.conv === cls && s.status === "Active")
      .map(s => {
        const d = getFD(s.admNo);
        const actual = Math.max(rate - (+d.discount || 0), 0);
        const paid   = (+d.t1 || 0) + (+d.t2 || 0) + (+d.t3 || 0);
        const annual = actual * 3;
        const netDue = annual + (+d.arrears || 0);
        const balance= netDue - paid;
        const status = feeStatus(actual, +d.discount || 0, paid, balance);
        return { ...s, d, actual, paid, annual, netDue, balance, status };
      });
  }, [students, cls, rate, getFD]);

  const totals = {
    cleared:   rows.filter(r => r.status.s === "CLEARED").length,
    partial:   rows.filter(r => r.status.s === "PARTIAL").length,
    defaulter: rows.filter(r => r.status.s === "DEFAULTER").length,
    waiver:    rows.filter(r => r.status.s === "WAIVER").length,
    collected: rows.reduce((a, r) => a + r.paid, 0),
    target:    rows.reduce((a, r) => a + r.annual, 0),
    outstanding: rows.reduce((a, r) => a + (r.balance > 0 ? r.balance : 0), 0),
  };
  const collectionRate = totals.target > 0 ? Math.round(totals.collected / totals.target * 100) : 0;

  const numInput = (val, onChange, max, color) => (
    <input
      type="number" value={val || ""} min={0} max={max}
      onChange={e => onChange(e.target.value === "" ? 0 : Math.min(+e.target.value, max ?? 1e9))}
      style={{
        width:60, border:"1px solid #e2e8f0", borderRadius:5,
        padding:"3px 5px", fontSize:10, textAlign:"center",
        outline:"none", fontFamily:"inherit", background:"transparent",
        color: color || "#0f172a", fontWeight: color ? 700 : 400,
      }}
    />
  );

  return (
    <>
      <FilterBar>
        <div>
          <Lbl c="CLASS" />
          <select value={cls} onChange={e => setCls(e.target.value)} style={ib}>
            {CONV_CLASSES.map(c => (
              <option key={c} value={c}>{CONV_NAME[c]} — {naira(settings.feeRates[c] || 0)}/term</option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft:"auto", fontSize:10, color:"#94a3b8", paddingBottom:2 }}>
          Rate: {naira(rate)}/term · Annual: {naira(rate * 3)} · Session: {settings.session}
        </div>
      </FilterBar>

      {/* Status summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          { l:"Cleared",    v:totals.cleared,   c:"#15803d", bg:"#dcfce7" },
          { l:"Partial",    v:totals.partial,   c:"#b45309", bg:"#fef3c7" },
          { l:"Defaulters", v:totals.defaulter, c:"#dc2626", bg:"#fee2e2" },
          { l:"Waivers",    v:totals.waiver,    c:"#833c00", bg:"#fce4d6" },
        ].map(({ l, v, c }) => (
          <Card key={l} style={{ padding:12 }}>
            <div style={{ fontSize:22, fontWeight:800, color:c }}>{v}</div>
            <div style={{ fontSize:10, fontWeight:700, color:c, marginTop:2 }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* Financial summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {[
          { l:"Collected",       v:naira(totals.collected),   c:"#0f172a" },
          { l:"Outstanding",     v:naira(totals.outstanding), c:"#dc2626" },
          { l:"Collection Rate", v:`${collectionRate}%`,      c: collectionRate>=90?"#15803d":collectionRate>=50?"#b45309":"#dc2626" },
        ].map(({ l, v, c }) => (
          <Card key={l} style={{ padding:12 }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:.4, marginBottom:3 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize:18, fontWeight:800, color:c }}>{v}</div>
          </Card>
        ))}
      </div>

      <Card style={{ overflow:"auto" }}>
        <PageHeader title={`${CONV_NAME[cls]} — Fee Records`} color="#0f766e" right={`${rows.length} students`} />
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:1000 }}>
          <thead>
            <tr style={{ background:"#f8fafc" }}>
              {["#","NAME","RATE/TERM","DISCOUNT","CONCESSION","ACTUAL/TERM","ARREARS","T1","T2","T3","TOTAL PAID","ANNUAL","BALANCE","STATUS"].map(h => (
                <th key={h} style={{
                  textAlign: ["NAME","CONCESSION"].includes(h) ? "left" : "center",
                  padding:"7px 9px", fontSize:8, fontWeight:700, color:"#64748b",
                  letterSpacing:.3, borderBottom:"2px solid #e2e8f0", whiteSpace:"nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.admNo} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"6px 9px", textAlign:"center", fontSize:10, color:"#94a3b8" }}>{i + 1}</td>
                <td style={{ padding:"6px 9px", fontSize:11, fontWeight:600, color:"#0f172a", whiteSpace:"nowrap" }}>{r.name}</td>
                <td style={{ padding:"6px 9px", textAlign:"center", fontSize:10, color:"#475569" }}>{naira(rate)}</td>
                <td style={{ padding:"4px 6px", textAlign:"center" }}>
                  {numInput(r.d.discount, v => setFD(r.admNo, "discount", v), rate, "#833c00")}
                </td>
                <td style={{ padding:"4px 6px" }}>
                  <input value={r.d.concession || ""} onChange={e => setFD(r.admNo, "concession", e.target.value)} placeholder="—"
                    style={{ width:90, border:"1px solid #e2e8f0", borderRadius:5, padding:"3px 5px", fontSize:10, color:"#833c00", fontStyle:"italic", outline:"none", fontFamily:"inherit" }} />
                </td>
                <td style={{ padding:"6px 9px", textAlign:"center", fontSize:10, fontWeight:700 }}>{naira(r.actual)}</td>
                <td style={{ padding:"4px 6px", textAlign:"center" }}>
                  {numInput(r.d.arrears, v => setFD(r.admNo, "arrears", v), undefined, "#b45309")}
                </td>
                {["t1", "t2", "t3"].map(t => (
                  <td key={t} style={{ padding:"4px 6px", textAlign:"center" }}>
                    {numInput(r.d[t], v => setFD(r.admNo, t, v), r.actual)}
                  </td>
                ))}
                <td style={{ padding:"6px 9px", textAlign:"center", fontSize:10, fontWeight:800 }}>{naira(r.paid)}</td>
                <td style={{ padding:"6px 9px", textAlign:"center", fontSize:10, color:"#475569" }}>{naira(r.annual)}</td>
                <td style={{ padding:"6px 9px", textAlign:"center", fontSize:10, fontWeight:800, color: r.balance > 0 ? "#dc2626" : "#15803d" }}>{naira(r.balance)}</td>
                <td style={{ padding:"6px 9px", textAlign:"center" }}>
                  <span style={{ background:r.status.bg, color:r.status.c, fontSize:8, fontWeight:800, padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap" }}>{r.status.s}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:12 }}>No students in {CONV_NAME[cls]}.</div>}
      </Card>
    </>
  );
}
