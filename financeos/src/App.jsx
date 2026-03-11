import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useProfile, useGoals } from "./hooks/useSupabase";
import { C } from "./constants/colors";
import BottomNav from "./components/BottomNav";
import AuthScreen        from "./screens/AuthScreen";
import OnboardingScreen  from "./screens/OnboardingScreen";
import HomeScreen        from "./screens/HomeScreen";
import SpendingScreen    from "./screens/SpendingScreen";
import GoalsScreen       from "./screens/GoalsScreen";
import InvestmentsScreen from "./screens/InvestmentsScreen";
import GivingScreen      from "./screens/GivingScreen";
import AICoachScreen     from "./screens/AICoachScreen";
import SettingsScreen    from "./screens/SettingsScreen";
import WealthSimulatorScreen from './screens/WealthSimulatorScreen';
import SubsScreen        from "./screens/SubsScreen";

const TITLES = {
  home:"FinanceOS",spending:"Spending",goals:"Goals",
  invest:"Investments",giving:"Giving",coach:"AI Coach",
  settings:"Settings",subs:"Subscriptions",
};

export default function App() {
  const [session, setSession] = useState(undefined);
  const [tab, setTab]         = useState("home");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  const { profile, loading: profileLoading, updateProfile } = useProfile(userId);
  const { addGoal } = useGoals(userId);

  async function handleOnboardingComplete(profileData, selectedGoals) {
    try {
      const { error: profileError } = await updateProfile(profileData);
      if (profileError) {
        console.error("Profile update error:", profileError);
        alert("Error saving profile: " + profileError.message);
        return;
      }
      for (const goal of selectedGoals) {
        await addGoal({ name: goal.name, icon: goal.icon, target: goal.target, saved: 0 });
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      alert("Something went wrong: " + err.message);
    }
  }

  async function handleSignOut() { await supabase.auth.signOut(); }

  // Loading
  if (session === undefined || (session && profileLoading)) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
        alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:13, color:C.sub }}>Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!session) return <AuthScreen />;

  // First time user — no name set yet
  if (!profile?.full_name) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Logged in + onboarded
  const user = session.user;
  const displayName = profile.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();
  const faithMode = profile.faith_mode ?? true;

  async function handleFaithToggle(val) {
    await updateProfile({ faith_mode: val });
  }

  const screens = {
    home:     <HomeScreen profile={profile} />,
    spending: <SpendingScreen userId={userId} />,
    goals:    <GoalsScreen userId={userId} />,
    invest:   <InvestmentsScreen />,
    giving:   <GivingScreen userId={userId} />,
    coach:    <AICoachScreen profile={profile} />,
    settings: <SettingsScreen profile={profile} updateProfile={updateProfile} faithMode={faithMode} setFaithMode={handleFaithToggle} onSignOut={handleSignOut} />,
    subs:     <SubsScreen />,
    wealth:   <WealthSimulatorScreen profile={profile} />,
  };

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:C.bg, color:C.text,
      minHeight:"100vh", maxWidth:420, margin:"0 auto", display:"flex",
      flexDirection:"column", position:"relative" }}>

      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:C.bg+"EE",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`,
        padding:"14px 20px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:800, color:C.text, letterSpacing:"-.02em" }}>
            {TITLES[tab]}{tab==="home" && <span style={{ color:C.accent }}>.</span>}
          </div>
          {tab==="home" && (
            <div style={{ fontSize:11, color:C.sub }}>
              {new Date().toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" })}
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {faithMode && <span style={{ fontSize:16 }}>✝️</span>}
          <div onClick={() => setTab("settings")} title={user.email}
            style={{ width:34, height:34, borderRadius:10, background:C.accent+"20",
              border:`1px solid ${C.accent}33`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:14, fontWeight:800, color:C.accent, cursor:"pointer" }}>
            {initials}
          </div>
        </div>
      </div>

      {/* Screen */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 90px" }}>
        {screens[tab]}
      </div>

      <BottomNav tab={tab} setTab={setTab} />

      <style>{`
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        body { margin:0; background:${C.bg}; }
        ::-webkit-scrollbar { width:0; }
      `}</style>
    </div>
  );
}
