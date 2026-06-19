import { useState, useCallback } from "react";

// ── API CONFIG ───────────────────────────────────────────────────
// Paste your FSS School Database Web App URL here — same one used
// in Code_05_Bridge.gs as FSS_API_URL. Find it via:
// Apps Script (Database project) → Deploy → Manage Deployments
const FSS_API_URL = "https://script.google.com/macros/s/AKfycbyNHMVob57d4evCaHYrBL3woPxQEi_LZ_E7hB7HdPnzKYYWG9OtbMOYOx-TIxOrGeL5/exec";

async function fssPost(action, payload) {
  const res = await fetch(FSS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight on GAS
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Unknown server error");
  return json.data;
}

// ── Design tokens ────────────────────────────────────────────────
const T = {
  green:     "#1A5276",
  greenMid:  "#1E8449",
  amber:     "#D68910",
  red:       "#C0392B",
  redLight:  "#FADBD8",
  amberLight:"#FDEBD0",
  greenLight:"#D5F5E3",
  blueLight: "#D6EAF8",
  slate:     "#2C3E50",
  bg:        "#F4F6F8",
  white:     "#FFFFFF",
  border:    "#D5D8DC",
  text:      "#2C3E50",
  muted:     "#7F8C8D",
};

// ── Shared components ────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.white, borderRadius: 8, border: `1px solid ${T.border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 20, ...style
  }}>{children}</div>
);

const SectionLabel = ({ children, color = T.green }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color,
    textTransform: "uppercase", marginBottom: 10, paddingBottom: 4,
    borderBottom: `2px solid ${color}`
  }}>{children}</div>
);

const Input = ({ label, value, onChange, type = "number", min = 0, max = 100, required = false, hint }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: T.slate, display: "block", marginBottom: 3 }}>
      {label}{required && <span style={{ color: T.red }}> *</span>}
    </label>
    <input
      type={type} value={value} min={min} max={max}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "6px 10px", borderRadius: 5,
        border: `1px solid ${T.border}`, fontSize: 13, color: T.text,
        background: T.white, boxSizing: "border-box",
        outline: "none", fontFamily: "inherit"
      }}
    />
    {hint && <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{hint}</div>}
  </div>
);

const ScoreInput15 = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 10 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: T.slate, display: "block", marginBottom: 3 }}>
      {label}
    </label>
    <div style={{ display: "flex", gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          flex: 1, padding: "6px 0", borderRadius: 5, border: `1px solid ${T.border}`,
          background: value === n ? T.green : T.white,
          color: value === n ? T.white : T.text,
          fontWeight: 700, fontSize: 13, cursor: "pointer",
          transition: "all 0.15s"
        }}>{n}</button>
      ))}
    </div>
  </div>
);

const RiskBadge = ({ level }) => {
  const map = {
    GREEN:  { bg: T.greenLight, color: T.greenMid, icon: "🟢" },
    AMBER:  { bg: T.amberLight, color: T.amber,    icon: "🟡" },
    RED:    { bg: T.redLight,   color: T.red,       icon: "🔴" },
  };
  const s = map[level] || map.GREEN;
  return (
    <span style={{
      background: s.bg, color: s.color, borderRadius: 12,
      padding: "3px 10px", fontWeight: 700, fontSize: 12
    }}>{s.icon} {level}</span>
  );
};

const DecisionBox = ({ score, decision, label, color }) => (
  <div style={{
    background: color + "22", border: `2px solid ${color}`,
    borderRadius: 8, padding: 16, textAlign: "center"
  }}>
    <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1.1, margin: "4px 0" }}>
      {score !== null ? score.toFixed(1) : "—"}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 6 }}>{decision || "—"}</div>
  </div>
);

const Row = ({ children, gap = 16 }) => (
  <div style={{ display: "flex", gap, flexWrap: "wrap" }}>{children}</div>
);

const Col = ({ children, flex = 1 }) => (
  <div style={{ flex, minWidth: 220 }}>{children}</div>
);

