import { useState } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { useGoals } from "../hooks/useSupabase";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";

const GOAL_COLORS = [C.blue, C.gold, C.accent, C.rose, C.green, "#8B5CF6", "#F97316", "#EC4899"];
const GOAL_ICONS  = ["🛡️","🏠","✈️","🎓","🚗","💍","📈","🤲","🎯","💰"];

export default function GoalsScreen({ userId }) {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals(userId);
  const [selected,    setSelected]    = useState(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [showDeposit, setShowDeposit] = useState(null); // goal id
  const [depositAmt,  setDepositAmt]  = useState("");
  const [saving,      setSaving]      = useState(false);
  const [form, setForm] = useState({ name:"", icon:"🎯", target:"", saved:"", deadline:"" });

  async function handleAddGoal() {
    if (!form.name || !form.target) return;
    setSaving(true);
    await addGoal({
      name: form.name, icon: form.icon,
      target: parseFloat(form.target),
      saved: parseFloat(form.saved) || 0,
      deadline: form.deadline || null,
    });
    setForm({ name:"", icon:"🎯", target:"", saved:"", deadline:"" });
    setSaving(false);
    setShowAdd(false);
  }

  async function handleDeposit(goalId, currentSaved) {
    if (!depositAmt || isNaN(depositAmt)) return;
    setSaving(true);
    await updateGoal(goalId, { saved: currentSaved + parseFloat(depositAmt) });
    setDepositAmt("");
    setSaving(false);
    setShowDeposit(null);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this goal?")) return;
    await deleteGoal(id);
    setSelected(null);
  }

  const totalSaved  = goals.reduce((s, g) => s + Number(g.saved), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target), 0);

  return (
    <div>
      {/* Summary */}
      {goals.length > 0 && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, color:C.sub }}>Total Saved Across Goals</div>
              <div style={{ fontSize:26, fontWeight:800, color:C.accent }}>{fmt(totalSaved)}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:C.sub }}>Total Target</div>
              <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{fmt(totalTarget)}</div>
            </div>
          </div>
          <div style={{ marginTop:10 }}>
            <ProgressBar pct={Math.round((totalSaved / totalTarget) * 100)} color={C.accent} />
          </div>
          <div style={{ fontSize:11, color:C.sub, marginTop:6 }}>
            {Math.round((totalSaved / totalTarget) * 100)}% of total goals funded
          </div>
        </Card>
      )}

      {/* Add Goal Button */}
      <button onClick={() => setShowAdd(true)}
        style={{ width:"100%", background:C.accent, border:"none", borderRadius:12,
          padding:"13px", fontSize:14, fontWeight:700, color:"#000",
          fontFamily:"inherit", cursor:"pointer", marginBottom:16 }}>
        + Add Goal
      </button>

      {/* Goals List */}
      <Card>
        <SectionTitle>Active Goals</SectionTitle>
        {loading && <div style={{ fontSize:13, color:C.sub, textAlign:"center", padding:"20px 0" }}>Loading...</div>}
        {!loading && goals.length === 0 && (
          <div style={{ fontSize:13, color:C.sub, textAlign:"center", padding:"20px 0" }}>
            No goals yet. Tap "+ Add Goal" to create your first one!
          </div>
        )}
        {goals.map((g, i) => {
          const pct   = Math.min(Math.round((Number(g.saved) / Number(g.target)) * 100), 100);
          const color = GOAL_COLORS[i % GOAL_COLORS.length];
          const open  = selected === g.id;
          const remaining = Number(g.target) - Number(g.saved);

          // ETA calc
          let eta = "—";
          if (g.deadline) {
            const months = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30));
            eta = months > 0 ? `${months}mo` : "Past due";
          }

          return (
            <div key={g.id}
              onClick={() => setSelected(open ? null : g.id)}
              style={{ background:C.surface, borderRadius:12, padding:"14px 16px",
                marginBottom:10, border:`1px solid ${open ? color+"66" : C.border}`,
                cursor:"pointer", transition:"border-color .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:color+"22",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                    {g.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{g.name}</div>
                    <div style={{ fontSize:11, color:C.sub }}>{fmt(g.saved)} / {fmt(g.target)}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:18, fontWeight:800, color }}>{pct}%</div>
                  {g.deadline && <div style={{ fontSize:10, color:C.sub }}>ETA {eta}</div>}
                </div>
              </div>
              <div style={{ marginTop:10 }}>
                <ProgressBar pct={pct} color={color} />
              </div>
              {open && (
                <div style={{ marginTop:14, padding:"12px 0", borderTop:`1px solid ${C.border}` }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                    {[
                      { label:"Remaining",    val: fmt(remaining) },
                      { label:"Monthly Need", val: fmt(Math.round(remaining / Math.max(1, 6))) },
                      { label:"On Track",     val: pct > 40 ? "✅ Yes" : "⚠️ Low" },
                    ].map(s => (
                      <div key={s.label} style={{ background:C.card, borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
                        <div style={{ fontSize:11, color:C.sub, marginBottom:2 }}>{s.label}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setShowDeposit(g.id); setDepositAmt(""); }}
                      style={{ flex:1, background:color+"20", border:`1px solid ${color}44`,
                        borderRadius:8, padding:"8px", fontSize:12, fontWeight:700,
                        color, cursor:"pointer", fontFamily:"inherit" }}>
                      + Add Funds
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(g.id); }}
                      style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)",
                        borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:700,
                        color:C.rose, cursor:"pointer", fontFamily:"inherit" }}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      {/* Challenges */}
      <Card>
        <SectionTitle>🏆 Savings Challenges</SectionTitle>
        {[
          { name:"30-Day No-Spend",        joined:142, color:"#8B5CF6", active:true },
          { name:"$1K Emergency Fund",     joined: 89, color:C.blue,    active:false },
          { name:"Cut Subscriptions Week", joined: 67, color:C.rose,    active:false },
        ].map(ch => (
          <div key={ch.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"12px 14px", background:C.surface, borderRadius:10, marginBottom:8,
            border:`1px solid ${ch.active ? ch.color+"66" : C.border}` }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{ch.name}</div>
              <div style={{ fontSize:11, color:C.sub }}>{ch.joined} participants</div>
            </div>
            <button style={{ background: ch.active ? ch.color : C.border,
              color: ch.active ? "#000" : C.sub, border:"none", borderRadius:8,
              padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {ch.active ? "Joined ✓" : "Join"}
            </button>
          </div>
        ))}
      </Card>

      {/* Add Goal Modal */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px 20px 0 0",
            padding:"24px 20px 36px", width:"100%", maxWidth:420 }}>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:20 }}>New Goal</div>

            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Icon</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
              {GOAL_ICONS.map(ic => (
                <div key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  style={{ width:40, height:40, borderRadius:10, display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:20, cursor:"pointer",
                    background: form.icon === ic ? C.accent+"20" : C.surface,
                    border:`1px solid ${form.icon === ic ? C.accent+"60" : C.border}` }}>
                  {ic}
                </div>
              ))}
            </div>

            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Goal Name</label>
            <input autoFocus type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Emergency Fund"
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:10, padding:"12px 14px", color:C.text, fontSize:14,
                fontFamily:"inherit", outline:"none", marginBottom:14, boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Target Amount</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.sub, fontSize:14 }}>$</span>
                  <input type="number" value={form.target}
                    onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                    placeholder="10,000"
                    style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                      borderRadius:10, padding:"12px 14px 12px 26px", color:C.text, fontSize:14,
                      fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Already Saved</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.sub, fontSize:14 }}>$</span>
                  <input type="number" value={form.saved}
                    onChange={e => setForm(f => ({ ...f, saved: e.target.value }))}
                    placeholder="0"
                    style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                      borderRadius:10, padding:"12px 14px 12px 26px", color:C.text, fontSize:14,
                      fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              </div>
            </div>

            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Target Date (optional)</label>
            <input type="date" value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:10, padding:"12px 14px", color:C.text, fontSize:14,
                fontFamily:"inherit", outline:"none", marginBottom:20, boxSizing:"border-box" }}
            />

            <button onClick={handleAddGoal} disabled={saving || !form.name || !form.target}
              style={{ width:"100%", background:C.accent, border:"none", borderRadius:12,
                padding:"13px", fontSize:14, fontWeight:700, color:"#000",
                fontFamily:"inherit", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving || !form.name || !form.target ? 0.6 : 1 }}>
              {saving ? "Saving..." : "Create Goal"}
            </button>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDeposit && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e => e.target === e.currentTarget && setShowDeposit(null)}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px 20px 0 0",
            padding:"24px 20px 36px", width:"100%", maxWidth:420 }}>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>Add Funds</div>
            <div style={{ fontSize:13, color:C.sub, marginBottom:20 }}>
              {goals.find(g => g.id === showDeposit)?.name}
            </div>
            <div style={{ position:"relative", marginBottom:20 }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:C.sub }}>$</span>
              <input autoFocus type="number" value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                placeholder="0.00"
                style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
                  borderRadius:10, padding:"12px 14px 12px 28px", color:C.text, fontSize:16,
                  fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
            <button
              onClick={() => {
                const goal = goals.find(g => g.id === showDeposit);
                if (goal) handleDeposit(goal.id, Number(goal.saved));
              }}
              disabled={saving || !depositAmt}
              style={{ width:"100%", background:C.accent, border:"none", borderRadius:12,
                padding:"13px", fontSize:14, fontWeight:700, color:"#000",
                fontFamily:"inherit", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving || !depositAmt ? 0.6 : 1 }}>
              {saving ? "Saving..." : "Add Funds"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
