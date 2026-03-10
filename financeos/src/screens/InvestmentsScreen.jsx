import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { INVESTMENTS } from "../data/mockData";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import Chip from "../components/Chip";
export default function InvestmentsScreen() {
  const total=INVESTMENTS.reduce((s,i)=>s+i.value,0);
  return (
    <div>
      <Card glow={C.green}>
        <SectionTitle>Portfolio Overview</SectionTitle>
        <div style={{ fontSize:32,fontWeight:800,color:C.text,marginBottom:4 }}>{fmt(total)}</div>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
          <span style={{ fontSize:14,color:C.green,fontWeight:700 }}>▲ +$842 today (+2.1%)</span>
          <Chip label="All Time +18.4%" color={C.green} />
        </div>
        <div style={{ display:"flex",height:8,borderRadius:99,overflow:"hidden",marginBottom:10,gap:2 }}>
          {INVESTMENTS.map(inv=><div key={inv.ticker} style={{ flex:inv.value,background:inv.color,transition:"flex .8s" }} />)}
        </div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
          {INVESTMENTS.map(inv=>(
            <div key={inv.ticker} style={{ display:"flex",alignItems:"center",gap:5,fontSize:11 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:inv.color }} />
              <span style={{ color:C.sub }}>{inv.type}</span>
              <span style={{ color:C.text,fontWeight:600 }}>{Math.round((inv.value/total)*100)}%</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle>Holdings</SectionTitle>
        {INVESTMENTS.map(inv=>(
          <div key={inv.ticker} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:inv.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:inv.color }}>{inv.ticker}</div>
              <div><div style={{ fontSize:14,fontWeight:600,color:C.text }}>{inv.name}</div><Chip label={inv.type} color={inv.color} /></div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:15,fontWeight:700,color:C.text }}>{fmt(inv.value)}</div>
              <div style={{ fontSize:12,color:inv.change>0?C.green:C.rose,fontWeight:600 }}>{inv.change>0?"▲":"▼"} {Math.abs(inv.change)}%</div>
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <SectionTitle>🤖 AI Diversification Tips</SectionTitle>
        {["Your portfolio is 43% in tech. Consider adding Healthcare or Consumer Staples ETFs.",
          "BTC is 10% of your portfolio. Crypto above 5% increases volatility significantly.",
          "Roth IRA contributions are on track. Max out $500 by year-end for full tax benefit."].map((tip,i)=>(
          <div key={i} style={{ background:C.surface,borderRadius:10,padding:"10px 12px",marginBottom:8,fontSize:12,color:C.text,lineHeight:1.5,borderLeft:`3px solid ${C.blue}` }}>{tip}</div>
        ))}
      </Card>
    </div>
  );
}
