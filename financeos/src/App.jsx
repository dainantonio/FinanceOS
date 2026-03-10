import { useState } from "react";
import { C } from "./constants/colors";
import BottomNav,{ TABS } from "./components/BottomNav";
import HomeScreen from "./screens/HomeScreen";
import SpendingScreen from "./screens/SpendingScreen";
import GoalsScreen from "./screens/GoalsScreen";
import InvestmentsScreen from "./screens/InvestmentsScreen";
import GivingScreen from "./screens/GivingScreen";
import AICoachScreen from "./screens/AICoachScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SubsScreen from "./screens/SubsScreen";
const TITLES={ home:"FinanceOS",spending:"Spending",goals:"Goals",invest:"Investments",giving:"Giving",coach:"AI Coach",settings:"Dashboard",subs:"Subscriptions" };
export default function App() {
  const [tab,setTab]=useState("home");
  const [faithMode,setFaithMode]=useState(true);
  const screens={
    home:<HomeScreen faithMode={faithMode} />,
    spending:<SpendingScreen />,
    goals:<GoalsScreen />,
    invest:<InvestmentsScreen />,
    giving:<GivingScreen />,
    coach:<AICoachScreen />,
    settings:<SettingsScreen faithMode={faithMode} setFaithMode={setFaithMode} />,
    subs:<SubsScreen />,
  };
  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:420,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative" }}>
      <div style={{ position:"sticky",top:0,zIndex:100,background:C.bg+"EE",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"14px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontSize:18,fontWeight:800,color:C.text,letterSpacing:"-.02em" }}>{TITLES[tab]}{tab==="home"&&<span style={{ color:C.accent }}>.</span>}</div>
          {tab==="home"&&<div style={{ fontSize:11,color:C.sub }}>Tuesday, March 10, 2026</div>}
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          {faithMode&&<span style={{ fontSize:16 }}>✝️</span>}
          <div style={{ width:34,height:34,borderRadius:10,background:C.accent+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.accent }}>D</div>
        </div>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"16px 16px 90px" }}>{screens[tab]}</div>
      <BottomNav tab={tab} setTab={setTab} />
      <style>{`* { box-sizing:border-box; -webkit-tap-highlight-color:transparent; } body { margin:0; background:${C.bg}; } ::-webkit-scrollbar { width:0; } input::placeholder { color:${C.muted}; }`}</style>
    </div>
  );
}
