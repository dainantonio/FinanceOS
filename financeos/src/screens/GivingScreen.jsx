import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { USER,GIVING } from "../data/mockData";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";
const TITHE_GOAL=10;
export default function GivingScreen() {
  const totalGiving=GIVING.reduce((s,g)=>s+g.amount,0);
  const givingPct=Math.round((totalGiving/USER.monthlyIncome)*100);
  return (
    <div>
      <Card glow={C.accent} style={{ background:"linear-gradient(135deg,#001A17 0%,#001210 100%)" }}>
        <SectionTitle>This Month's Giving</SectionTitle>
        <div style={{ fontSize:36,fontWeight:800,color:C.accent,marginBottom:6 }}>{fmt(totalGiving)}</div>
        <div style={{ fontSize:13,color:C.sub,marginBottom:12 }}>{givingPct}% of monthly income · Goal: {TITHE_GOAL}%</div>
        <ProgressBar pct={(givingPct/TITHE_GOAL)*100} color={C.accent} />
        <div style={{ marginTop:8,fontSize:12,color:C.sub }}>{fmt((USER.monthlyIncome*TITHE_GOAL/100)-totalGiving)} remaining to reach tithe goal</div>
      </Card>
      <Card>
        <SectionTitle>Giving Log</SectionTitle>
        {GIVING.map((g,i)=>(
          <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:C.accent+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🤲</div>
              <div><div style={{ fontSize:13,fontWeight:600,color:C.text }}>{g.name}</div><div style={{ fontSize:11,color:C.sub }}>{g.date}</div></div>
            </div>
            <div style={{ fontSize:15,fontWeight:700,color:C.accent }}>{fmt(g.amount)}</div>
          </div>
        ))}
      </Card>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
        <Card style={{ marginBottom:0,textAlign:"center" }}><div style={{ fontSize:11,color:C.sub,marginBottom:4 }}>YTD Giving</div><div style={{ fontSize:20,fontWeight:800,color:C.accent }}>{fmt(4180)}</div></Card>
        <Card style={{ marginBottom:0,textAlign:"center" }}><div style={{ fontSize:11,color:C.sub,marginBottom:4 }}>Giving Score</div><div style={{ fontSize:20,fontWeight:800,color:C.green }}>A+</div></Card>
      </div>
      <Card>
        <SectionTitle>📊 Yearly Projection</SectionTitle>
        <div style={{ fontSize:13,color:C.sub,marginBottom:12 }}>At your current pace, you'll give <span style={{ color:C.accent,fontWeight:700 }}>{fmt(10050)}</span> this year. That's <span style={{ color:C.green,fontWeight:700 }}>9.8% of income</span> — nearly at your tithe goal!</div>
        <div style={{ background:C.surface,borderRadius:10,padding:"12px 14px",borderLeft:`3px solid ${C.gold}` }}>
          <div style={{ fontSize:12,color:C.gold,fontWeight:700,marginBottom:4 }}>✝️ Stewardship Note</div>
          <div style={{ fontSize:12,color:C.sub,lineHeight:1.5 }}>Giving consistently is one of the strongest indicators of long-term financial peace. You're building a generous life.</div>
        </div>
      </Card>
    </div>
  );
}
