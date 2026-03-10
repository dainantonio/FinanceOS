import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { C } from "./constants/colors";
import BottomNav, { TABS } from "./components/BottomNav";
import AuthScreen       from "./screens/AuthScreen";
import HomeScreen       from "./screens/HomeScreen";
import SpendingScreen   from "./screens/SpendingScreen";
import GoalsScreen      from "./screens/GoalsScreen";
import InvestmentsScreen from "./screens/InvestmentsScreen";
import GivingScreen     from "./screens/GivingScreen";
import AICoachScreen    from "./screens/AICoachScreen";
import SettingsScreen   from "./screens/SettingsScreen";
import SubsScreen       from "./screens/SubsScreen";

const TITLES = {
  home:"FinanceOS",spending:"Spending",goals:"Goals",
  invest:"Investments",giving:"Giving",coach:"AI Coach",
  settings:"Dashboard",subs:"Subscriptions",
};

export default function App() {
  const [session,setSession]     = useState(undefined);
  const [tab,setTab]             = useState("home");
  const [faithMode,setFaithMode] = useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>setSession(session));
    return ()=>subscription.unsubscribe();
  },[]);

  async function handleSignOut(){ await supabase.auth.signOut(); }

  if(session===undefined) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:13,color:C.sub}}>Loading...</div>
    </div>
  );

  if(!session) return <AuthScreen />;

  const user = session.user;
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();

  const screens = {
    home:     <HomeScreen faithMode={faithMode} userName={displayName} />,
    spending: <SpendingScreen />,
    goals:    <GoalsScreen />,
    invest:   <InvestmentsScreen />,
    giving:   <GivingScreen />,
    coach:    <AICoachScreen />,
    settings: <SettingsScreen faithMode={faithMode} setFaithMode={setFaithMode} onSignOut={handleSignOut} />,
    subs:     <SubsScreen />,
  };

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:C.bg,color:C.text,minHeight:"100vh",maxWidth:420,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative"}}>
      <div style={{position:"sticky",top:0,zIndex:100,background:C.bg+"EE",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"14px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:C.text,letterSpacing:"-.02em"}}>
            {TITLES[tab]}{tab==="home"&&<span style={{color:C.accent}}>.</span>}
          </div>
          {tab==="home"&&<div style={{fontSize:11,color:C.sub}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {faithMode&&<span style={{fontSize:16}}>✝️</span>}
          <div onClick={()=>setTab("settings")} title={`Signed in as ${user.email}`}
            style={{width:34,height:34,borderRadius:10,background:C.accent+"20",border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.accent,cursor:"pointer"}}>
            {initials}
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 90px"}}>{screens[tab]}</div>
      <BottomNav tab={tab} setTab={setTab} />
      <style>{`* { box-sizing:border-box; -webkit-tap-highlight-color:transparent; } body { margin:0; background:${C.bg}; } ::-webkit-scrollbar { width:0; } input::placeholder { color:${C.muted}; }`}</style>
    </div>
  );
}
