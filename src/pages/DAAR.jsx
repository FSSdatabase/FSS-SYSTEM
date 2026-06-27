import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { NAVY, CONV_NAME, CONV_CLASSES, SUBJECTS } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib, PageHeader } from "../components/shared";
import { today, nowTime, uid } from "../utils/helpers";

const BLANK_FORM = {
  date:"", cls:"", subject:"", teacher:"",
  topic:"", subtopic:"", method:"", reference:"",
  homework:"", scheme:"Yes", note:"",
};

export default function DAAR({ user }) {
  const { staffList, addDaarEntry, daarEntries } = useApp();

  const isTeacher = user?.role === "teacher";
  const assignedClasses = isTeacher
    ? (user?.assignedClasses || "").split(",").map(c => c.trim()).filter(Boolean)
    : CONV_CLASSES;
  const visibleClasses = assignedClasses.length > 0 ? assignedClasses : CONV_CLASSES;
  const defaultCls = visibleClasses[0] || "JSS1";

  const [view, setView] = useState("submit");
  const [form, setForm] = useState({ ...BLANK_FORM, date:today(), cls:defaultCls });
  const [ok,   setOk]   = useState(false);
  const [df,   setDf]   = useState({ date:today(), cls:"ALL", sub:"ALL" });
  const [submitError, setSubmitError] = useState("");

  const teachers = staffList.filter(s =>
    ["Teacher","Class Teacher","Head of Islamiyyah","Head of Mutawassid","Head of Tahfeez"].includes(s.role)
  );

  const canSubmit = form.subject && form.teacher && form.topic && form.date && form.cls;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitError("");
    const entry = { ...form, id:uid(), time:nowTime() };
    const result = await addDaarEntry(entry);
    if (result && !result.ok) {
      setSubmitError(result.error || "Submission failed.");
      return;
    }
    setOk(true);
    setTimeout(() => {
      setOk(false);
      setForm({ ...BLANK_FORM, date:today(), cls:defaultCls });
    }, 2000);
  };

  const filtered = daarEntries.filter(e =>
    (!df.date || e.date === df.date) &&
    (df.cls === "ALL" || e.cls === df.cls) &&
    (df.sub === "ALL" || e.subject === df.sub)
  );

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setDfField = (field, val) => setDf(f => ({ ...f, [field]: val }));

  const schemeColors = { Yes:"#2e5e4e", Partially:NAVY, No:"#7b1e1e" };
  const schemeBg = (v) => form.scheme === v ? { background:schemeColors[v], color:"#fff" } : { background:"#f1f5f9", color:"#64748b" };

  return (
    <>
      <TabBar
        tabs={[{ id:"submit", label:"Submit Entry" }, { id:"view", label:"View Records" }]}
        active={view}
        onChange={setView}
        activeColor="#4b2e83"
      />

      {/* ── SUBMIT ─────────────────────────────────────────────────────── */}
      {view === "submit" && (
        <Card style={{ overflow:"hidden" }}>
          <PageHeader title="Daily Academic Activity Record (DAAR)" color="#4b2e83" right="* = required" />
          <div style={{ padding:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

            <div><Lbl c="DATE *" />
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={ib} />
            </div>
            <div><Lbl c="CLASS *" />
              <select value={form.cls} onChange={e => set("cls", e.target.value)} style={ib}>
                {visibleClasses.map(c => <option key={c} value={c}>{CONV_NAME[c] || c}</option>)}
              </select>
            </div>
            <div><Lbl c="SUBJECT *" />
              <select value={form.subject} onChange={e => set("subject", e.target.value)} style={ib}>
                <option value="">— Select subject —</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><Lbl c="TEACHER *" />
              <select value={form.teacher} onChange={e => set("teacher", e.target.value)} style={ib}>
                <option value="">— Select teacher —</option>
                {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div><Lbl c="TOPIC / UNIT *" />
              <input value={form.topic} onChange={e => set("topic", e.target.value)} placeholder="e.g. Introduction to Algebra" style={ib} />
            </div>
            <div><Lbl c="SUB-TOPIC" />
              <input value={form.subtopic} onChange={e => set("subtopic", e.target.value)} placeholder="e.g. Variables and expressions" style={ib} />
            </div>
            <div><Lbl c="METHODS / ACTIVITIES" />
              <input value={form.method} onChange={e => set("method", e.target.value)} placeholder="Board work, Q&A, group activity…" style={ib} />
            </div>
            <div><Lbl c="LESSON NOTE / SCHEME REF." />
              <input value={form.reference} onChange={e => set("reference", e.target.value)} placeholder="Scheme Wk 1 · LN MTH-JSS1-01" style={ib} />
            </div>
            <div><Lbl c="HOMEWORK / ASSIGNMENT" />
              <input value={form.homework} onChange={e => set("homework", e.target.value)} placeholder="Exercise 3.1, Q1–5" style={ib} />
            </div>
            <div><Lbl c="SCHEME OF WORK FOLLOWED?" />
              <div style={{ display:"flex", gap:6 }}>
                {["Yes", "Partially", "No"].map(opt => (
                  <button key={opt} onClick={() => set("scheme", opt)} style={{ flex:1, padding:"7px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, transition:"all .15s", ...schemeBg(opt) }}>{opt}</button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn:"1/-1" }}><Lbl c="TEACHER'S OBSERVATION / REMARKS" />
              <textarea value={form.note} onChange={e => set("note", e.target.value)} rows={2}
                placeholder="Student understanding, challenges, follow-up areas, absences noted…"
                style={{ ...ib, resize:"none" }} />
            </div>
          </div>

          <div style={{ padding:"12px 16px", background:"#f8fafc", borderTop:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            {submitError
              ? <span style={{ display:"flex", alignItems:"center", gap:5, color:"#dc2626", fontSize:10 }}><AlertCircle size={12} /> {submitError}</span>
              : !canSubmit
              ? <span style={{ display:"flex", alignItems:"center", gap:5, color:"#d97706", fontSize:10 }}><AlertCircle size={12} /> Fill all required (*) fields.</span>
              : <span />}
            <button onClick={submit} disabled={!canSubmit} style={{
              background: ok ? "#2e5e4e" : "#4b2e83", color:"#fff",
              border:"none", borderRadius:9, padding:"9px 24px",
              fontSize:12, fontWeight:700, cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : .45, transition:"all .2s",
            }}>
              {ok ? "✓ Submitted!" : "Submit DAAR Entry"}
            </button>
          </div>
        </Card>
      )}

      {/* ── VIEW ─────────────────────────────────────────────────────────── */}
      {view === "view" && (
        <>
          <FilterBar>
            <div><Lbl c="DATE" /><input type="date" value={df.date} onChange={e => setDfField("date", e.target.value)} style={ib} /></div>
            <div><Lbl c="CLASS" />
              <select value={df.cls} onChange={e => setDfField("cls", e.target.value)} style={ib}>
                <option value="ALL">All Classes</option>
                {visibleClasses.map(c => <option key={c} value={c}>{CONV_NAME[c] || c}</option>)}
              </select>
            </div>
            <div><Lbl c="SUBJECT" />
              <select value={df.sub} onChange={e => setDfField("sub", e.target.value)} style={ib}>
                <option value="ALL">All Subjects</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ fontSize:10, color:"#94a3b8", paddingBottom:2 }}>{filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}</div>
          </FilterBar>

          {filtered.length === 0 && (
            <Card style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:12 }}>No DAAR entries match.</Card>
          )}

          {filtered.map((e, i) => {
            const schC = { Yes:"#15803d", Partially:"#b45309", No:"#dc2626" };
            const schBg= { Yes:"#dcfce7", Partially:"#fef3c7", No:"#fee2e2" };
            return (
              <Card key={i} style={{ overflow:"hidden" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:"#4b2e83", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>{e.cls}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{e.subject}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>{e.teacher} · {e.date} · {e.time}</div>
                  </div>
                  <span style={{ background:schBg[e.scheme]||"#f1f5f9", color:schC[e.scheme]||"#64748b", fontSize:9, fontWeight:700, padding:"2px 10px", borderRadius:20 }}>{e.scheme}</span>
                </div>
                <div style={{ padding:"12px 14px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                  {[["TOPIC", e.topic, e.subtopic], ["REFERENCE", e.reference || "—", null], ["HOMEWORK", e.homework || "None set", null], ["METHODS", e.method || "—", null]].map(([l, v, s]) => (
                    <div key={l}>
                      <div style={{ fontSize:8, fontWeight:700, color:"#94a3b8", letterSpacing:.5, marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:11, fontWeight:600, color:"#0f172a" }}>{v}</div>
                      {s && <div style={{ fontSize:10, color:"#64748b", marginTop:1 }}>{s}</div>}
                    </div>
                  ))}
                  {e.note && (
                    <div style={{ gridColumn:"2/-1" }}>
                      <div style={{ fontSize:8, fontWeight:700, color:"#94a3b8", letterSpacing:.5, marginBottom:2 }}>OBSERVATION</div>
                      <div style={{ fontSize:11, color:"#475569", fontStyle:"italic" }}>{e.note}</div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </>
      )}
    </>
  );
}
