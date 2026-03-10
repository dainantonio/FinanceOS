import { C } from "../constants/colors";
import { fmt,fmtDec } from "../constants/helpers";
import { SUBS } from "../data/mockData";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
export default function SubsScreen() {
  const unusedSavings=SUBS.filter(s=>!s.used).reduce((acc,s)=>acc+s.monthly*12,0);
  const monthlyTotal=SUBS.reduce((s,sub)=>s+sub.monthly,0);
  return (
    <div>
      <Card glow={C.rose}>
        <SectionTitle>Subscription Intelligence</SectionTitle>
        <div style={{ display:"flex",gap:16,marginBottom:4 }}>
          <div><div style={{ fontSize:11,color:C.sub }}>Monthly Total</div><div style={{ fontSize:22,fontWeight:800,color:C.text }}>{fmtDec(monthlyTotal)}</div></div>
          <div><div style={{ fontSize:11,color:C.sub }}>Potential Savings</div><div style={{ fontSize:22,fontWeight:800,color:C.rose }}>{fmt(unusedSavings)}/yr</div></div>
        </div>
      </Card>
      <Card>
        <SectionTitle>Active Subscriptions</SectionTitle>
        {SUBS.map(s=>(
          <div key={s.name} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:s.used?C.green+"20":C.rose+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:14,fontWeight:600,color:C.text }}>{s.name}</div>
                <div style={{ fontSize:11,color:s.used?C.green:C.rose }}>{s.used?`✓ Active · ${s.lastUsed}`:`⚠ Unused · ${s.lastUsed}`}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{fmtDec(s.monthly)}/mo</div>
              <div style={{ fontSize:11,color:C.sub }}>{fmt(s.monthly*12)}/yr</div>
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <SectionTitle>🤖 AI Recommendations</SectionTitle>
        {SUBS.filter(s=>!s.used).map(s=>(
          <div key={s.name} style={{ background:C.surface,borderRadius:10,padding:"12px 14px",marginBottom:8,borderLeft:`3px solid ${C.rose}` }}>
            <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:4 }}>Cancel {s.name} {s.icon}</div>
            <div style={{ fontSize:12,color:C.sub,marginBottom:6 }}>Unused for {s.lastUsed} · Annual cost: <span style={{ color:C.rose,fontWeight:600 }}>{fmt(s.monthly*12)}</span></div>
            <div style={{ display:"flex",gap:8 }}>
              <button style={{ background:C.rose+"20",border:`1px solid ${C.rose}44`,borderRadius:8,padding:"5px 12px",fontSize:11,color:C.rose,cursor:"pointer",fontWeight:600 }}>Cancel</button>
              <button style={{ background:C.border,border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,color:C.sub,cursor:"pointer" }}>Keep</button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
