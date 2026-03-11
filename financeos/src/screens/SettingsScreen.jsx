import { useState, useEffect } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { useSpending } from "../hooks/useSupabase";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";
import ScoreRing from "../components/ScoreRing";

function Toggle({ value, onChange, color = C.accent }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{ width:48, height:26, borderRadius:99, cursor:"pointer",
        background: value ? color : C.border, transition:"background .2s", position:"relative",
        flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left: value ? 25 : 3,
        width:20, height:20, borderRadius:"50%", background:"#fff",
        transition:"left .2s", boxShadow:"0 1px 4px #00000060" }} />
    </div>
  );
}

function EditableField({ label, value, onChange, prefix, type = "text" }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal]     = useState(value);

  function save() {
    onChange(local);
    setEditing(false);
  }

  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ fontSize:13, color:C.sub }}>{label}</div>
      {editing ? (
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            {prefix && <span style={{ position:"absolute", left:8, top:"50%",
              transform:"translateY(-50%)", color:C.sub, fontSize:13 }}>{prefix}</span>}
            <input autoFocus type={type} value={local}
              onChange={e => setLocal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && save()}
              style={{ background:C.surface, border:`1px solid ${C.accent}`,
                borderRadius:8, padding:`8px 8px 8px ${prefix?"22px":"8px"}`,
                color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", width:120 }}
            />
          </div>
          <button onClick={save}
            style={{ background:C.accent, border:"none", borderRadius:8,
              padding:"8px 12px", fontSize:12, fontWeight:700, color:"#000",
              cursor:"pointer", fontFamily:"inherit" }}>Save</button>
          <button onClick={() => { setLocal(value); setEditing(false); }}
            style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8,
              padding:"8px 12px", fontSize:12, color:C.sub, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
        </div>
      ) : (
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.text }}>
            {prefix}{value || "—"}
          </span>
          <span onClick={() => { setLocal(value); setEditing(true); }}
            style={{ fontSize:11, color:C.accent, cursor:"pointer", fontWeight:600 }}>Edit</span>
        </div>
      )}
    </div>
  );
}

