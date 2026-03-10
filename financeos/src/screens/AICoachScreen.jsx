import { useState,useEffect,useRef } from "react";
import { C } from "../constants/colors";
import { USER } from "../data/mockData";
import Card from "../components/Card";
const QUICK=["Can I afford a $3K vacation?","How do I save $500/mo?","Should I cancel my gym?","Am I on track to retire?"];
const CONTEXT="User: Dain. Net Worth: $47,820. Income: $8,500/mo. Cash: $3,240. Score: 74/100. Goals: Emergency Fund 61%, Vacation $2800/$5000, House $18400/$60000. Unused subs: Audible 40d, Gym 22d, Hulu 18d. Spending: Food $620, Transport $310, Entertainment $185, Shopping $412. Investments: VOO $18420, AAPL $6340, BTC $4210, IRA $12800. Giving: $850/mo (10%).";
const SYSTEM=`You are an empathetic AI financial coach for FinanceOS. Give concise actionable warm advice under 150 words. Use emojis sparingly. Reference actual numbers. Context: ${CONTEXT}`;
export default function AICoachScreen() {
  const [messages,setMessages]=useState([{ role:"ai",text:`Hey ${USER.name} 👋 I'm your AI Financial Coach. I've analyzed your accounts and I'm ready to help. What's on your mind?` }]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages]);
  async function send(text) {
    const q=text||input.trim();
    if(!q) return;
    setInput("");
    setMessages(m=>[...m,{ role:"user",text:q }]);
    setLoading(true);
    try {
      const KEY=import.meta.env.VITE_GEMINI_API_KEY||"";
      const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`,{
        method:"POST",headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ system_instruction:{ parts:[{ text:SYSTEM }] },contents:[{ role:"user",parts:[{ text:q }] }],generationConfig:{ maxOutputTokens:300,temperature:0.7 } })
      });
      const data=await res.json();
      const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text||"Having trouble connecting. Please try again.";
      setMessages(m=>[...m,{ role:"ai",text:reply }]);
    } catch { setMessages(m=>[...m,{ role:"ai",text:"Connection issue. Please try again." }]); }
    setLoading(false);
  }
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"calc(100vh - 160px)" }}>
      <div style={{ flex:1,overflowY:"auto",paddingBottom:10 }}>
        <Card>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
            <div style={{ width:40,height:40,borderRadius:12,background:C.accent+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>🤖</div>
            <div><div style={{ fontSize:14,fontWeight:700,color:C.text }}>AI Financial Coach</div><div style={{ fontSize:11,color:C.green }}>● Online · Powered by Gemini</div></div>
          </div>
          {messages.map((m,i)=>(
            <div key={i} style={{ display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10 }}>
              <div style={{ maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
                background:m.role==="user"?C.accent:C.surface,color:m.role==="user"?"#000":C.text,
                fontSize:13,lineHeight:1.6,border:m.role==="ai"?`1px solid ${C.border}`:"none" }}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={{ display:"flex",gap:4,padding:"10px 14px",marginBottom:10 }}>{[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:"50%",background:C.accent,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div>}
          <div ref={bottomRef} />
          <div style={{ paddingTop:10,borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11,color:C.sub,marginBottom:8 }}>Quick questions:</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {QUICK.map(q=><button key={q} onClick={()=>send(q)} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,padding:"6px 12px",fontSize:11,color:C.text,cursor:"pointer" }}>{q}</button>)}
            </div>
          </div>
        </Card>
      </div>
      <div style={{ padding:"10px 0 0" }}>
        <div style={{ display:"flex",gap:8,background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:"8px 8px 8px 14px",alignItems:"center" }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything about your finances..."
            style={{ flex:1,background:"none",border:"none",outline:"none",color:C.text,fontSize:13,fontFamily:"inherit" }} />
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{ background:input.trim()?C.accent:C.border,border:"none",borderRadius:10,width:36,height:36,cursor:input.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"background .2s",color:input.trim()?"#000":C.sub }}>➤</button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
