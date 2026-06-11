import { useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { NAVY, CONV_NAME, CONV_CLASSES, ISL_LEVELS, ROLES, DEPTS } from "../data/constants";
import { useApp } from "../context/AppContext";
import { Card, FilterBar, TabBar, Lbl, ib, TH, TD, EmptyRow, StatusBadge, Btn, InfoBox } from "../components/shared";
import Modal, { ConfirmModal } from "../components/Modal";
import { naira } from "../utils/helpers";

export default function Manage() {
  const [tab, setTab] = useState("students");

  return (
    <>
      <TabBar
        tabs={[
          { id:"students", label:"Students" },
          { id:"staff",    label:"Staff" },
          { id:"settings", label:"Settings" },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === "students" && <ManageStudents />}
      {tab === "staff"    && <ManageStaff />}
      {tab === "settings" && <ManageSettings />}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MANAGE STUDENTS
════════════════════════════════════════════════════════════════════════ */
const BLANK_STUDENT = (yr) => ({
  admNo: `FS/${String(yr).slice(2)}/`, name:"", gender:"F",
  conv:"", isl:"", status:"Active", year:yr,
});

function ManageStudents() {
  const { students, saveStudent, deleteStudent } = useApp();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);  // { mode: "add" | "edit", origId? }
  const [form, setForm] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = students.filter(s =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.admNo.toLowerCase().includes(q.toLowerCase())
  );

  const openAdd = () => {
    setForm(BLANK_STUDENT(new Date().getFullYear()));
    setModal({ mode:"add" });
  };
  const openEdit = (s) => {
    setForm({ ...s, conv: s.conv || "", isl: s.isl || "" });
    setModal({ mode:"edit", origId: s.admNo });
  };
  const close = () => { setModal(null); setForm({}); };

  const save = () => {
    if (!form.name || !form.admNo) return;
    const student = {
      admNo: form.admNo, name: form.name, gender: form.gender,
      conv: form.conv || null, isl: form.isl || null,
      status: form.status, year: Number(form.year),
    };
    saveStudent(modal.mode, student, modal.origId);
    close();
  };

  return (
    <>
      <FilterBar>
        <div style={{ flex:1, position:"relative" }}>
          <Search size={13} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or admission number…" style={{ ...ib, paddingLeft:28 }} />
        </div>
        <Btn icon={Plus} onClick={openAdd}>Add Student</Btn>
      </FilterBar>

      <InfoBox type="warning">
        Editing admission numbers updates the live system immediately. Total students: <strong>{students.length}</strong> ({students.filter(s=>s.status==="Active").length} active).
      </InfoBox>

      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:NAVY }}>
              <TH>#</TH><TH left>ADM. NO.</TH><TH left>NAME</TH><TH>G</TH>
              <TH left>CONV. CLASS</TH><TH left>ISL. LEVEL</TH><TH>STATUS</TH><TH>YR</TH><TH>ACTIONS</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <EmptyRow cols={9} message="No students match." />}
            {filtered.slice(0, 100).map((s, i) => (
              <tr key={s.admNo} style={{ background: i%2===0?"#fff":"#f8fafc" }}>
                <TD muted center>{i+1}</TD>
                <TD mono>{s.admNo}</TD>
                <TD bold>{s.name}</TD>
                <TD center>
                  <span style={{ background: s.gender==="M"?"#dbeafe":"#fce7f3", color: s.gender==="M"?"#1d4ed8":"#be185d", fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:20 }}>{s.gender}</span>
                </TD>
                <TD>{s.conv ? <span style={{ background:NAVY, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 7px", borderRadius:20 }}>{s.conv}</span> : <span style={{ color:"#cbd5e1" }}>—</span>}</TD>
                <TD>{s.isl ? <span style={{ fontSize:9, color:"#0f766e", fontWeight:600 }}>{s.isl}</span> : <span style={{ color:"#cbd5e1" }}>—</span>}</TD>
                <TD center><StatusBadge status={s.status} /></TD>
                <TD muted center>{s.year}</TD>
                <TD center>
                  <div style={{ display:"flex", gap:5, justifyContent:"center" }}>
                    <button onClick={() => openEdit(s)} style={{ background:"#dbeafe", border:"none", borderRadius:6, padding:"4px 8px", cursor:"pointer", color:"#1d4ed8" }}><Edit2 size={12} /></button>
                    <button onClick={() => setConfirmDel({ id:s.admNo, name:`${s.admNo} — ${s.name}` })} style={{ background:"#fee2e2", border:"none", borderRadius:6, padding:"4px 8px", cursor:"pointer", color:"#dc2626" }}><Trash2 size={12} /></button>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <div style={{ padding:"9px 14px", background:"#fffbe6", textAlign:"center", fontSize:11, color:"#b45309" }}>
            Showing first 100 of {filtered.length}. Refine search to see more.
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={`${modal.mode === "add" ? "Add New" : "Edit"} Student`} onClose={close} onSave={save} saveLabel={modal.mode === "add" ? "Add to System" : "Save Changes"}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}><Lbl c="ADMISSION NUMBER *" />
              <input value={form.admNo || ""} onChange={e => setForm(f => ({ ...f, admNo: e.target.value }))} placeholder="FS/26/XXX" style={ib} />
            </div>
            <div style={{ gridColumn:"1/-1" }}><Lbl c="FULL NAME *" />
              <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" style={ib} />
            </div>
            <div><Lbl c="GENDER" />
              <select value={form.gender || "F"} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} style={ib}>
                <option value="M">Male</option><option value="F">Female</option>
              </select>
            </div>
            <div><Lbl c="STATUS" />
              <select value={form.status || "Active"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={ib}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div><Lbl c="CONVENTIONAL CLASS" />
              <select value={form.conv || ""} onChange={e => setForm(f => ({ ...f, conv: e.target.value }))} style={ib}>
                <option value="">— None / Islamiyyah only —</option>
                {CONV_CLASSES.map(c => <option key={c} value={c}>{CONV_NAME[c]}</option>)}
              </select>
            </div>
            <div><Lbl c="ISLAMIYYAH LEVEL" />
              <select value={form.isl || ""} onChange={e => setForm(f => ({ ...f, isl: e.target.value }))} style={ib}>
                <option value="">— None / Conventional only —</option>
                {ISL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div><Lbl c="YEAR ENROLLED" />
              <input type="number" value={form.year || ""} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} style={ib} />
            </div>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <ConfirmModal
          message={confirmDel.name}
          onClose={() => setConfirmDel(null)}
          onConfirm={() => { deleteStudent(confirmDel.id); setConfirmDel(null); }}
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MANAGE STAFF
════════════════════════════════════════════════════════════════════════ */
const BLANK_STAFF = (n) => ({
  id: `FSS/ST/${String(n).padStart(3,"0")}`, name:"", gender:"F",
  role:"Teacher", dept:"Conventional", status:"Active", year: new Date().getFullYear(),
});

function ManageStaff() {
  const { staffList, saveStaff, deleteStaff } = useApp();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = staffList.filter(s =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase())
  );

  const openAdd = () => { setForm(BLANK_STAFF(staffList.length + 1)); setModal({ mode:"add" }); };
  const openEdit = (s) => { setForm({ ...s }); setModal({ mode:"edit", origId: s.id }); };
  const close = () => { setModal(null); setForm({}); };

  const save = () => {
    if (!form.name || !form.id) return;
    saveStaff(modal.mode, { ...form, year: Number(form.year) }, modal.origId);
    close();
  };

  return (
    <>
      <FilterBar>
        <div style={{ flex:1, position:"relative" }}>
          <Search size={13} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search staff by name or ID…" style={{ ...ib, paddingLeft:28 }} />
        </div>
        <Btn color="#4b2e83" icon={Plus} onClick={openAdd}>Add Staff</Btn>
      </FilterBar>

      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#4b2e83" }}>
              <TH>#</TH><TH left>STAFF ID</TH><TH left>FULL NAME</TH><TH>G</TH>
              <TH left>ROLE</TH><TH left>DEPT/SECTION</TH><TH>STATUS</TH><TH>YR</TH><TH>ACTIONS</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <EmptyRow cols={9} message="No staff match." />}
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ background: i%2===0?"#fff":"#f8fafc" }}>
                <TD muted center>{i+1}</TD>
                <TD mono>{s.id}</TD>
                <TD bold>{s.name}</TD>
                <TD center>
                  <span style={{ background: s.gender==="M"?"#dbeafe":"#fce7f3", color: s.gender==="M"?"#1d4ed8":"#be185d", fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:20 }}>{s.gender}</span>
                </TD>
                <TD>{s.role}</TD>
                <TD muted>{s.dept}</TD>
                <TD center><StatusBadge status={s.status} /></TD>
                <TD muted center>{s.year}</TD>
                <TD center>
                  <div style={{ display:"flex", gap:5, justifyContent:"center" }}>
                    <button onClick={() => openEdit(s)} style={{ background:"#ede9fe", border:"none", borderRadius:6, padding:"4px 8px", cursor:"pointer", color:"#4b2e83" }}><Edit2 size={12} /></button>
                    <button onClick={() => setConfirmDel({ id:s.id, name:`${s.id} — ${s.name}` })} style={{ background:"#fee2e2", border:"none", borderRadius:6, padding:"4px 8px", cursor:"pointer", color:"#dc2626" }}><Trash2 size={12} /></button>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {modal && (
        <Modal title={`${modal.mode === "add" ? "Add New" : "Edit"} Staff Member`} onClose={close} onSave={save} saveLabel={modal.mode === "add" ? "Add to System" : "Save Changes"}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><Lbl c="STAFF ID *" />
              <input value={form.id || ""} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} placeholder="FSS/ST/001" style={ib} />
            </div>
            <div style={{ gridColumn:"1/-1" }}><Lbl c="FULL NAME *" />
              <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" style={ib} />
            </div>
            <div><Lbl c="GENDER" />
              <select value={form.gender || "F"} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} style={ib}>
                <option value="M">Male</option><option value="F">Female</option>
              </select>
            </div>
            <div><Lbl c="STATUS" />
              <select value={form.status || "Active"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={ib}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div><Lbl c="ROLE" />
              <select value={form.role || "Teacher"} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={ib}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div><Lbl c="DEPARTMENT / SECTION" />
              <select value={form.dept || "Conventional"} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} style={ib}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><Lbl c="YEAR EMPLOYED" />
              <input type="number" value={form.year || ""} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} style={ib} />
            </div>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <ConfirmModal
          message={confirmDel.name}
          onClose={() => setConfirmDel(null)}
          onConfirm={() => { deleteStaff(confirmDel.id); setConfirmDel(null); }}
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MANAGE SETTINGS
════════════════════════════════════════════════════════════════════════ */
function ManageSettings() {
  const { settings, saveSettings } = useApp();
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);

  const setRate = (cls, val) => {
    setLocal(prev => ({ ...prev, feeRates: { ...prev.feeRates, [cls]: Number(val) || 0 } }));
    setSaved(false);
  };

  const apply = () => { saveSettings(local); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <>
      <Card style={{ padding:16 }}>
        <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:12 }}>Session Settings</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div><Lbl c="ACTIVE SESSION" />
            <input value={local.session} onChange={e => { setLocal(p => ({ ...p, session: e.target.value })); setSaved(false); }} style={ib} />
          </div>
        </div>
      </Card>

      <Card style={{ padding:16 }}>
        <div style={{ fontWeight:700, color:"#0f172a", fontSize:12, marginBottom:12 }}>Fee Rates per Class (₦ per term)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {CONV_CLASSES.map(c => (
            <div key={c} style={{ padding:"10px 12px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#475569", marginBottom:4 }}>{CONV_NAME[c]}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:12, color:"#94a3b8" }}>₦</span>
                <input type="number" value={local.feeRates[c] || ""} onChange={e => setRate(c, e.target.value)}
                  style={{ ...ib, padding:"6px 8px", fontSize:12, fontWeight:700 }} />
              </div>
            </div>
          ))}
        </div>
        <InfoBox type="warning"><span style={{ marginTop:10, display:"block" }}>Click Save below to apply rate changes — they cascade to the Fees module immediately.</span></InfoBox>
      </Card>

      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:12 }}>
        {saved && <span style={{ color:"#16a34a", fontSize:11, fontWeight:700 }}>✓ Settings saved</span>}
        <Btn onClick={apply}>Save Settings</Btn>
      </div>
    </>
  );
}
