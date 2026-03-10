import { useState } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { GOALS } from "../data/mockData";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";
import Chip from "../components/Chip";
export default function GoalsScreen() {
  const [selected,setSelected]=useState(null);
  return (
    <div>
      <Card>
        <SectionTitle>Active Goals</SectionTitle>
        <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
          {["All","Saving","Debt","Investing"].map(f=><Chip key={f} label={f} color={f==="All"?C.accent:C.muted} />)}
        </div>
        {GOALS.map((g,i)=>{
          const pct=Math.round((g.saved/g.target)*100),open=selected===i;
          return (
            <div key={g.name} onClick={()=>setSelected(open?null:i)}
              style={{ background:C.surface,borderRadius:12,padding:"14px 16px",marginBottom:10,
                border:`1px solid ${open?g.color+"66":C.border}`,cursor:"pointer",transition:"border-color .2s" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:g.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{g.icon}</div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{g.name}</div>
                    <div style={{ fontSize:11,color:C.sub }}>{fmt(g.saved)} / {fmt(g.target)}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:18,fontWeight:800,color:g.color }}>{pct}%</div>
                  <div style={{ fontSize:10,color:C.sub }}>ETA {g.eta}</div>
                </div>
              </div>
              <div style={{ marginTop:10 }}><ProgressBar pct={pct} color={g.color} /></div>
              {open && (
                <div style={{ marginTop:14,padding:"12px 0",borderTop:`1px solid ${C.border}` }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                    {[{ label:"Remaining",val:fmt(g.target-g.saved) },{ label:"Monthly Need",val:fmt(Math.round((g.target-g.saved)/4)) },{ label:"On Track",val:pct>40?"✅ Yes":"⚠️ Low" }].map(s=>(
                      <div key={s.label} style={{ background:C.card,borderRadius:8,padding:"8px 10px",textAlign:"center" }}>
                        <div style={{ fontSize:11,color:C.sub,marginBottom:2 }}>{s.label}</div>
                        <div style={{ fontSize:13,fontWeight:700,color:C.text }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>
      <Card glow={C.purple}>
        <SectionTitle>🏆 Savings Challenges</SectionTitle>
        {[
          { name:"30-Day No-Spend",joined:142,color:C.purple,active:true },
          { name:"$1K Emergency Fund",joined:89,color:C.blue,active:false },
          { name:"Cut Subscriptions Week",joined:67,color:C.rose,active:false },
        ].map(ch=>(
          <div key={ch.name} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"12px 14px",background:C.surface,borderRadius:10,marginBottom:8,
            border:`1px solid ${ch.active?ch.color+"66":C.border}` }}>
            <div>
              <div style={{ fontSize:13,fontWeight:600,color:C.text }}>{ch.name}</div>
              <div style={{ fontSize:11,color:C.sub }}>{ch.joined} participants</div>
            </div>
            <button style={{ background:ch.active?ch.color:C.border,color:ch.active?"#000":C.sub,
              border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer" }}>
              {ch.active?"Joined ✓":"Join"}
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}
