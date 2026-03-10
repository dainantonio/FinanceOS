import { useState } from "react";
import { supabase } from "../lib/supabase";
import { C } from "../constants/colors";

const MODES = { login: "login", signup: "signup", magic: "magic" };

export default function AuthScreen() {
  const [mode, setMode]       = useState(MODES.login);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success"|"error", text }

  async function handleLogin() {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ type: "error", text: error.message });
    setLoading(false);
  }

  async function handleSignup() {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage({ type: "error", text: error.message });
    else setMessage({ type: "success", text: "Check your email to confirm your account!" });
    setLoading(false);
  }

  async function handleMagicLink() {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage({ type: "error", text: error.message });
    else setMessage({ type: "success", text: "Magic link sent! Check your email." });
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setMessage({ type: "error", text: error.message });
    setLoading(false);
  }

  function handleSubmit() {
    if (!email.trim()) { setMessage({ type: "error", text: "Please enter your email." }); return; }
    if (mode === MODES.magic) return handleMagicLink();
    if (!password.trim()) { setMessage({ type: "error", text: "Please enter your password." }); return; }
    if (mode === MODES.login) return handleLogin();
    if (mode === MODES.signup) return handleSignup();
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,229,195,0.05) 0%, transparent 70%)" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-.03em", marginBottom: 6 }}>
            Finance<span style={{ color: C.accent }}>OS</span>
          </div>
          <div style={{ fontSize: 13, color: C.sub }}>Your financial command center</div>
        </div>

        {/* Card */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
          padding: "32px 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

          {/* Mode tabs */}
          <div style={{ display: "flex", background: C.surface, borderRadius: 12,
            padding: 4, marginBottom: 28, gap: 4 }}>
            {[
              { key: MODES.login,  label: "Sign In" },
              { key: MODES.signup, label: "Sign Up" },
              { key: MODES.magic,  label: "Magic Link" },
            ].map(t => (
              <button key={t.key} onClick={() => { setMode(t.key); setMessage(null); }}
                style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none",
                  cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                  background: mode === t.key ? C.card : "none",
                  color: mode === t.key ? C.text : C.sub,
                  boxShadow: mode === t.key ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                  transition: "all .2s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button onClick={handleGoogle} disabled={loading}
            style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "12px", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 10, cursor: "pointer", marginBottom: 20,
              fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: C.text,
              transition: "border-color .2s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.sub, fontWeight: 600,
              display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="you@example.com"
              style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "12px 14px", color: C.text, fontSize: 14,
                fontFamily: "inherit", outline: "none", transition: "border-color .2s",
                boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Password field (not shown for magic link) */}
          {mode !== MODES.magic && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: C.sub, fontWeight: 600,
                display: "block", marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "12px 14px", color: C.text, fontSize: 14,
                  fontFamily: "inherit", outline: "none", transition: "border-color .2s",
                  boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          )}

          {mode === MODES.magic && (
            <div style={{ marginBottom: 20, fontSize: 12, color: C.sub, lineHeight: 1.6,
              background: C.surface, borderRadius: 10, padding: "10px 14px",
              border: `1px solid ${C.border}` }}>
              We'll send a secure login link to your email. No password needed.
            </div>
          )}

          {/* Message */}
          {message && (
            <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, fontSize: 13,
              background: message.type === "error" ? `${C.rose}15` : `${C.green}15`,
              border: `1px solid ${message.type === "error" ? C.rose + "44" : C.green + "44"}`,
              color: message.type === "error" ? C.rose : C.green }}>
              {message.text}
            </div>
          )}

          {/* Submit button */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", background: C.accent, border: "none", borderRadius: 12,
              padding: "13px", fontSize: 14, fontWeight: 700, color: "#000",
              fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity .2s" }}>
            {loading ? "Please wait..." :
              mode === MODES.login ? "Sign In" :
              mode === MODES.signup ? "Create Account" :
              "Send Magic Link"}
          </button>

          {/* Footer note */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.muted }}>
            {mode === MODES.login
              ? <>No account? <span onClick={() => setMode(MODES.signup)}
                  style={{ color: C.accent, cursor: "pointer", fontWeight: 600 }}>Sign up free</span></>
              : mode === MODES.signup
              ? <>Already have an account? <span onClick={() => setMode(MODES.login)}
                  style={{ color: C.accent, cursor: "pointer", fontWeight: 600 }}>Sign in</span></>
              : <>Remember your password? <span onClick={() => setMode(MODES.login)}
                  style={{ color: C.accent, cursor: "pointer", fontWeight: 600 }}>Sign in</span></>
            }
          </div>
        </div>

        {/* Back to landing */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>
            ← Back to home
          </a>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
}
