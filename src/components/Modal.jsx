import { X } from "lucide-react";
import { NAVY } from "../data/constants";
import { Btn } from "./shared";

export default function Modal({ title, onClose, onSave, saveLabel = "Save", children, width = 560 }) {
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:"rgba(0,0,0,.55)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div style={{
        background:"#fff", borderRadius:18,
        width:`min(${width}px, 95vw)`, maxHeight:"90vh",
        overflow:"auto", boxShadow:"0 24px 64px rgba(0,0,0,.25)",
      }}>
        {/* Header */}
        <div style={{
          background:NAVY, padding:"14px 18px",
          borderRadius:"18px 18px 0 0",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.6)" }}>
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:18 }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{
          padding:"0 18px 18px",
          display:"flex", gap:8, justifyContent:"flex-end",
        }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn onClick={onSave}>{saveLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

/** Small confirmation delete dialog */
export function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:"rgba(0,0,0,.55)", zIndex:1001,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div style={{
        background:"#fff", borderRadius:16, padding:28,
        width:340, textAlign:"center",
        boxShadow:"0 16px 48px rgba(0,0,0,.2)",
      }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:8 }}>Confirm Delete</div>
        <div style={{ color:"#64748b", fontSize:12, marginBottom:20 }}>{message}</div>
        <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn color="#dc2626" onClick={onConfirm}>Yes, Delete</Btn>
        </div>
      </div>
    </div>
  );
}
