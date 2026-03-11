import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useProfile, useGoals } from "./hooks/useSupabase";
import { C } from "./constants/colors";
import BottomNav from "./components/BottomNav";
import AuthScreen            from "./screens/AuthScreen";
import OnboardingScreen      from "./screens/OnboardingScreen";
import HomeScreen            from "./screens/HomeScreen";
import SpendingScreen        from "./screens/SpendingScreen";
import GoalsScreen           from "./screens/GoalsScreen";
import GivingScreen          from "./screens/GivingScreen";
import AICoachScreen         from "./screens/AICoachScreen";
import SettingsScreen        from "./screens/SettingsScreen";
import WealthSimulatorScreen from "./screens/WealthSimulatorScreen";
import ImportScreen          from "./screens/ImportScreen";

const TITLES = {
  home:"FinanceOS", spending:"Spending", goals:"Goals",
  giving:"Giving", coach:"AI Coach", settings:"Settings",
  wealth:"Wealth Simulator", import:"Import Transactions",
};

export default function App() {
  const [session, setSession] = useState(undefined);
  const [tab, setTab]         = useState("home");
  const [faithMode, setFaithMode] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  const { profile, loading: profileLoading, updateProfile } = useProfile(userId);

  async function handleOnboardingComplete(profileData) {
    const { error: profileError } = await updateProfile(profileData);
    if (profileError) console.error(profileError);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setTab("home");
  }

  async function handleFaithToggle(val) {
    setFaithMode(val);
    await updateProfile({ faith_mode: val });
  }

  useEffect(() => {
    if (profile?.faith_mode !== undefined) setFaithMode(profile.faith_mode);
  }, [profile?.faith_mode]);

  if (session === undefined) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      height:"100vh", background:C.bg, color:C.sub, fontSize:14 }}>
      Loading...
    </div>
  );

  if (!session) return <AuthScreen />;

  if (session && !profile?.full_name && !profileLoading) {
    return <OnboardingScreen userId={userId} onComplete={handleOnboardingComplete} />;
  }

  const screens = {
    home:     <HomeScreen    profile={profile} faithMode={faithMode} />,
    spending: <SpendingScreen userId={userId} onImport={() => setTab("import")} />,
    goals:    <GoalsScreen   userId={userId} />,
    giving:   <GivingScreen  userId={userId} />,
    coach:    <AICoachScreen profile={profile} />,
    settings: <SettingsScreen profile={profile} updateProfile={updateProfile} faithMode={faithMode} setFaithMode={handleFaithToggle} onSignOut={handleSignOut} />,
    wealth:   <WealthSimulatorScreen profile={profile} />,
    import:   <ImportScreen  userId={userId} onImportDone={() => setTab("spending")} />,
  };

  return (
    <div style={{ maxWidth:420, margin:"0 auto", minHeight:"100vh", background:C.bg,
      display:"flex", flexDirection:"column", position:"relative" }}>
      {/* Header */}
      <div style={{ padding:"16px 20px 8px", display:"flex", justifyContent:"space-between",
        alignItems:"center", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:18, fontWeight:800, color:C.text, letterSpacing:"-.02em" }}>
          Finance<span style={{ color:C.accent }}>OS</span>
        </div>
        <div style={{ fontSize:13, fontWeight:600, color:C.sub }}>{TITLES[tab]}</div>
      </div>

      {/* Screen */}
      <div key={tab} className="screen-enter"
        style={{ flex:1, overflowY:"auto", padding:"16px 16px 90px" }}>
        {screens[tab]}
      </div>

      <BottomNav tab={tab} setTab={setTab} />

      <style>{`
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        body { margin:0; background:${C.bg}; font-family:'DM Sans',system-ui,sans-serif; }
        ::-webkit-scrollbar { width:0; }
        input,button,select,textarea { font-family:inherit; }
        button:active { transform:scale(0.97) !important; transition:transform .08s !important; }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
        .screen-enter { animation: fadeSlideUp 0.25s ease both; }
      `}</style>
    </div>
  );
}
