import { useState } from "react";
import { C } from "../constants/colors";

const STEPS = ["welcome", "name", "income", "networth", "goals"];

const GOAL_OPTIONS = [
  { icon: "🛡️", name: "Emergency Fund", target: 10000 },
  { icon: "🏠", name: "House Down Payment", target: 50000 },
  { icon: "✈️", name: "Vacation Fund", target: 3000 },
  { icon: "🎓", name: "Education Fund", target: 20000 },
  { icon: "🚗", name: "New Car", target: 15000 },
  { icon: "💍", name: "Wedding Fund", target: 25000 },
  { icon: "📈", name: "Investment Account", target: 10000 },
  { icon: "🤲", name: "Giving Goal", target: 2400 },
];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep]           = useState(0);
  const [name, setName]           = useState("");
  const [income, setIncome]       = useState("");
  const [netWorth, setNetWorth]   = useState("");
  const [cash, setCash]           = useState("");
  const [selGoals, setSelGoals]   = useState([]);
  const [saving, setSaving]       = useState(false);

  const currentStep = STEPS[step];
  const progress = ((step) / (STEPS.length - 1)) * 100;

  function toggleGoal(goal) {
    setSelGoals(prev =>
      prev.find(g => g.name === goal.name)
        ? prev.filter(g => g.name !== goal.name)
        : [...prev, goal]
    );
  }

  async function handleFinish() {
    setSaving(true);
    await onComplete({
      full_name: name,
      monthly_income: parseFloat(income) || 0,
      net_worth: parseFloat(netWorth) || 0,
      cash: parseFloat(cash) || 0,
    }, selGoals);
    setSaving(false);
  }

  function canAdvance() {
    if (currentStep === "name") return name.trim().length > 0;
    if (currentStep === "income") return income.trim().length > 0;
    return true;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,229,195,0.05) 0%, transparent 70%)" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>

        {/* Progress bar */}
        {step > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ height: 3, background: C.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: C.accent,
                borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: "right" }}>
              Step {step} of {STEPS.length - 1}
            </div>
          </div>
        )}

        {/* WELCOME */}
        {currentStep === "welcome" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
            <div style={{ fontFamily: "inherit", fontSize: 32, fontWeight: 800,
              color: C.text, letterSpacing: "-.03em", marginBottom: 12 }}>
              Welcome to<br /><span style={{ color: C.accent }}>FinanceOS</span>
            </div>
            <p style={{ fontSize: 15, color: C.sub, lineHeight: 1.7, marginBottom: 36, fontWeight: 300 }}>
              Let's set up your financial command center. It only takes 2 minutes.
            </p>
            <button onClick={() => setStep(1)}
              style={{ width: "100%", background: C.accent, border: "none", borderRadius: 12,
                padding: "14px", fontSize: 15, fontWeight: 700, color: "#000",
                fontFamily: "inherit", cursor: "pointer" }}>
              Get Started →
            </button>
          </div>
        )}

        {/* NAME */}
        {currentStep === "name" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
              color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>About You</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text,
              letterSpacing: "-.02em", marginBottom: 8 }}>What's your name?</div>
            <p style={{ fontSize: 14, color: C.sub, marginBottom: 28, fontWeight: 300 }}>
              We'll personalize your dashboard with it.
            </p>
            <input
              autoFocus value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && canAdvance() && setStep(2)}
              placeholder="Your first name"
              style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "14px 16px", color: C.text, fontSize: 16,
                fontFamily: "inherit", outline: "none", marginBottom: 20,
                boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <Btn disabled={!canAdvance()} onClick={() => setStep(2)}>Continue →</Btn>
          </div>
        )}

        {/* INCOME */}
        {currentStep === "income" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
              color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>Your Finances</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text,
              letterSpacing: "-.02em", marginBottom: 8 }}>Monthly income?</div>
            <p style={{ fontSize: 14, color: C.sub, marginBottom: 28, fontWeight: 300 }}>
              After taxes. Used to calculate your Stewardship Score.
            </p>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <span style={{ position: "absolute", left: 16, top: "50%",
                transform: "translateY(-50%)", color: C.sub, fontSize: 16 }}>$</span>
              <input
                autoFocus type="number" value={income}
                onChange={e => setIncome(e.target.value)}
                onKeyDown={e => e.key === "Enter" && canAdvance() && setStep(3)}
                placeholder="5,000"
                style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "14px 16px 14px 32px", color: C.text, fontSize: 16,
                  fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
            <Btn disabled={!canAdvance()} onClick={() => setStep(3)}>Continue →</Btn>
            <Skip onClick={() => setStep(3)} />
          </div>
        )}

        {/* NET WORTH */}
        {currentStep === "networth" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
              color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>Your Finances</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text,
              letterSpacing: "-.02em", marginBottom: 8 }}>Net worth & cash?</div>
            <p style={{ fontSize: 14, color: C.sub, marginBottom: 24, fontWeight: 300 }}>
              Rough estimates are fine — you can update these anytime.
            </p>
            <label style={{ fontSize: 12, color: C.sub, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Net Worth (assets minus debts)
            </label>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <span style={{ position: "absolute", left: 16, top: "50%",
                transform: "translateY(-50%)", color: C.sub, fontSize: 16 }}>$</span>
              <input
                autoFocus type="number" value={netWorth}
                onChange={e => setNetWorth(e.target.value)}
                placeholder="0"
                style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "14px 16px 14px 32px", color: C.text, fontSize: 16,
                  fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
            <label style={{ fontSize: 12, color: C.sub, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Cash on hand (checking + savings)
            </label>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <span style={{ position: "absolute", left: 16, top: "50%",
                transform: "translateY(-50%)", color: C.sub, fontSize: 16 }}>$</span>
              <input
                type="number" value={cash}
                onChange={e => setCash(e.target.value)}
                placeholder="0"
                style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "14px 16px 14px 32px", color: C.text, fontSize: 16,
                  fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
            <Btn onClick={() => setStep(4)}>Continue →</Btn>
            <Skip onClick={() => setStep(4)} />
          </div>
        )}

        {/* GOALS */}
        {currentStep === "goals" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
              color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>Your Goals</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text,
              letterSpacing: "-.02em", marginBottom: 8 }}>What are you saving for?</div>
            <p style={{ fontSize: 14, color: C.sub, marginBottom: 24, fontWeight: 300 }}>
              Pick any that apply. You can customize them later.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {GOAL_OPTIONS.map(g => {
                const selected = selGoals.find(s => s.name === g.name);
                return (
                  <div key={g.name} onClick={() => toggleGoal(g)}
                    style={{ background: selected ? C.accent + "15" : C.card,
                      border: `1px solid ${selected ? C.accent + "60" : C.border}`,
                      borderRadius: 12, padding: "14px 12px", cursor: "pointer",
                      transition: "all .2s", textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{g.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600,
                      color: selected ? C.accent : C.text }}>{g.name}</div>
                  </div>
                );
              })}
            </div>
            <Btn onClick={handleFinish} disabled={saving}>
              {saving ? "Setting up your account..." : "Launch FinanceOS 🚀"}
            </Btn>
            {selGoals.length === 0 && <Skip label="Skip for now" onClick={handleFinish} />}
          </div>
        )}

        {/* Back button */}
        {step > 0 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span onClick={() => setStep(s => s - 1)}
              style={{ fontSize: 12, color: C.muted, cursor: "pointer" }}>← Back</span>
          </div>
        )}
      </div>

      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
    </div>
  );
}

function Btn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: "100%", background: C.accent, border: "none", borderRadius: 12,
        padding: "14px", fontSize: 14, fontWeight: 700, color: "#000",
        fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1, transition: "opacity .2s" }}>
      {children}
    </button>
  );
}

function Skip({ onClick, label = "Skip this step" }) {
  return (
    <div style={{ textAlign: "center", marginTop: 12 }}>
      <span onClick={onClick} style={{ fontSize: 12, color: C.muted, cursor: "pointer" }}>
        {label}
      </span>
    </div>
  );
}