export default function SettingsScreen({ profile, updateProfile, faithMode, setFaithMode, onSignOut }) {
  const userId = profile?.id;
  const { spending, totalThisMonth } = useSpending(userId);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled]         = useState(false);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
  }

  // Real stewardship score
  const income      = profile?.monthly_income || 0;
  const netWorth    = profile?.net_worth || 0;
  const savingsRate = income > 0 ? Math.min((income - totalThisMonth) / income * 100, 100) : 0;
  const scoreComponents = [
    { label:"Saving Habits",       score: Math.round(Math.min(savingsRate * 1.2, 100)), color:C.green },
    { label:"Spending Discipline", score: Math.round(Math.min(100 - (totalThisMonth / Math.max(income,1) * 80), 100)), color:C.gold },
    { label:"Net Worth Growth",    score: netWorth > 50000 ? 85 : netWorth > 10000 ? 65 : netWorth > 0 ? 45 : 20, color:C.blue },
    { label:"Investment Growth",   score: 70, color:C.accent },
    { label:"Giving Consistency",  score: 80, color:"#8B5CF6" },
  ];
  const overallScore = Math.round(scoreComponents.reduce((s,c) => s + c.score, 0) / scoreComponents.length);

  // Monthly leak report from real spending
  const thisMonth = spending.filter(s => new Date(s.date).getMonth() === new Date().getMonth());
  const catTotals = thisMonth.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + Number(s.amount);
    return acc;
  }, {});
  const topLeaks = Object.entries(catTotals)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amt]) => ({ label: cat, amount: Math.round(amt) }));
  const totalLeaks  = topLeaks.reduce((s,l) => s + l.amount, 0);
  const yearlyLeaks = totalLeaks * 12;

  async function handleUpdate(field, value) {
    await updateProfile({ [field]: isNaN(value) ? value : parseFloat(value) || 0 });
  }

  return (
    <div>
      {/* Profile */}
      <Card>
        <SectionTitle>Profile</SectionTitle>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:C.accent+"20",
            border:`1px solid ${C.accent}33`, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:22, fontWeight:800, color:C.accent }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{profile?.full_name || "—"}</div>
            <div style={{ fontSize:12, color:C.sub }}>{profile?.id?.slice(0,8)}...</div>
          </div>
        </div>
        <EditableField label="Name" value={profile?.full_name || ""} onChange={v => handleUpdate("full_name", v)} />
        <EditableField label="Monthly Income" value={String(profile?.monthly_income || 0)} onChange={v => handleUpdate("monthly_income", v)} prefix="$" type="number" />
        <EditableField label="Net Worth" value={String(profile?.net_worth || 0)} onChange={v => handleUpdate("net_worth", v)} prefix="$" type="number" />
        <EditableField label="Cash on Hand" value={String(profile?.cash || 0)} onChange={v => handleUpdate("cash", v)} prefix="$" type="number" />
      </Card>

      {/* Stewardship Score */}
      <Card glow={C.accent}>
        <SectionTitle>Stewardship Score</SectionTitle>
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:16 }}>
          <ScoreRing score={overallScore} />
          <div>
            <div style={{ fontSize:28, fontWeight:800, color:C.text }}>
              {overallScore}<span style={{ fontSize:14, color:C.sub }}>/100</span>
            </div>
            <div style={{ fontSize:12, color: overallScore >= 70 ? C.green : overallScore >= 50 ? C.gold : C.rose,
              fontWeight:600 }}>
              {overallScore >= 70 ? "✅ Good Standing" : overallScore >= 50 ? "⚡ Getting There" : "⚠️ Needs Work"}
            </div>
          </div>
        </div>
        {scoreComponents.map(c => (
          <div key={c.label} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:C.sub }}>{c.label}</span>
              <span style={{ fontSize:12, fontWeight:700, color:c.color }}>{c.score}</span>
            </div>
            <ProgressBar pct={c.score} color={c.color} />
          </div>
        ))}
      </Card>

      {/* Preferences */}
      <Card>
        <SectionTitle>Preferences</SectionTitle>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>✝️</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Faith Mode</div>
              <div style={{ fontSize:11, color:C.sub }}>Biblical stewardship on dashboard</div>
            </div>
          </div>
          <Toggle value={faithMode} onChange={setFaithMode} color={C.gold} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"12px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>🔔</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Notifications</div>
              <div style={{ fontSize:11, color:C.sub }}>Daily financial brief</div>
            </div>
          </div>
          <Toggle value={false} onChange={() => {}} />
        </div>
      </Card>

      {/* Monthly Leak Report */}
      <Card>
        <SectionTitle>📋 Monthly Spending Report</SectionTitle>
        <div style={{ fontSize:12, color:C.sub, marginBottom:12 }}>
          {new Date().toLocaleDateString("en-US",{ month:"long", year:"numeric" })}
        </div>
        {topLeaks.length > 0 ? topLeaks.map(l => (
          <div key={l.label} style={{ display:"flex", justifyContent:"space-between",
            padding:"8px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
            <span style={{ color:C.sub }}>{l.label}</span>
            <span style={{ color:C.rose, fontWeight:700 }}>{fmt(l.amount)}</span>
          </div>
        )) : (
          <div style={{ fontSize:13, color:C.sub, textAlign:"center", padding:"16px 0" }}>
            No spending data yet this month
          </div>
        )}
        {topLeaks.length > 0 && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, marginTop:4 }}>
              <span style={{ color:C.text, fontWeight:700 }}>Yearly if unchanged</span>
              <span style={{ color:C.rose, fontWeight:800, fontSize:16 }}>{fmt(yearlyLeaks)}</span>
            </div>
            <button style={{ marginTop:14, width:"100%", background:C.accent+"20",
              border:`1px solid ${C.accent}44`, borderRadius:10, padding:"10px",
              color:C.accent, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Share Report 📤
            </button>
          </>
        )}
      </Card>

      {/* Install App */}
      {!installed && (
        <Card>
          <SectionTitle>📱 Install App</SectionTitle>
          <div style={{ fontSize:13, color:C.sub, marginBottom:14, lineHeight:1.6 }}>
            Install FinanceOS on your device for a native app experience — full screen, works offline, no browser bar.
          </div>
          {installPrompt ? (
            <button onClick={handleInstall}
              style={{ width:"100%", background:C.accent, border:"none", borderRadius:12,
                padding:"13px", fontSize:14, fontWeight:700, color:"#000",
                fontFamily:"inherit", cursor:"pointer" }}>
              Install FinanceOS 📲
            </button>
          ) : (
            <div style={{ background:C.surface, borderRadius:12, padding:"14px",
              border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:8 }}>Manual Install:</div>
              <div style={{ fontSize:12, color:C.sub, lineHeight:1.8 }}>
                <div>📱 <strong style={{ color:C.text }}>Android:</strong> Chrome menu → "Add to Home Screen"</div>
                <div>🍎 <strong style={{ color:C.text }}>iPhone:</strong> Safari → Share → "Add to Home Screen"</div>
              </div>
            </div>
          )}
        </Card>
      )}
      {installed && (
        <Card>
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.green }}>App Installed!</div>
            <div style={{ fontSize:12, color:C.sub, marginTop:4 }}>FinanceOS is on your home screen</div>
          </div>
        </Card>
      )}

      {/* Account */}
      <Card>
        <SectionTitle>Account</SectionTitle>
        <div style={{ fontSize:13, color:C.sub, padding:"8px 0", borderBottom:`1px solid ${C.border}`,
          marginBottom:14 }}>
          Signed in as <span style={{ color:C.text, fontWeight:600 }}>{profile?.id?.slice(0,12)}...</span>
        </div>
        <button onClick={onSignOut}
          style={{ width:"100%", background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)",
            borderRadius:10, padding:"12px", color:C.rose, fontSize:13, fontWeight:700,
            cursor:"pointer", fontFamily:"inherit" }}>
          Sign Out
        </button>
      </Card>

      <div style={{ height:20 }} />
    </div>
  );
}
