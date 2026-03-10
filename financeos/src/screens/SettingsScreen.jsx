import { C } from "../constants/colors";
import { USER } from "../data/mockData";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";
import ScoreRing from "../components/ScoreRing";
import Chip from "../components/Chip";
const SCORE_COMPONENTS=[
  { label:"Saving Habits",score:80,color:C.green },
  { label:"Spending Discipline",score:62,color:C.gold },
  { label:"Debt Management",score:75,color:C.blue },
  { label:"Investment Growth",score:78,color:C.accent },
  { label:"Giving Consistency",score:90,color:C.purple },
];
export default function SettingsScreen({ faithMode,setFaithMode }) {
  return (
    <div>
      <Card glow={C.accent}>
        <SectionTitle>Stewardship Score</SectionTitle>
        <div style={{ display:"flex",alignItems:"center",gap:20,marginBottom:16 }}>
          <ScoreRing score={USER.score} />
          <div><div style={{ fontSize:28,fontWeight:800,color:C.text }}>{USER.score}<span style={{ fontSize:14,color:C.sub }}>/100</span></div><Chip label="Good Standing ↑4 this month" color={C.green} /></div>
        </div>
        {SCORE_COMPONENTS.map(c=>(
          <div key={c.label} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
              <span style={{ fontSize:12,color:C.sub }}>{c.label}</span>
              <span style={{ fontSize:12,fontWeight:700,color:c.color }}>{c.score}</span>
            </div>
            <ProgressBar pct={c.score} color={c.color} />
          </div>
        ))}
      </Card>
      <Card glow={faithMode?C.gold:undefined}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:24 }}>✝️</span>
            <div><div style={{ fontSize:14,fontWeight:700,color:C.text }}>Faith Mode</div><div style={{ fontSize:11,color:C.sub }}>Biblical stewardship wisdom on dashboard</div></div>
          </div>
          <div onClick={()=>setFaithMode(f=>!f)} style={{ width:48,height:26,borderRadius:99,cursor:"pointer",background:faithMode?C.gold:C.border,transition:"background .2s",position:"relative" }}>
            <div style={{ position:"absolute",top:3,left:faithMode?25:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px #00000060" }} />
          </div>
        </div>
      </Card>
      <Card>
        <SectionTitle>📋 Monthly Money Leak Report</SectionTitle>
        <div style={{ fontSize:12,color:C.sub,marginBottom:12 }}>March 2026</div>
        {[{ label:"Food delivery overspend",amount:412 },{ label:"Unused subscriptions",amount:168 },{ label:"Impulse purchases",amount:94 }].map(l=>(
          <div key={l.label} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13 }}>
            <span style={{ color:C.sub }}>{l.label}</span><span style={{ color:C.rose,fontWeight:700 }}>${l.amount}</span>
          </div>
        ))}
        <div style={{ display:"flex",justifyContent:"space-between",paddingTop:10,marginTop:4 }}>
          <span style={{ color:C.text,fontWeight:700 }}>Yearly if unchanged</span>
          <span style={{ color:C.rose,fontWeight:800,fontSize:16 }}>$8,064</span>
        </div>
        <button style={{ marginTop:14,width:"100%",background:C.accent+"20",border:`1px solid ${C.accent}44`,borderRadius:10,padding:"10px",color:C.accent,fontSize:13,fontWeight:700,cursor:"pointer" }}>Share Report 📤</button>
      </Card>
    </div>
  );
}
