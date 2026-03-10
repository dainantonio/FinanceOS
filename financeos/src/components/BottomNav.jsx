import { C } from "../constants/colors";
export const TABS = [
  { id:"home",label:"Home",icon:"⬡" },
  { id:"spending",label:"Spend",icon:"💳" },
  { id:"goals",label:"Goals",icon:"🎯" },
  { id:"invest",label:"Invest",icon:"📈" },
  { id:"giving",label:"Giving",icon:"🤲" },
  { id:"coach",label:"Coach",icon:"🤖" },
  { id:"settings",label:"More",icon:"⚙️" },
];
export default function BottomNav({ tab, setTab }) {
  return (
    <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:420,background:C.surface+"F0",backdropFilter:"blur(16px)",
      borderTop:`1px solid ${C.border}`,display:"flex",padding:"8px 4px 12px" }}>
      {TABS.map(t => {
        const active=tab===t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1,background:"none",
            border:"none",cursor:"pointer",display:"flex",flexDirection:"column",
            alignItems:"center",gap:2,padding:"4px 0" }}>
            <div style={{ fontSize:18,opacity:active?1:0.45,
              transform:active?"scale(1.15)":"scale(1)",transition:"all .15s" }}>{t.icon}</div>
            <div style={{ fontSize:9,fontWeight:active?700:400,
              color:active?C.accent:C.muted,letterSpacing:".04em",transition:"color .15s" }}>
              {t.label.toUpperCase()}
            </div>
            {active && <div style={{ width:4,height:4,borderRadius:"50%",background:C.accent,marginTop:1 }} />}
          </button>
        );
      })}
    </div>
  );
}
