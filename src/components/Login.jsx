import { useState } from "react";
import { GraduationCap, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { NAVY, GOLD } from "../data/constants";

// ── API CONFIG ───────────────────────────────────────────────────
// Same Web App URL used everywhere else in the app.
const FSS_API_URL = "https://script.google.com/macros/s/AKfycbyNHMVob57d4evCaHYrBL3woPxQEi_LZ_E7hB7HdPnzKYYWG9OtbMOYOx-TIxOrGeL5/exec";

async function fssPost(action, payload) {
  const res = await fetch(FSS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Unknown server error");
  return json.data;
}

const PinInput = ({ value, onChange, autoFocus }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        autoFocus={autoFocus}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="••••"
        style={{
          width: "100%", padding: "11px 40px 11px 40px", borderRadius: 8,
          border: "1.5px solid #d5d8dc", fontSize: 16, letterSpacing: 4,
          boxSizing: "border-box", outline: "none", fontFamily: "inherit",
        }}
      />
      <Lock size={16} style={{ position: "absolute", left: 13, top: 14, color: "#94a3b8" }} />
      <button type="button" onClick={() => setShow(s => !s)} style={{
        position: "absolute", right: 10, top: 10, background: "none", border: "none",
        cursor: "pointer", color: "#94a3b8", padding: 4,
      }}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

export default function Login({ onLogin }) {
  const [email, setEmail]   = useState("");
  const [pin, setPin]       = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [stage, setStage]   = useState("email"); // email -> pin | setup -> done
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Attempt a login with a blank pin to discover account state.
      // Backend returns needsPinSetup:true if this is a first login.
      const result = await fssPostRaw("login", { email: email.trim().toLowerCase(), pin: "__probe__" });
      if (result.needsPinSetup) {
        setStage("setup");
      } else {
        setStage("pin");
      }
    } catch (err) {
      // "Incorrect PIN" still means the account exists with a PIN already set
      if (String(err.message).toLowerCase().includes("incorrect pin")) {
        setStage("pin");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e) => {
    e.preventDefault();
    if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await fssPost("login", { email: email.trim().toLowerCase(), pin });
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSetup = async (e) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 6) { setError("PIN must be 4–6 digits."); return; }
    if (pin !== confirmPin) { setError("PINs do not match."); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await fssPost("setPin", { email: email.trim().toLowerCase(), pin });
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg, ${NAVY} 0%, #0f2742 100%)`,
      fontFamily: "system-ui, sans-serif", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 380, background: "#fff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "32px 32px 24px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: GOLD, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GraduationCap size={26} color={NAVY} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: NAVY }}>Focus Islamic &amp; Western School</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>School Management System</div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px 32px" }}>

          {stage === "email" && (
            <form onSubmit={handleEmailSubmit}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Staff Email
              </label>
              <div style={{ position: "relative", marginBottom: 18 }}>
                <input
                  type="email" autoFocus required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@fss.edu.ng"
                  style={{
                    width: "100%", padding: "11px 14px 11px 40px", borderRadius: 8,
                    border: "1.5px solid #d5d8dc", fontSize: 14, boxSizing: "border-box",
                    outline: "none", fontFamily: "inherit",
                  }}
                />
                <Mail size={16} style={{ position: "absolute", left: 13, top: 14, color: "#94a3b8" }} />
              </div>
              {error && <ErrorMsg text={error} />}
              <SubmitButton loading={loading} text="Continue" />
            </form>
          )}

          {stage === "pin" && (
            <form onSubmit={handlePinLogin}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
                Signed in as <strong style={{ color: NAVY }}>{email}</strong>
                <button type="button" onClick={() => { setStage("email"); setPin(""); setError(null); }}
                  style={{ marginLeft: 8, background: "none", border: "none", color: GOLD, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                  Change
                </button>
              </div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Enter your PIN
              </label>
              <div style={{ marginBottom: 18 }}>
                <PinInput value={pin} onChange={setPin} autoFocus />
              </div>
              {error && <ErrorMsg text={error} />}
              <SubmitButton loading={loading} text="Log In" />
            </form>
          )}

          {stage === "setup" && (
            <form onSubmit={handlePinSetup}>
              <div style={{
                background: "#FDEBD0", borderRadius: 8, padding: "10px 12px",
                fontSize: 12, color: "#9C5700", marginBottom: 16, fontWeight: 600,
              }}>
                First time logging in. Choose a 4–6 digit PIN — you'll use it every time you sign in.
              </div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Choose a PIN
              </label>
              <div style={{ marginBottom: 14 }}>
                <PinInput value={pin} onChange={setPin} autoFocus />
              </div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Confirm PIN
              </label>
              <div style={{ marginBottom: 18 }}>
                <PinInput value={confirmPin} onChange={setConfirmPin} />
              </div>
              {error && <ErrorMsg text={error} />}
              <SubmitButton loading={loading} text="Set PIN & Continue" />
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

function ErrorMsg({ text }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#C0392B",
      background: "#FADBD8", borderRadius: 7, padding: "8px 10px", marginBottom: 14,
    }}>
      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{text}</span>
    </div>
  );
}

function SubmitButton({ loading, text }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
      background: loading ? "#94a3b8" : NAVY, color: "#fff", fontWeight: 700, fontSize: 14,
      cursor: loading ? "default" : "pointer", transition: "background .15s",
    }}>
      {loading ? "Please wait…" : text}
    </button>
  );
}

// Raw post that doesn't throw on a "needs setup" or "incorrect pin" response shape
async function fssPostRaw(action, payload) {
  const res = await fetch(FSS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await res.json();
  if (json.success) return json.data;
  // surface needsPinSetup flag even though success:false
  if (json.error && /first login/i.test(json.error)) {
    return { needsPinSetup: true };
  }
  throw new Error(json.error || "Unknown server error");
}
