import { useState } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { useSpending } from "../hooks/useSupabase";
import Card from "../components/Card";
import { SkeletonCard, SkeletonRow } from "../components/Skeleton";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";

const CATEGORIES = [
  { cat: "Food & Dining",     icon: "🍔", color: C.rose },
  { cat: "Groceries",         icon: "🛒", color: C.green },
  { cat: "Transportation",    icon: "🚗", color: C.blue },
  { cat: "Entertainment",     icon: "🎬", color: C.gold },
  { cat: "Shopping",          icon: "🛍️", color: "#8B5CF6" },
  { cat: "Bills & Utilities", icon: "💡", color: C.sub },
  { cat: "Health",            icon: "💊", color: C.accent },
  { cat: "Other",             icon: "📦", color: C.muted },
];

const BUDGET = 5000;

export default function SpendingScreen({ userId, onImport }) {
  const { spending, loading, addSpending, deleteSpending, totalThisMonth } = useSpending(userId);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ amount:"", category:"Food & Dining", note:"", date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState(null);

  async function handleAdd() {
    if (!form.amount || isNaN(form.amount)) return;
    setSaving(true);
    await addSpending({ amount: parseFloat(form.amount), category: form.category, note: form.note, date: form.date });
    setForm({ amount:"", category:"Food & Dining", note:"", date: new Date().toISOString().split("T")[0] });
    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(id) {
    setDeleteId(id);
    await deleteSpending(id);
    setDeleteId(null);
  }

  const thisMonth = spending.filter(s => new Date(s.date).getMonth() === new Date().getMonth());
  const catTotals = CATEGORIES.map(c => ({
    ...c,
    amount: thisMonth.filter(s => s.category === c.cat).reduce((sum, s) => sum + Number(s.amount), 0),
  })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const amt = spending.filter(s => s.date === key).reduce((sum, s) => sum + Number(s.amount), 0);
    return { day: days[d.getDay()], amt, isToday: i === 6 };
  });
  const maxAmt = Math.max(...last7.map(d => d.amt), 1);
  const remaining = BUDGET - totalThisMonth;
  const overBudget = totalThisMonth > BUDGET;

  return (
    <div>
      <Card>
        <SectionTitle>Monthly Overview</SectionTitle>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:11, color:C.sub }}>Total Spent</div>
            <div style={{ fontSize:28, fontWeight:800, color: overBudget ? C.rose : C.text }}>{fmt(totalThisMonth)}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:C.sub }}>Budget</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.green }}>{fmt(BUDGET)}</div>
          </div>
        </div>
        <ProgressBar pct={Math.min(Math.round((totalThisMonth / BUDGET) * 100), 100)} color={overBudget ? C.rose : C.accent} />
        <div style={{ marginTop:6, fontSize:11, color: overBudget ? C.rose : C.sub }}>
          {overBudget ? `${fmt(Math.abs(remaining))} over budget` : `${fmt(remaining)} remaining this month`}
        </div>
      </Card>

      <button onClick={() => setShowModal(true)}
        style={{ width:"100%", background:C.accent, border:"none", borderRadius:12,
          padding:"13px", fontSize:14, fontWeight:700, color:"#000",
          fontFamily:"inherit", cursor:"pointer", marginBottom:16 }}>
        + Add Expense
      </button>

      <Card>
        <SectionTitle>Last 7 Days</SectionTitle>
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80, paddingBottom:20 }}>
          {last7.map((d, i) => {
            const h = Math.max((d.amt / maxAmt) * 60, d.amt > 0 ? 4 : 0);
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:9, color: d.isToday ? C.accent : C.sub, fontWeight:600 }}>
                  {d.amt > 0 ? `$${Math.round(d.amt)}` : ""}
                </div>
                <div style={{ width:"100%", height: Math.max(h, 3),
                  background: d.isToday ? C.accent : d.amt > 0 ? C.blue : C.border,
                  borderRadius:"4px 4px 0 0", transition:"height .6s ease" }} />
                <div style={{ fontSize:10, color: d.isToday ? C.accent : C.sub }}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {catTotals.length > 0 && (
        <Card>
          <SectionTitle>By Category</SectionTitle>
          {catTotals.map(s => (
            <div key={s.cat} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:16 }}>{s.icon}</span>
                  <span style={{ fontSize:13, color:C.text }}>{s.cat}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{fmt(s.amount)}</span>
              </div>
              <ProgressBar pct={Math.min(Math.round((s.amount / totalThisMonth) * 100), 100)} color={s.color} />
            </div>
          ))}
        </Card>
      )}

      <Card>
        <SectionTitle action="Import CSV" onAction={onImport}>Recent Transactions</SectionTitle>
        {loading && <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>}
        {!loading && spending.length === 0 && (
          <div style={{ fontSize:13, color:C.sub, textAlign:"center", padding:"20px 0" }}>
            No expenses yet. Tap "+ Add Expense" to get started!
          </div>
        )}
        {spending.slice(0, 20).map(s => {
          const cat = CATEGORIES.find(c => c.cat === s.category) || CATEGORIES[7];
          return (
            <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:C.surface,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.note || s.category}</div>
                  <div style={{ fontSize:11, color:C.sub }}>
                    {s.category} · {new Date(s.date + "T00:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric" })}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontSize:14, fontWeight:700, color:cat.color }}>-{fmt(s.amount)}</div>
                <div onClick={() => handleDelete(s.id)}
                  style={{ fontSize:16, cursor:"pointer", opacity: deleteId === s.id ? 0.3 : 0.5 }}>🗑️</div>
              </div>
            </div>
          );
        })}
      </Card>

      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px 20px 0 0",
            padding:"24px 20px 36px", width:"100%", maxWidth:420 }}>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:20 }}>Add Expense</div>
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
            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Category</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
              {CATEGORIES.map(c => (
                <div key={c.cat} onClick={() => setForm(f => ({ ...f, category: c.cat }))}
                  style={{ background: form.category === c.cat ? C.accent+"20" : C.surface,
                    border:`1px solid ${form.category === c.cat ? C.accent+"60" : C.border}`,
                    borderRadius:10, padding:"8px 4px", textAlign:"center", cursor:"pointer" }}>
                  <div style={{ fontSize:18 }}>{c.icon}</div>
                  <div style={{ fontSize:9, color: form.category === c.cat ? C.accent : C.sub,
                    fontWeight:600, marginTop:2, lineHeight:1.2 }}>{c.cat.split(" ")[0]}</div>
                </div>
              ))}
            </div>
            <label style={{ fontSize:12, color:C.sub, fontWeight:600, display:"block", marginBottom:6 }}>Note (optional)</label>
            <input type="text" value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="e.g. Dinner with friends"
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
              {saving ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
