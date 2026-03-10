import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { USER,SPENDING,GOALS,INVESTMENTS,GIVING,SCRIPTURES,AI_INSIGHTS } from "../data/mockData";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";
import ScoreRing from "../components/ScoreRing";
export default function HomeScreen({ faithMode }) {
  const scripture=SCRIPTURES[new Date().getDay()%SCRIPTURES.length];
  const totalPortfolio=INVESTMENTS.reduce((s,i)=>s+i.value,0);
  const totalGiving=GIVING.reduce((s,g)=>s+g.amount,0);
  return (
    <div>
      <Card glow={C.accent} style={{ background:"linear-gradient(135deg,#0D1B2E 0%,#111827 100%)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:13,color:C.sub,marginBottom:4 }}>Good morning,</div>
            <div style={{ fontSize:24,fontWeight:800,color:C.text,letterSpacing:"-.02em",marginBottom:12 }}>{USER.name} 👋</div>
            <div style={{ fontSize:12,color:C.sub,marginBottom:2 }}>Net Worth</div>
            <div style={{ fontSize:30,fontWeight:800,color:C.accent,letterSpacing:"-.03em" }}>{fmt(USER.netWorth)}</div>
            <div style={{ marginTop:8,display:"flex",gap:16 }}>
              <div><div style={{ fontSize:11,color:C.sub }}>Cash Available</div><div style={{ fontSize:15,fontWeight:700,color:C.text }}>{fmt(USER.cash)}</div></div>
              <div><div style={{ fontSize:11,color:C.sub }}>Monthly Income</div><div style={{ fontSize:15,fontWeight:700,color:C.text }}>{fmt(USER.monthlyIncome)}</div></div>
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <ScoreRing score={USER.score} />
            <div style={{ fontSize:10,color:C.sub,marginTop:4,letterSpacing:".04em" }}>STEWARDSHIP</div>
          </div>
        </div>
      </Card>
      {faithMode && (
        <Card glow={C.gold} style={{ background:"linear-gradient(135deg,#1A1500 0%,#1A1200 100%)",borderColor:C.gold+"44" }}>
          <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
            <span style={{ fontSize:22 }}>✝️</span>
            <div>
              <div style={{ fontSize:11,color:C.gold,fontWeight:700,letterSpacing:".08em",marginBottom:6 }}>{scripture.ref.toUpperCase()}</div>
              <div style={{ fontSize:14,color:C.text,fontStyle:"italic",lineHeight:1.5,marginBottom:8 }}>"{scripture.text}"</div>
              <div style={{ fontSize:12,color:C.sub,lineHeight:1.5,marginBottom:8 }}>{scripture.reflection}</div>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ width:3,height:3,borderRadius:"50%",background:C.gold }} />
                <div style={{ fontSize:11,color:C.gold,fontWeight:600 }}>Action: {scripture.action}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
      <Card>
        <SectionTitle>Daily Financial Brief</SectionTitle>
        <div style={{ fontSize:12,color:C.sub,marginBottom:10 }}>Yesterday's Spending</div>
        <div style={{ fontSize:28,fontWeight:800,color:C.text,marginBottom:14 }}>$412.50</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:14 }}>
          {SPENDING.slice(0,4).map(s=>(
            <div key={s.cat} style={{ background:s.color+"15",border:`1px solid ${s.color}33`,borderRadius:8,padding:"6px 10px",fontSize:11 }}>
              <span>{s.icon} </span><span style={{ color:s.color,fontWeight:600 }}>{s.cat}</span><span style={{ color:C.sub }}> ${s.amount}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize:12,color:C.sub,marginBottom:8,fontWeight:600,letterSpacing:".04em" }}>🤖 AI INSIGHTS</div>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {AI_INSIGHTS.slice(0,3).map((ins,i)=>(
            <div key={i} style={{ background:C.surface,borderRadius:10,padding:"10px 12px",fontSize:12,color:C.text,lineHeight:1.5,border:`1px solid ${C.border}` }}>{ins}</div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle action="See All →">Goals Progress</SectionTitle>
        {GOALS.map(g=>{
          const pct=Math.round((g.saved/g.target)*100);
          return (
            <div key={g.name} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontSize:16 }}>{g.icon}</span>
                  <span style={{ fontSize:13,fontWeight:600,color:C.text }}>{g.name}</span>
                </div>
                <div style={{ fontSize:12,color:C.sub }}>ETA: <span style={{ color:g.color }}>{g.eta}</span></div>
              </div>
              <ProgressBar pct={pct} color={g.color} />
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
                <span style={{ fontSize:11,color:C.sub }}>{fmt(g.saved)} saved</span>
                <span style={{ fontSize:11,color:C.sub }}>{fmt(g.target)} goal · {pct}%</span>
              </div>
            </div>
          );
        })}
      </Card>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
        <Card style={{ marginBottom:0,textAlign:"center" }}>
          <div style={{ fontSize:22 }}>📈</div>
          <div style={{ fontSize:18,fontWeight:800,color:C.green,marginTop:4 }}>{fmt(totalPortfolio)}</div>
          <div style={{ fontSize:11,color:C.sub,marginTop:2 }}>Portfolio</div>
        </Card>
        <Card style={{ marginBottom:0,textAlign:"center" }}>
          <div style={{ fontSize:22 }}>🤲</div>
          <div style={{ fontSize:18,fontWeight:800,color:C.accent,marginTop:4 }}>{fmt(totalGiving)}</div>
          <div style={{ fontSize:11,color:C.sub,marginTop:2 }}>Giving This Month</div>
        </Card>
      </div>
    </div>
  );
}