// ════════════════════════════════════════════════════════════════
// PLACEMENT TAB
// ════════════════════════════════════════════════════════════════
const PLACEMENT_CLASSES = [
  "N1","N2","N3","Pry1","Pry2","Pry3","Pry4","Pry5","Pry6",
  "JSS1","JSS2","JSS3","SS1","SS2","SS3",
  "Raudah1","Raudah2","Pri1","Pri2","Pri3","Pri4","Pri5","Pri6",
  "Barnamaj1","Barnamaj2","Mutawassit1","Mutawassit2","Mutawassit3",
  "Thanawiy1","Thanawiy2","Thanawiy3",
  "Diploma Yr1","Diploma Yr2","Special"
];

function computeAgeScore(age, reqClass) {
  const secondary = ["SS3","SS2","SS1","JSS3","JSS2","JSS1"];
  const primary   = ["Pry6","Pry5","Pry4","Pry3","Pry2","Pry1"];
  if (secondary.includes(reqClass)) {
    return age >= 14 ? 100 : age >= 12 ? 80 : 60;
  } else if (primary.includes(reqClass)) {
    return age >= 6 ? 100 : age >= 5 ? 80 : 60;
  } else {
    return age >= 3 ? 100 : age >= 2 ? 70 : 40;
  }
}

function computeTPS(academic, dev, beh, ageScore) {
  const devScore = dev.reduce((a, b) => a + b, 0) / dev.length * 20;
  const behScore = beh.reduce((a, b) => a + b, 0) / beh.length * 25;
  return +(
    (academic * 0.4) + (devScore * 0.3) + (behScore * 0.1) + (ageScore * 0.2)
  ).toFixed(1);
}

function placementDecision(tps) {
  if (tps >= 85) return { text: "✅ Full Placement in Requested Class", risk: "GREEN", color: T.greenMid };
  if (tps >= 70) return { text: "⚠ Placement with Support",            risk: "AMBER", color: T.amber };
  if (tps >= 50) return { text: "↓ Lower Class Recommended",           risk: "AMBER", color: T.amber };
  return           { text: "❌ Strongly Recommend Lower Class",         risk: "RED",   color: T.red };
}

const DEV_ITEMS  = ["Concentration","Instruction Following","Communication","Social Interaction","Fine Motor Skills","Emotional Maturity"];
const BEH_ITEMS  = ["Discipline","Respect","Cooperation","Responsiveness"];

