import { useState } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { useGiving } from "../hooks/useSupabase";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";

const TITHE_GOAL = 10;

const RECIPIENTS = [
  { name: "Church / Tithe",     icon: "⛪" },
  { name: "Missions",           icon: "🌍" },
  { name: "Food Bank",          icon: "🍞" },
  { name: "Family",             icon: "👨‍👩‍👧" },
  { name: "Charity",            icon: "❤️" },
  { name: "Other",              icon: "🤲" },
];

export default function GivingScreen({ userId }) {
  const { giving, loading, addGiving, totalThisMonth, totalYTD } = useGiving(userId);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount:"", recipient:"Church / Tithe", note:"", date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!form.amount || isNaN(form.amount)) return;
    setSaving(true);
    await addGiving({
      amount: parseFloat(form.amount),
      recipient: form.recipient,
      note: form.note,
      date: form.date,
    });
    setForm({ amount:"", recipient:"Church / Tithe", note:"", date: new Date().toISOString().split("T")[0] });
    setSaving(false);
    setShowModal(false);
  }

  // Use a default income if profile not loaded yet
  const monthlyIncome = 8500;
  const titheTarget   = (monthlyIncome * TITHE_GOAL) / 100;
  const givingPct     = Math.round((totalThisMonth / monthlyIncome) * 100);
  const titheProgress = Math.min(Math.round((totalThisMonth / titheTarget) * 100), 100);
  const remaining     = Math.max(titheTarget - totalThisMonth, 0);

  // Giving score
  let givingScore = "C";
  if (givingPct >= 10) givingScore = "A+";
  else if (givingPct >= 8) givingScore = "A";
  else if (givingPct >= 6) givingScore = "B+";
  else if (givingPct >= 4) givingScore = "B";
  else if (givingPct >= 2) givingScore = "C+";

  // Yearly projection
  const monthsElapsed = new Date().getMonth() + 1;
  const yearlyProjection = monthsElapsed > 0 ? Math.round((totalYTD / monthsElapsed) * 12) : 0;
  const yearlyPct = Math.round((yearlyProjection / (monthlyIncome * 12)) * 100);

  // Group by recipient this month
  const thisMonth = giving.filter(g => new Date(g.date).getMonth() === new Date().getMonth());
  const byRecipient = RECIPIENTS.map(r => ({
    ...r,
    amount: thisMonth.filter(g => g.recipient === r.name).reduce((s, g) => s + Number(g.amount), 0),
  })).filter(r => r.amount > 0);

  return (
    <div>
      {/* Giving Summary */}
      <Card>
        <SectionTitle>This Month's Giving</SectionTitle>
        <div style={{ fontSize:36, fontWeight:800, color:C.accent, marginBottom:6 }}>
          {fmt(totalThisMonth)}
        </div>
        <div style={{ fontSize:13, color:C.sub, marginBottom:12 }}>
          {givingPct}% of monthly income · Goal: {TITHE_GOAL}%
        </div>
        <ProgressBar pct={titheProgress} color={C.accent} />
        <div style={{ marginTop:8, fontSize:12, color:C.sub }}>
          {remaining > 0
            ? `${fmt(remaining)} remaining to reach tithe goal`
            : "🎉 Tithe goal reached this month!"}
        </div>
      </Card>

      {/* Add Giving Button */}
      <button onClick={() => setShowModal(true)}
        style={{ width:"100%", background:C.accent, border:"none", borderRadius:12,
          padding:"13px", fontSize:14, fontWeight:700, color:"#000",
          fontFamily:"inherit", cursor:"pointer", marginBottom:16 }}>
        + Log Gift
      </button>

      {/* Stats Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <Card style={{ marginBottom:0, textAlign:"center" }}>
          <div style={{ fontSize:11, color:C.sub, marginBottom:4 }}>YTD Giving</div>
          <div style={{ fontSize:20, fontWeight:800, color:C.accent }}>{fmt(totalYTD)}</div>
        </Card>
        <Card style={{ marginBottom:0, textAlign:"center" }}>
          <div style={{ fontSize:11, color:C.sub, marginBottom:4 }}>Giving Score</div>
          <div style={{ fontSize:20, fontWeight:800, color:C.green }}>{givingScore}</div>
        </Card>
      </div>

      {/* By Recipient */}
      {byRecipient.length > 0 && (
        <Card>
          <SectionTitle>By Recipient</SectionTitle>
          {byRecipient.map(r => (
            <div key={r.name} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:20 }}>{r.icon}</span>
                <span style={{ fontSize:13, color:C.text }}>{r.name}</span>
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:C.accent }}>{fmt(r.amount)}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Giving Log */}
      <Card>
        <SectionTitle>Giving Log</SectionTitle>
        {loading && <div style={{ fontSize:13, color:C.sub, textAlign:"center", padding:"20px 0" }}>Loading...</div>}
        {!loading && giving.length === 0 && (
          <div style={{ fontSize:13, color:C.sub, textAlign:"center", padding:"20px 0" }}>
            No giving logged yet. Tap "+ Log Gift" to record your first one!
          </div>
        )}
        {giving.slice(0, 20).map(g => {
          const rec = RECIPIENTS.find(r => r.name === g.recipient) || RECIPIENTS[5];
          return (
            <div key={g.id} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:C.accent+"20",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                  {rec.icon}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
                    {g.note || g.recipient}
                  </div>
                  <div style={{ fontSize:11, color:C.sub }}>
                    {g.recipient} · {new Date(g.date + "T00:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric" })}
                  </div>
                </div>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:C.accent }}>{fmt(g.amount)}</div>
            </div>
          );
        })}
      </Card>

      {/* Yearly Projection */}
      {totalYTD > 0 && (
        <Card>
          <SectionTitle>📊 Yearly Projection</SectionTitle>
          <div style={{ fontSize:13, color:C.sub, marginBottom:12 }}>
            At your current pace, you'll give{" "}
            <span style={{ color:C.accent, fontWeight:700 }}>{fmt(yearlyProjection)}</span> this year.
            That's{" "}
            <span style={{ color: yearlyPct >= 10 ? C.green : C.gold, fontWeight:700 }}>
              {yearlyPct}% of income
            </span>
            {yearlyPct >= 10 ? " — tithe goal achieved! 🎉" : " — keep going!"}
          </div>
          <div style={{ background:C.surface, borderRadius:10, padding:"12px 14px",
            borderLeft:`3px solid ${C.gold}` }}>
            <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:4 }}>✝️ Stewardship Note</div>
            <div style={{ fontSize:12, color:C.sub, lineHeight:1.5 }}>
              Giving consistently is one of the strongest indicators of long-term financial peace. You're building a generous life.
            </div>
          </div>
        </Card>
      )}

      {/* Add Giving Modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px 20px 0 0",
            padding:"24px 20px 36px", width:"100%", maxWidth:420 }}>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:20 }}>Log a Gift</div>

            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Amount</label>
            <div style={{ position:"relative", marginBottom:14 }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:C.sub }}>$</span>
              <input autoFocus type="number" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                  borderRadius:10, padding:"12px 14px 12px 28px", color:C.text, fontSize:16,
                  fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Recipient</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
              {RECIPIENTS.map(r => (
                <div key={r.name} onClick={() => setForm(f => ({ ...f, recipient: r.name }))}
                  style={{ background: form.recipient === r.name ? C.accent+"20" : C.surface,
                    border:`1px solid ${form.recipient === r.name ? C.accent+"60" : C.border}`,
                    borderRadius:10, padding:"10px 6px", textAlign:"center", cursor:"pointer" }}>
                  <div style={{ fontSize:20 }}>{r.icon}</div>
                  <div style={{ fontSize:10, color: form.recipient === r.name ? C.accent : C.sub,
                    fontWeight:600, marginTop:2, lineHeight:1.2 }}>{r.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>

            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Note (optional)</label>
            <input type="text" value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="e.g. Sunday tithe"
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:10, padding:"12px 14px", color:C.text, fontSize:14,
                fontFamily:"inherit", outline:"none", marginBottom:14, boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />

            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Date</label>
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:10, padding:"12px 14px", color:C.text, fontSize:14,
                fontFamily:"inherit", outline:"none", marginBottom:20, boxSizing:"border-box" }}
            />

            <button onClick={handleAdd} disabled={saving || !form.amount}
              style={{ width:"100%", background:C.accent, border:"none", borderRadius:12,
                padding:"13px", fontSize:14, fontWeight:700, color:"#000",
                fontFamily:"inherit", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving || !form.amount ? 0.6 : 1 }}>
              {saving ? "Saving..." : "Save Gift 🤲"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
