import { useState, useEffect, useRef } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { useGoals, useSpending, useGiving } from "../hooks/useSupabase";
import Card from "../components/Card";

const QUICK_QUESTIONS = [
  "How am I doing this month?",
  "How can I save more?",
  "Am I on track with my goals?",
  "Where am I overspending?",
];

export default function AICoachScreen({ profile }) {
  const userId = profile?.id;
  const name   = profile?.full_name || "Friend";

  const { goals }                         = useGoals(userId);
  const { spending, totalThisMonth }      = useSpending(userId);
  const { giving, totalThisMonth: gave }  = useGiving(userId);

  // Build real financial context from live data
  const income     = profile?.monthly_income || 0;
  const netWorth   = profile?.net_worth      || 0;
  const cash       = profile?.cash           || 0;
  const saved      = Math.max(income - totalThisMonth, 0);
  const savingsRate = income > 0 ? Math.round((saved / income) * 100) : 0;
  const givingPct   = income > 0 ? Math.round((gave / income) * 100) : 0;

  // Top spending categories this month
  const thisMonthSpending = spending.filter(s => new Date(s.date).getMonth() === new Date().getMonth());
  const catTotals = thisMonthSpending.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + Number(s.amount);
    return acc;
  }, {});
  const topCats = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, amt]) => `${cat}: ${fmt(amt)}`)
    .join(", ");

  // Goals summary
  const goalsSummary = goals.length > 0
    ? goals.map(g => `${g.icon} ${g.name} (${Math.round(Number(g.saved)/Number(g.target)*100)}% of ${fmt(g.target)})`).join(", ")
    : "No goals set yet";

  // YTD giving
  const ytdGiving = giving
    .filter(g => new Date(g.date).getFullYear() === new Date().getFullYear())
    .reduce((s, g) => s + Number(g.amount), 0);

  const FINANCIAL_CONTEXT = `
User: ${name}.
Net Worth: ${fmt(netWorth)}.
Cash on hand: ${fmt(cash)}.
Monthly Income: ${fmt(income)}.
Spent this month: ${fmt(totalThisMonth)} (${income > 0 ? Math.round((totalThisMonth/income)*100) : 0}% of income).
Saved this month: ${fmt(saved)} (${savingsRate}% savings rate).
Top spending categories: ${topCats || "No spending logged yet"}.
Gave this month: ${fmt(gave)} (${givingPct}% of income).
YTD Giving: ${fmt(ytdGiving)}.
Goals: ${goalsSummary}.
Faith mode: ${profile?.faith_mode ? "enabled" : "disabled"}.
`;

  const SYSTEM_PROMPT = `You are an empathetic, insightful AI financial coach for a mobile app called FinanceOS.
You have access to the user's real financial data shown below. Give concise, actionable, warm advice.
Keep responses under 180 words. Use emojis sparingly but effectively. Always reference their actual numbers.
If faith mode is enabled, you can occasionally reference biblical stewardship principles naturally.
Be encouraging but honest — if something needs improvement, say so with compassion.
Financial context: ${FINANCIAL_CONTEXT}`;

  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  // Set welcome message once profile loads
  useEffect(() => {
    if (profile && messages.length === 0) {
      const intro = income > 0
        ? `Hey ${name} 👋 I've reviewed your finances. You've spent ${fmt(totalThisMonth)} this month with a ${savingsRate}% savings rate. What would you like to work on?`
        : `Hey ${name} 👋 I'm your AI Financial Coach, powered by Gemini. Add some spending or update your profile and I'll give you personalized advice. What's on your mind?`;
      setMessages([{ role:"ai", text: intro }]);
    }
  }, [profile?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  async function send(text) {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages(m => [...m, { role:"user", text:q }]);
    setLoading(true);

    try {
      const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            system_instruction: { parts:[{ text: SYSTEM_PROMPT }] },
            contents: [{ role:"user", parts:[{ text:q }] }],
            generationConfig: { maxOutputTokens:350, temperature:0.7 },
          }),
        }
      );
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "I'm having trouble connecting right now. Please try again.";
      setMessages(m => [...m, { role:"ai", text:reply }]);
    } catch {
      setMessages(m => [...m, { role:"ai", text:"Connection issue. Please check your internet and try again." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 160px)" }}>
      <div style={{ flex:1, overflowY:"auto", paddingBottom:10 }}>
        <Card>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:C.accent+"20",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
              🤖
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>AI Financial Coach</div>
              <div style={{ fontSize:11, color:C.green }}>● Online · Powered by Gemini</div>
            </div>
            {income > 0 && (
              <div style={{ marginLeft:"auto", background:C.accent+"15", border:`1px solid ${C.accent}30`,
                borderRadius:8, padding:"4px 10px", fontSize:10, color:C.accent, fontWeight:600 }}>
                📊 Live Data
              </div>
            )}
          </div>

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start",
              marginBottom:10 }}>
              <div style={{ maxWidth:"85%", padding:"10px 14px",
                borderRadius: m.role==="user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.role==="user" ? C.accent : C.surface,
                color: m.role==="user" ? "#000" : C.text,
                fontSize:13, lineHeight:1.6,
                border: m.role==="ai" ? `1px solid ${C.border}` : "none" }}>
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display:"flex", gap:4, padding:"10px 14px", marginBottom:10 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.accent,
                  animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />

          {/* Quick Questions */}
          <div style={{ paddingTop:10, borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11, color:C.sub, marginBottom:8 }}>Quick questions:</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => send(q)}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:99,
                    padding:"6px 12px", fontSize:11, color:C.text, cursor:"pointer", fontFamily:"inherit" }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Input */}
      <div style={{ padding:"10px 0 0" }}>
        <div style={{ display:"flex", gap:8, background:C.card, borderRadius:14,
          border:`1px solid ${C.border}`, padding:"8px 8px 8px 14px", alignItems:"center" }}>
          <input value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && send()}
            placeholder="Ask anything about your finances..."
            style={{ flex:1, background:"none", border:"none", outline:"none",
              color:C.text, fontSize:13, fontFamily:"inherit" }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ background: input.trim() ? C.accent : C.border, border:"none", borderRadius:10,
              width:36, height:36, cursor: input.trim() ? "pointer" : "default",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16, transition:"background .2s", color: input.trim() ? "#000" : C.sub }}>
            ➤
          </button>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
