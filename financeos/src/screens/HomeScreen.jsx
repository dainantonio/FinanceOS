import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import { useGoals, useSpending, useGiving } from "../hooks/useSupabase";
import { SCRIPTURES, AI_INSIGHTS } from "../data/mockData";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import ProgressBar from "../components/ProgressBar";
import ScoreRing from "../components/ScoreRing";

const GOAL_COLORS = [C.blue, C.gold, C.accent, C.rose, C.green, "#8B5CF6", "#F97316", "#EC4899"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

export default function HomeScreen({ profile }) {
  const userId    = profile?.id;
  const faithMode = profile?.faith_mode ?? true;

  const { goals }                          = useGoals(userId);
  const { totalThisMonth: totalSpending }  = useSpending(userId);
  const { totalThisMonth: totalGiving }    = useGiving(userId);

  const scripture  = SCRIPTURES[new Date().getDay() % SCRIPTURES.length];
  const name       = profile?.full_name || "Friend";
  const netWorth   = profile?.net_worth   || 0;
  const cash       = profile?.cash        || 0;
  const income     = profile?.monthly_income || 0;

  // Simple stewardship score from real data
  const savingsRate   = income > 0 ? Math.min((income - totalSpending) / income * 100, 100) : 0;
  const givingRate    = income > 0 ? Math.min((totalGiving / income) * 100, 100) : 0;
  const goalsProgress = goals.length > 0
    ? goals.reduce((s, g) => s + Math.min(Number(g.saved) / Number(g.target), 1), 0) / goals.length * 100
    : 50;
  const score = Math.round(
    Math.min(savingsRate, 40) * 0.4 +
    Math.min(givingRate * 4, 20) +
    goalsProgress * 0.3 +
    10
  );
  const clampedScore = Math.max(Math.min(score, 99), 10);

  return (
    <div>
      {/* Hero Snapshot */}
      <Card glow={C.accent} style={{ background:"linear-gradient(135deg, #0D1B2E 0%, #111827 100%)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:13, color:C.sub, marginBottom:4 }}>{getGreeting()}</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.text, letterSpacing:"-.02em", marginBottom:12 }}>
              {name} 👋
            </div>
            <div style={{ fontSize:12, color:C.sub, marginBottom:2 }}>Net Worth</div>
            <div style={{ fontSize:30, fontWeight:800, color:C.accent, letterSpacing:"-.03em" }}>
              {fmt(netWorth)}
            </div>
            <div style={{ marginTop:8, display:"flex", gap:16 }}>
              <div>
                <div style={{ fontSize:11, color:C.sub }}>Cash Available</div>
                <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{fmt(cash)}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:C.sub }}>Monthly Income</div>
                <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{fmt(income)}</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <ScoreRing score={clampedScore} />
            <div style={{ fontSize:10, color:C.sub, marginTop:4, letterSpacing:".04em" }}>STEWARDSHIP</div>
          </div>
        </div>
      </Card>

      {/* Faith Mode Scripture */}
      {faithMode && (
        <Card glow={C.gold} style={{ background:"linear-gradient(135deg, #1A1500 0%, #1A1200 100%)", borderColor:C.gold+"44" }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:22 }}>✝️</span>
            <div>
              <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".08em", marginBottom:6 }}>
                {scripture.ref.toUpperCase()}
              </div>
              <div style={{ fontSize:14, color:C.text, fontStyle:"italic", lineHeight:1.5, marginBottom:8 }}>
                "{scripture.text}"
              </div>
              <div style={{ fontSize:12, color:C.sub, lineHeight:1.5, marginBottom:8 }}>{scripture.reflection}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:3, height:3, borderRadius:"50%", background:C.gold }} />
                <div style={{ fontSize:11, color:C.gold, fontWeight:600 }}>Action: {scripture.action}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Monthly Snapshot */}
      <Card>
        <SectionTitle>This Month</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {[
            { label:"Spent",   val: fmt(totalSpending), color: totalSpending > income * 0.8 ? C.rose : C.text },
            { label:"Gave",    val: fmt(totalGiving),   color: C.accent },
            { label:"Saved",   val: fmt(Math.max(income - totalSpending, 0)), color: C.green },
          ].map(s => (
            <div key={s.label} style={{ background:C.surface, borderRadius:10, padding:"12px 10px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:C.sub, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:15, fontWeight:800, color:s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        {income > 0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, color:C.sub }}>Budget used</span>
              <span style={{ fontSize:11, color:C.sub }}>{Math.min(Math.round((totalSpending / income) * 100), 100)}%</span>
            </div>
            <ProgressBar pct={Math.min(Math.round((totalSpending / income) * 100), 100)}
              color={totalSpending > income ? C.rose : C.accent} />
          </div>
        )}
      </Card>

      {/* AI Insights */}
      <Card>
        <div style={{ fontSize:12, color:C.sub, marginBottom:8, fontWeight:600, letterSpacing:".04em" }}>
          🤖 AI INSIGHTS
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {AI_INSIGHTS.slice(0, 3).map((ins, i) => (
            <div key={i} style={{ background:C.surface, borderRadius:10, padding:"10px 12px",
              fontSize:12, color:C.text, lineHeight:1.5, border:`1px solid ${C.border}` }}>
              {ins}
            </div>
          ))}
        </div>
      </Card>

      {/* Goals Preview */}
      {goals.length > 0 && (
        <Card>
          <SectionTitle>Goals Progress</SectionTitle>
          {goals.slice(0, 3).map((g, i) => {
            const pct   = Math.min(Math.round((Number(g.saved) / Number(g.target)) * 100), 100);
            const color = GOAL_COLORS[i % GOAL_COLORS.length];
            return (
              <div key={g.id} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16 }}>{g.icon}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{g.name}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color }}>{pct}%</span>
                </div>
                <ProgressBar pct={pct} color={color} />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ fontSize:11, color:C.sub }}>{fmt(g.saved)} saved</span>
                  <span style={{ fontSize:11, color:C.sub }}>{fmt(g.target)} goal</span>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Quick Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <Card style={{ marginBottom:0, textAlign:"center" }}>
          <div style={{ fontSize:22 }}>🎯</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.blue, marginTop:4 }}>{goals.length}</div>
          <div style={{ fontSize:11, color:C.sub, marginTop:2 }}>Active Goals</div>
        </Card>
        <Card style={{ marginBottom:0, textAlign:"center" }}>
          <div style={{ fontSize:22 }}>🤲</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.accent, marginTop:4 }}>{fmt(totalGiving)}</div>
          <div style={{ fontSize:11, color:C.sub, marginTop:2 }}>Giving This Month</div>
        </Card>
      </div>
    </div>
  );
}
