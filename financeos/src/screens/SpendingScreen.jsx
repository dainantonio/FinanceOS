import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { SPENDING,WEEKLY_SPEND } from "../data/mockData";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";
const BUDGET=5000;
export default function SpendingScreen() {
  const maxAmt=Math.max(...WEEKLY_SPEND.map(d=>d.amt));
  const total=SPENDING.reduce((s,c)=>s+c.amount,0);
  return (
    <div>
      <Card>
        <SectionTitle>Monthly Overview</SectionTitle>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16 }}>
          <div><div style={{ fontSize:11,color:C.sub }}>Total Spent</div><div style={{ fontSize:28,fontWeight:800,color:C.text }}>{fmt(total)}</div></div>
          <div style={{ textAlign:"right" }}><div style={{ fontSize:11,color:C.sub }}>Budget</div><div style={{ fontSize:18,fontWeight:700,color:C.green }}>{fmt(BUDGET)}</div></div>
        </div>
        <ProgressBar pct={Math.round((total/BUDGET)*100)} color={total>BUDGET?C.rose:C.accent} />
        <div style={{ marginTop:6,fontSize:11,color:C.sub }}>{fmt(BUDGET-total)} remaining this month</div>
      </Card>
      <Card>
        <SectionTitle>This Week</SectionTitle>
        <div style={{ display:"flex",alignItems:"flex-end",gap:6,height:80,paddingBottom:20 }}>
          {WEEKLY_SPEND.map((d,i)=>{
            const h=(d.amt/maxAmt)*60,isToday=i===4;
            return (
              <div key={d.day} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                <div style={{ width:"100%",height:h,background:isToday?C.accent:C.border,borderRadius:"4px 4px 0 0",transition:"height .6s cubic-bezier(.4,0,.2,1)",position:"relative" }}>
                  {isToday && <div style={{ position:"absolute",top:-4,left:"50%",transform:"translateX(-50%)",width:6,height:6,borderRadius:"50%",background:C.accent }} />}
                </div>
                <div style={{ fontSize:10,color:isToday?C.accent:C.sub }}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <SectionTitle>By Category</SectionTitle>
        {SPENDING.map(s=>(
          <div key={s.cat} style={{ marginBottom:12 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:16 }}>{s.icon}</span><span style={{ fontSize:13,color:C.text }}>{s.cat}</span></div>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}><span style={{ fontSize:12,color:C.sub }}>{s.pct}%</span><span style={{ fontSize:13,fontWeight:700,color:s.color }}>{fmt(s.amount)}</span></div>
            </div>
            <ProgressBar pct={s.pct*2.5} color={s.color} />
          </div>
        ))}
      </Card>
      <Card glow={C.rose}>
        <SectionTitle>🔍 Financial Leak Detector</SectionTitle>
        {[
          { label:"Food Delivery",waste:320,tip:"Cook 2 extra meals/week → save $140/mo" },
          { label:"Impulse Shopping",waste:94,tip:"48h rule before purchases → save $94/mo" },
          { label:"Unused Subs",waste:168,tip:"Cancel 3 unused services → save $168/mo" },
        ].map(l=>(
          <div key={l.label} style={{ background:C.surface,borderRadius:10,padding:"12px 14px",marginBottom:10,borderLeft:`3px solid ${C.rose}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
              <span style={{ fontSize:13,fontWeight:600,color:C.text }}>{l.label}</span>
              <span style={{ fontSize:13,fontWeight:700,color:C.rose }}>${l.waste}/mo</span>
            </div>
            <div style={{ fontSize:12,color:C.sub }}>{l.tip}</div>
          </div>
        ))}
        <div style={{ background:C.rose+"15",borderRadius:10,padding:"10px 14px",border:`1px solid ${C.rose}33`,textAlign:"center" }}>
          <div style={{ fontSize:12,color:C.sub }}>Potential yearly savings</div>
          <div style={{ fontSize:22,fontWeight:800,color:C.rose }}>$8,064</div>
        </div>
      </Card>
    </div>
  );
}