function PlacementTab() {
  const [admNo,     setAdmNo]        = useState("");
  const [reqClass,  setReqClass]    = useState("N1");
  const [age,       setAge]         = useState(5);
  const [english,   setEnglish]     = useState(70);
  const [math,      setMath]        = useState(70);
  const [arabic,    setArabic]      = useState(70);
  const [genKnow,   setGenKnow]     = useState(70);
  const [dev,       setDev]         = useState([3,3,3,3,3,3]);
  const [beh,       setBeh]         = useState([3,3,3,3]);
  const [computed,  setComputed]    = useState(null);
  const [saved,     setSaved]       = useState([]);
  const [saving,    setSaving]      = useState(false);
  const [saveError, setSaveError]   = useState(null);

  const academic = +((english + math + arabic + genKnow) / 4).toFixed(1);
  const ageScore = computeAgeScore(+age, reqClass);
  const tps      = computeTPS(academic, dev, beh, ageScore);
  const dec      = placementDecision(tps);

  const handleCompute = () => {
    if (!admNo) { alert("Enter the student's Admission Number first."); return; }
    setSaveError(null);
    setComputed({ admNo, reqClass, age, english, math, arabic, genKnow,
                  dev: [...dev], beh: [...beh], tps, dec, ageScore, academic,
                  timestamp: new Date().toLocaleString() });
  };

  const handleSave = async () => {
    if (!computed) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await fssPost("savePlacement", {
        record: {
          admNo: computed.admNo,
          reqClass: computed.reqClass,
          age: computed.age,
          english: computed.english, math: computed.math,
          arabic: computed.arabic, genKnow: computed.genKnow,
          dev: computed.dev, beh: computed.beh,
          assessedBy: "", // optionally wire to logged-in staff name
        },
      });
      setSaved(prev => [{ ...computed, serverName: result.name }, ...prev]);
      alert(`✅ Saved to FSS Database.\n\nStudent: ${result.name || computed.admNo}\nTPS: ${result.tps}\nDecision: ${result.decision}`);
    } catch (err) {
      setSaveError(err.message);
      alert("❌ Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {/* ── LEFT: Input form ── */}
      <div style={{ flex: "0 0 380px", minWidth: 320 }}>
        <Card>
          <SectionLabel color={T.green}>Student Identity</SectionLabel>
          <Row gap={12}>
            <Col>
              <Input label="Admission Number" value={admNo} onChange={setAdmNo}
                     type="text" required hint="Must match admNo in Students sheet" />
            </Col>
            <Col>
              <Input label="Age (years)" value={age} onChange={setAge}
                     min={2} max={25} hint="Used for age suitability score" />
            </Col>
          </Row>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: T.slate, display: "block", marginBottom: 3 }}>
              Requested Class <span style={{ color: T.red }}>*</span>
            </label>
            <select value={reqClass} onChange={e => setReqClass(e.target.value)} style={{
              width: "100%", padding: "6px 10px", borderRadius: 5, border: `1px solid ${T.border}`,
              fontSize: 13, color: T.text, background: T.white, fontFamily: "inherit"
            }}>
              {PLACEMENT_CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <SectionLabel color={T.greenMid}>Academic Scores (0–100 each)</SectionLabel>
          <Row gap={12}>
            <Col><Input label="English"         value={english} onChange={setEnglish} min={0} max={100} /></Col>
            <Col><Input label="Mathematics"     value={math}    onChange={setMath}    min={0} max={100} /></Col>
          </Row>
          <Row gap={12}>
            <Col><Input label="Arabic"          value={arabic}  onChange={setArabic}  min={0} max={100} /></Col>
            <Col><Input label="General Knowledge" value={genKnow} onChange={setGenKnow} min={0} max={100} /></Col>
          </Row>
          <div style={{
            background: T.greenLight, borderRadius: 6, padding: "6px 12px",
            fontSize: 12, fontWeight: 700, color: T.greenMid
          }}>
            Academic Average: {academic}%
          </div>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <SectionLabel color="#6C3483">Developmental Readiness (1–5 each)</SectionLabel>
          {DEV_ITEMS.map((item, i) => (
            <ScoreInput15 key={item} label={item} value={dev[i]}
              onChange={v => { const n = [...dev]; n[i] = v; setDev(n); }} />
          ))}
        </Card>

        <Card style={{ marginTop: 14 }}>
          <SectionLabel color={T.green}>Behaviour (1–5 each)</SectionLabel>
          {BEH_ITEMS.map((item, i) => (
            <ScoreInput15 key={item} label={item} value={beh[i]}
              onChange={v => { const n = [...beh]; n[i] = v; setBeh(n); }} />
          ))}
        </Card>

        <button onClick={handleCompute} style={{
          marginTop: 16, width: "100%", padding: "12px 0", borderRadius: 7,
          background: T.green, color: T.white, fontWeight: 700, fontSize: 15,
          border: "none", cursor: "pointer", letterSpacing: 0.5
        }}>
          Calculate TPS & Placement Decision →
        </button>
      </div>

      {/* ── RIGHT: Results ── */}
      <div style={{ flex: 1, minWidth: 280 }}>
        {/* Live preview */}
        <Card>
          <SectionLabel color={T.slate}>Live Preview</SectionLabel>
          <Row gap={12}>
            <Col>
              <DecisionBox score={tps} decision={dec.text} label="TPS Score" color={dec.color} />
            </Col>
            <Col flex="0 0 auto">
              <div style={{ padding: "12px 0" }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>Risk Level</div>
                <RiskBadge level={dec.risk} />
                <div style={{ marginTop: 12, fontSize: 11, color: T.muted }}>Age Score</div>
                <div style={{ fontWeight: 700, fontSize: 20, color: T.amber }}>{ageScore}</div>
              </div>
            </Col>
          </Row>

          {/* Score breakdown bar */}
          <div style={{ marginTop: 14 }}>
            <SectionLabel color={T.muted}>Score Breakdown</SectionLabel>
            {[
              { label: "Academic (40%)",     val: academic,                          color: T.greenMid },
              { label: "Development (30%)",  val: dev.reduce((a,b)=>a+b,0)/dev.length*20, color: "#6C3483" },
              { label: "Behaviour (10%)",    val: beh.reduce((a,b)=>a+b,0)/beh.length*25, color: T.green },
              { label: "Age Score (20%)",    val: ageScore,                          color: T.amber },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                  <span style={{ color: T.slate }}>{label}</span>
                  <span style={{ fontWeight: 700, color }}>{val.toFixed(1)}</span>
                </div>
                <div style={{ background: T.bg, borderRadius: 3, height: 7, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(val, 100)}%`, height: "100%", background: color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Confirmed result */}
        {computed && (
          <Card style={{ marginTop: 14 }}>
            <SectionLabel color={T.greenMid}>Confirmed Assessment Result</SectionLabel>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              {[
                ["Admission Number", computed.admNo],
                ["Requested Class", computed.reqClass],
                ["Age",           computed.age + " yrs"],
                ["Academic Avg",  computed.academic + "%"],
                ["Age Score",     computed.ageScore],
                ["TPS",           computed.tps],
                ["Risk Level",    <RiskBadge level={computed.dec.risk} />],
                ["Decision",      computed.dec.text],
                ["Assessed At",   computed.timestamp],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "5px 8px", color: T.muted, fontWeight: 600, width: "40%" }}>{k}</td>
                  <td style={{ padding: "5px 8px", color: T.text }}>{v}</td>
                </tr>
              ))}
            </table>
            <button onClick={handleSave} disabled={saving} style={{
              marginTop: 12, width: "100%", padding: "9px 0", borderRadius: 6,
              background: saving ? T.muted : T.greenMid, color: T.white, fontWeight: 700, fontSize: 13,
              border: "none", cursor: saving ? "default" : "pointer"
            }}>
              {saving ? "Saving to FSS Database…" : "💾 Save to FSS Database"}
            </button>
            {saveError && (
              <div style={{ marginTop: 8, fontSize: 11, color: T.red, textAlign: "center" }}>
                ⚠ {saveError}
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 11, color: T.muted, textAlign: "center" }}>
              Saves directly into PLACEMENT_ASSESSMENT. Then use the FSS Sheets menu to generate the PDF report.
            </div>
          </Card>
        )}

        {/* Log */}
        {saved.length > 0 && (
          <Card style={{ marginTop: 14 }}>
            <SectionLabel color={T.slate}>Session Log ({saved.length})</SectionLabel>
            {saved.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12
              }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{s.serverName || s.admNo}</span>
                  <span style={{ color: T.muted, marginLeft: 8 }}>{s.reqClass}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: s.dec.color }}>{s.tps}</span>
                  <RiskBadge level={s.dec.risk} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════
// PROMOTION TAB
// ════════════════════════════════════════════════════════════════
function computeFPS(ca, exam, present, total, beh, dev, teacher) {
  const academic = +((ca * 0.3) + (exam * 0.7)).toFixed(1);
  const att      = total > 0 ? +((present / total) * 100).toFixed(1) : 0;
  const behScore = beh * 20;
  const fps      = +((academic * 0.5) + (att * 0.15) + (behScore * 0.15) + (dev * 0.1) + (teacher * 0.1)).toFixed(1);
  return { academic, att, behScore, fps };
}

function promotionDecision(fps, academic, att) {
  const critFail = academic < 40 || att < 60;
  if (critFail) return { text: "🚫 REPEAT — Critical Fail Override", color: T.red, flag: true };
  if (fps >= 70) return { text: "✅ PROMOTE",                         color: T.greenMid, flag: false };
  if (fps >= 60) return { text: "⚠ CONDITIONAL PROMOTE",             color: T.amber,    flag: false };
  if (fps >= 50) return { text: "🔵 SUPPORT REQUIRED",               color: T.green,    flag: false };
  return            { text: "🔴 REPEAT CLASS",                       color: T.red,      flag: false };
}

function PromotionTab() {
  const [admNo,    setAdmNo]     = useState("");
  const [ca,       setCa]        = useState(60);
  const [exam,     setExam]      = useState(60);
  const [present,  setPresent]   = useState(170);
  const [total,    setTotal]     = useState(190);
  const [beh,      setBeh]       = useState(3);
  const [dev,      setDev]       = useState(60);
  const [teacher,  setTeacher]   = useState(70);
  const [computed, setComputed]  = useState(null);
  const [saved,    setSaved]     = useState([]);
  const [saving,   setSaving]    = useState(false);
  const [saveError,setSaveError] = useState(null);
  const [promoteAfterSave, setPromoteAfterSave] = useState(true);

  const { academic, att, behScore, fps } = computeFPS(+ca, +exam, +present, +total, +beh, +dev, +teacher);
  const dec = promotionDecision(fps, academic, att);

  const handleCompute = () => {
    if (!admNo) { alert("Enter the student's Admission Number first."); return; }
    setSaveError(null);
    setComputed({ admNo, ca, exam, present, total, beh, dev, teacher,
                  academic, att, behScore, fps, dec, timestamp: new Date().toLocaleString() });
  };

  const handleSave = async () => {
    if (!computed) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await fssPost("savePromotion", {
        record: {
          admNo: computed.admNo,
          ca: computed.ca, exam: computed.exam,
          daysPresent: computed.present, totalDays: computed.total,
          behRating: computed.beh, devGrowth: computed.dev, teacherEval: computed.teacher,
          assessedBy: "",
        },
      });

      let promoMsg = "";
      if (promoteAfterSave && result.decision === "PROMOTE") {
        try {
          const promo = await fssPost("promoteClass", { admNo: computed.admNo });
          promoMsg = promo.ok
            ? `\n\nClass updated: ${promo.from} → ${promo.to}`
            : `\n\n⚠ Class NOT updated: ${promo.error}`;
        } catch (pErr) {
          promoMsg = `\n\n⚠ Class update failed: ${pErr.message}`;
        }
      }

      setSaved(prev => [{ ...computed, serverName: result.name }, ...prev]);
      alert(`✅ Saved to FSS Database.\n\nStudent: ${result.name || computed.admNo}\nFPS: ${result.fps}\nDecision: ${result.decision}${promoMsg}`);
    } catch (err) {
      setSaveError(err.message);
      alert("❌ Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {/* ── LEFT ── */}
      <div style={{ flex: "0 0 380px", minWidth: 320 }}>
        <Card>
          <SectionLabel color={T.green}>Student Identity</SectionLabel>
          <Input label="Admission Number" value={admNo} onChange={setAdmNo}
                 type="text" required hint="Must match admNo in Students sheet" />
        </Card>

        <Card style={{ marginTop: 14 }}>
          <SectionLabel color={T.greenMid}>Academic Scores (0–100)</SectionLabel>
          <Row gap={12}>
            <Col><Input label="CA Score (30%)"   value={ca}   onChange={setCa}   min={0} max={100} /></Col>
            <Col><Input label="Exam Score (70%)"  value={exam} onChange={setExam} min={0} max={100} /></Col>
          </Row>
          <div style={{ background: T.greenLight, borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: T.greenMid }}>
            Academic Score: {academic}%
            {academic < 40 && <span style={{ color: T.red, marginLeft: 8 }}>⚠ CRITICAL FAIL THRESHOLD</span>}
          </div>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <SectionLabel color={T.green}>Attendance</SectionLabel>
          <Row gap={12}>
            <Col><Input label="Days Present" value={present} onChange={setPresent} min={0} max={300} /></Col>
            <Col><Input label="Total School Days" value={total} onChange={setTotal} min={1} max={300} /></Col>
          </Row>
          <div style={{
            background: att < 60 ? T.redLight : T.greenLight,
            borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 700,
            color: att < 60 ? T.red : T.greenMid
          }}>
            Attendance: {att}%
            {att < 60 && <span style={{ marginLeft: 8 }}>⚠ CRITICAL FAIL THRESHOLD</span>}
          </div>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <SectionLabel color="#6C3483">Behaviour Rating</SectionLabel>
          <ScoreInput15 label="Overall Behaviour (1–5)" value={+beh} onChange={setBeh} />
          <div style={{ background: T.blueLight, borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: T.green }}>
            Behaviour Score: {behScore}
          </div>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <SectionLabel color={T.amber}>Teacher Assessment</SectionLabel>
          <Row gap={12}>
            <Col><Input label="Developmental Growth (0–100)" value={dev} onChange={setDev} min={0} max={100} hint="Improvement over session" /></Col>
            <Col><Input label="Teacher Evaluation (0–100)"   value={teacher} onChange={setTeacher} min={0} max={100} /></Col>
          </Row>
        </Card>

        <button onClick={handleCompute} style={{
          marginTop: 16, width: "100%", padding: "12px 0", borderRadius: 7,
          background: T.green, color: T.white, fontWeight: 700, fontSize: 15,
          border: "none", cursor: "pointer"
        }}>
          Calculate FPS & Promotion Decision →
        </button>
      </div>

      {/* ── RIGHT ── */}
      <div style={{ flex: 1, minWidth: 280 }}>
        <Card>
          <SectionLabel color={T.slate}>Live Preview</SectionLabel>
          <DecisionBox score={fps} decision={dec.text} label="FPS Score" color={dec.color} />

          {dec.flag && (
            <div style={{
              marginTop: 12, background: T.redLight, border: `1px solid ${T.red}`,
              borderRadius: 6, padding: "10px 14px", fontSize: 12, color: T.red, fontWeight: 600
            }}>
              ⚠ Critical Fail Override active. Academic score below 40% or attendance below 60%.
              Parent Override Form required if parent disputes this decision.
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <SectionLabel color={T.muted}>Score Breakdown</SectionLabel>
            {[
              { label: "Academic (50%)",      val: academic,  color: T.greenMid, weight: 0.5 },
              { label: "Attendance (15%)",    val: att,       color: T.green,    weight: 0.15 },
              { label: "Behaviour (15%)",     val: behScore,  color: "#6C3483",  weight: 0.15 },
              { label: "Dev Growth (10%)",    val: +dev,      color: T.amber,    weight: 0.1 },
              { label: "Teacher Eval (10%)",  val: +teacher,  color: T.slate,    weight: 0.1 },
            ].map(({ label, val, color, weight }) => {
              const contribution = (val * weight).toFixed(1);
              return (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                    <span style={{ color: T.slate }}>{label}</span>
                    <span style={{ fontWeight: 700, color }}>
                      {val.toFixed(1)} → <span style={{ color: T.green }}>+{contribution}</span>
                    </span>
                  </div>
                  <div style={{ background: T.bg, borderRadius: 3, height: 7 }}>
                    <div style={{ width: `${Math.min(val, 100)}%`, height: "100%", background: color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {computed && (
          <Card style={{ marginTop: 14 }}>
            <SectionLabel color={T.greenMid}>Confirmed Promotion Result</SectionLabel>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              {[
                ["Admission Number",   computed.admNo],
                ["Academic Score",     computed.academic + "%"],
                ["Attendance",         computed.att + "%"],
                ["Behaviour Score",    computed.behScore],
                ["Dev Growth",         computed.dev],
                ["Teacher Eval",       computed.teacher],
                ["FPS",                computed.fps],
                ["Decision",           computed.dec.text],
                ["Critical Fail?",     computed.dec.flag ? "🚫 YES — Auto Repeat" : "✅ No"],
                ["Parent Override?",   computed.dec.text.includes("REPEAT") ? "Required" : "Not needed"],
                ["Time",               computed.timestamp],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "5px 8px", color: T.muted, fontWeight: 600, width: "40%" }}>{k}</td>
                  <td style={{ padding: "5px 8px", color: T.text }}>{v}</td>
                </tr>
              ))}
            </table>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.slate, margin: "10px 0" }}>
              <input type="checkbox" checked={promoteAfterSave}
                     onChange={e => setPromoteAfterSave(e.target.checked)} />
              Auto-advance class in Students sheet if decision is PROMOTE
            </label>

            <button onClick={handleSave} disabled={saving} style={{
              width: "100%", padding: "9px 0", borderRadius: 6,
              background: saving ? T.muted : T.greenMid, color: T.white, fontWeight: 700, fontSize: 13,
              border: "none", cursor: saving ? "default" : "pointer"
            }}>
              {saving ? "Saving to FSS Database…" : "💾 Save to FSS Database"}
            </button>
            {saveError && (
              <div style={{ marginTop: 8, fontSize: 11, color: T.red, textAlign: "center" }}>
                ⚠ {saveError}
              </div>
            )}
            <div style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 6 }}>
              Saves directly into PROMOTION_ASSESSMENT. Then use the FSS Sheets menu to generate the PDF report.
            </div>
          </Card>
        )}

        {saved.length > 0 && (
          <Card style={{ marginTop: 14 }}>
            <SectionLabel color={T.slate}>Session Log ({saved.length})</SectionLabel>
            {saved.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "6px 0",
                borderBottom: `1px solid ${T.border}`, fontSize: 12
              }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{s.serverName || s.admNo}</span>
                  <span style={{ color: T.muted, marginLeft: 8 }}>FPS: {s.fps}</span>
                </div>
                <span style={{ fontWeight: 700, color: s.dec.color, fontSize: 11 }}>
                  {s.dec.text.replace(/[✅⚠🔵🔴🚫]/g, "").trim()}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════
// ROOT COMPONENT — drop into your existing FSS app nav
// ════════════════════════════════════════════════════════════════
export default function PlacementPromotionModule() {
  const [tab, setTab] = useState("placement");

  const tabs = [
    { id: "placement", label: "📋 Placement Assessment",  desc: "New students" },
    { id: "promotion", label: "🎓 Promotion Assessment",  desc: "End of session" },
  ];

  return (
    <div style={{ fontFamily: "system-ui, Arial, sans-serif", background: T.bg, minHeight: "100vh", padding: 0 }}>
      {/* Module Header */}
      <div style={{ background: T.slate, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ color: T.white, fontWeight: 800, fontSize: 16, letterSpacing: 0.3 }}>
            FSS — Placement & Promotion System
          </div>
          <div style={{ color: "#A9CCE3", fontSize: 11, marginTop: 2 }}>
            Focus Islamic & Western School · Kaduna
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: T.white, borderBottom: `2px solid ${T.border}`, display: "flex", padding: "0 24px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "12px 20px", border: "none", background: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 13, color: tab === t.id ? T.green : T.muted,
            borderBottom: tab === t.id ? `3px solid ${T.green}` : "3px solid transparent",
            marginBottom: -2, transition: "all 0.15s"
          }}>
            {t.label}
            <span style={{ fontWeight: 400, fontSize: 10, color: T.muted, marginLeft: 6 }}>
              {t.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Decision guide strip */}
      <div style={{
        background: T.white, borderBottom: `1px solid ${T.border}`,
        padding: "8px 24px", display: "flex", gap: 24, flexWrap: "wrap"
      }}>
        {tab === "placement" ? (
          <>
            <span style={{ fontSize: 11, color: T.greenMid }}>🟢 85–100 → Full Placement</span>
            <span style={{ fontSize: 11, color: T.amber   }}>🟡 70–84 → With Support</span>
            <span style={{ fontSize: 11, color: T.amber   }}>🟡 50–69 → Lower Class</span>
            <span style={{ fontSize: 11, color: T.red     }}>🔴 &lt;50 → Strongly Lower Class</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 11, color: T.greenMid }}>✅ 70–100 → Promote</span>
            <span style={{ fontSize: 11, color: T.amber   }}>⚠ 60–69 → Conditional</span>
            <span style={{ fontSize: 11, color: T.green   }}>🔵 50–59 → Support Required</span>
            <span style={{ fontSize: 11, color: T.red     }}>🔴 &lt;50 → Repeat · Critical Fail: Acad &lt;40% or Att &lt;60%</span>
          </>
        )}
      </div>

      {/* Tab content */}
      <div style={{ padding: 20 }}>
        {tab === "placement" ? <PlacementTab /> : <PromotionTab />}
      </div>
    </div>
  );
}
