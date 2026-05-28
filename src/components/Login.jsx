import { useState } from "react";
import { Package } from "lucide-react";
import { btn, lbl, inp } from "../utils/styles.js";

export function Login({ onLogin }) {
  const [email, setEmail] = useState("manager@ecomeal.app");
  const [pw, setPw] = useState("demo1234");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");

  const submit = () => {
    if (!email.includes("@") || pw.length < 4) {
      setErr("Enter a valid email and password (min 4 chars).");
      return;
    }
    if (remember) localStorage.setItem("ecomeal_user", JSON.stringify({ email }));
    else localStorage.removeItem("ecomeal_user");
    onLogin({ email, remember });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm p-7 rounded-2xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)" }} className="flex items-center justify-center">
            <Package size={18} color="#0d1117" />
          </div>
          <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 18 }}>Ecomeal</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>Restaurant operations console</p>

        <label htmlFor="login-email" style={lbl}>Email</label>
        <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <label htmlFor="login-password" style={lbl}>Password</label>
        <input id="login-password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={inp} onKeyDown={(e) => e.key === "Enter" && submit()} />

        <label className="flex items-center gap-2 my-3" style={{ color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Keep me signed in (works offline)
        </label>

        {err && <p style={{ color: "var(--crit)", fontSize: 12, marginBottom: 10 }}>{err}</p>}
        <button onClick={submit} style={{ ...btn("var(--accent)"), width: "100%", padding: 11 }}>Sign in</button>
      </div>
    </div>
  );
}
