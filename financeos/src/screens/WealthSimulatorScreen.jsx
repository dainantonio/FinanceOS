import { useState, useMemo } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";

const INFLATION_RATE = 0.03;

function compound(principal, monthly, rate, years) {
  const r = rate / 100 / 12;
  if (r === 0) return principal + monthly * 12 * years;
  return principal * Math.pow(1 + r, years * 12) +
    monthly * ((Math.pow(1 + r, years * 12) - 1) / r);
}

function inflationAdj(value, years) {
  return value / Math.pow(1 + INFLATION_RATE, years);
}

function RetirementScore({ score }) {
  const color = score >= 80 ? C.green : score >= 50 ? C.gold : C.rose;
  const label = score >= 80 ? "On Track 🎯" : score >= 50 ? "Getting There ⚡" : "Needs Work ⚠️";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, fontWeight: 800, color, letterSpacing: "-.03em" }}>{score}</div>
      <div style={{ fontSize: 12, color, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>Retirement Readiness Score</div>
    </div>
  );
}

function MiniChart({ data, color, color2 }) {
  const max = Math.max(...data.flatMap(d => [d.a, d.b || 0]));
  const W = 300, H = 100;
  const pts = (key, col) => {
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - (d[key] / max) * H;
      return `${x},${y}`;
    }).join(" ");
    const first = data[0];
    const last  = data[data.length - 1];
    const x0 = 0, xN = W;
    const y0 = H - (first[key] / max) * H;
    const yN = H - (last[key]  / max) * H;
    return { points, fill: `M0,${H} L${x0},${y0} L${points.split(" ").slice(1).join(" ")} L${xN},${H} Z`, line: `M${x0},${y0} L${points.split(" ").slice(1).join(" ")}` };
  };

  const a = pts("a", color);
  const b = data[0].b !== undefined ? pts("b", color2) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:80, overflow:"visible" }}>
      {/* Grid lines */}
      {[0.25,0.5,0.75].map(t => (
        <line key={t} x1={0} y1={H*t} x2={W} y2={H*t}
          stroke={C.border} strokeWidth={1} />
      ))}
      {/* Area A */}
      <path d={a.fill} fill={color} opacity={0.08} />
      <polyline points={a.points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {/* Area B */}
      {b && <>
        <path d={b.fill} fill={color2} opacity={0.06} />
        <polyline points={b.points} fill="none" stroke={color2} strokeWidth={2} strokeDasharray="5,3" strokeLinejoin="round" />
      </>}
    </svg>
  );
}

export default function WealthSimulatorScreen({ profile }) {
  const faithMode = profile?.faith_mode ?? true;

  // Scenario A
  const [startA,    setStartA]    = useState(String(profile?.cash || 1000));
  const [monthlyA,  setMonthlyA]  = useState("500");
  const [returnA,   setReturnA]   = useState("7");

  // Scenario B
  const [compareOn, setCompareOn] = useState(false);
  const [startB,    setStartB]    = useState(String(profile?.cash || 1000));
  const [monthlyB,  setMonthlyB]  = useState("1000");
  const [returnB,   setReturnB]   = useState("7");

  const [inflAdj,   setInflAdj]   = useState(false);
  const [years,     setYears]     = useState(30);

  const MILESTONES = [5, 10, 20, 30];

  const resultsA = useMemo(() => MILESTONES.map(y => {
    const raw = compound(parseFloat(startA)||0, parseFloat(monthlyA)||0, parseFloat(returnA)||0, y);
    return { years: y, value: inflAdj ? inflationAdj(raw, y) : raw };
  }), [startA, monthlyA, returnA, inflAdj]);

  const resultsB = useMemo(() => compareOn ? MILESTONES.map(y => {
    const raw = compound(parseFloat(startB)||0, parseFloat(monthlyB)||0, parseFloat(returnB)||0, y);
    return { years: y, value: inflAdj ? inflationAdj(raw, y) : raw };
  }) : [], [startB, monthlyB, returnB, inflAdj, compareOn]);

  // Chart data - year by year
  const chartData = useMemo(() => Array.from({ length: years + 1 }, (_, i) => {
    const a = compound(parseFloat(startA)||0, parseFloat(monthlyA)||0, parseFloat(returnA)||0, i);
    const b = compareOn ? compound(parseFloat(startB)||0, parseFloat(monthlyB)||0, parseFloat(returnB)||0, i) : undefined;
    return {
      a: inflAdj ? inflationAdj(a, i) : a,
      b: b !== undefined ? (inflAdj ? inflationAdj(b, i) : b) : undefined,
    };
  }), [startA, monthlyA, returnA, startB, monthlyB, returnB, inflAdj, compareOn, years]);

  // Retirement score — based on 25x annual expenses rule (4% withdrawal)
  const finalA        = resultsA[resultsA.length - 1]?.value || 0;
  const annualIncome  = (profile?.monthly_income || 5000) * 12;
  const retireTarget  = annualIncome * 25;
  const retireScore   = Math.min(Math.round((finalA / retireTarget) * 100), 99);

  // Faith projection — 10% giving on final balance interest
  const annualReturn  = (parseFloat(returnA) || 7) / 100;
  const annualGiving  = finalA * annualReturn * 0.1;

  function InputField({ label, value, onChange, prefix, suffix }) {
    return (
      <div>
        <label style={{ fontSize:11, color:C.sub, fontWeight:600, display:"block", marginBottom:4 }}>{label}</label>
        <div style={{ position:"relative" }}>
          {prefix && <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.sub, fontSize:13 }}>{prefix}</span>}
          <input type="number" value={value} onChange={e => onChange(e.target.value)}
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:8, padding:`10px ${suffix?"28px":"10px"} 10px ${prefix?"24px":"10px"}`,
              color:C.text, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          {suffix && <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:C.sub, fontSize:13 }}>{suffix}</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <SectionTitle>Wealth Simulator</SectionTitle>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, color:C.sub }}>Inflation adj.</span>
            <div onClick={() => setInflAdj(v => !v)}
              style={{ width:36, height:20, borderRadius:99, background: inflAdj ? C.accent : C.border,
                position:"relative", cursor:"pointer", transition:"background .2s" }}>
              <div style={{ position:"absolute", top:2, left: inflAdj ? 18 : 2, width:16, height:16,
                borderRadius:"50%", background:"#fff", transition:"left .2s" }} />
            </div>
          </div>
        </div>
        <div style={{ fontSize:12, color:C.sub }}>See where your money goes over time</div>
      </Card>

      {/* Scenario A Inputs */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.accent }}>● Scenario A</div>
          <button onClick={() => setCompareOn(v => !v)}
            style={{ background: compareOn ? C.rose+"20" : C.blue+"20",
              border:`1px solid ${compareOn ? C.rose+"44" : C.blue+"44"}`,
              borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700,
              color: compareOn ? C.rose : C.blue, cursor:"pointer", fontFamily:"inherit" }}>
            {compareOn ? "Remove B" : "+ Compare"}
          </button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          <InputField label="Starting $" value={startA}   onChange={setStartA}   prefix="$" />
          <InputField label="Monthly $"  value={monthlyA} onChange={setMonthlyA} prefix="$" />
          <InputField label="Return"     value={returnA}  onChange={setReturnA}  suffix="%" />
        </div>
      </Card>

      {/* Scenario B Inputs */}
      {compareOn && (
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:C.blue, marginBottom:14 }}>● Scenario B</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <InputField label="Starting $" value={startB}   onChange={setStartB}   prefix="$" />
            <InputField label="Monthly $"  value={monthlyB} onChange={setMonthlyB} prefix="$" />
            <InputField label="Return"     value={returnB}  onChange={setReturnB}  suffix="%" />
          </div>
        </Card>
      )}

      {/* Chart */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <SectionTitle>Growth Curve</SectionTitle>
          <div style={{ display:"flex", gap:6 }}>
            {[10,20,30].map(y => (
              <button key={y} onClick={() => setYears(y)}
                style={{ background: years===y ? C.accent+"20" : "none",
                  border:`1px solid ${years===y ? C.accent+"60" : C.border}`,
                  borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:600,
                  color: years===y ? C.accent : C.sub, cursor:"pointer", fontFamily:"inherit" }}>
                {y}yr
              </button>
            ))}
          </div>
        </div>

        {/* Y axis labels */}
        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"space-between",
            height:80, paddingBottom:0, minWidth:40 }}>
            {[1, 0.75, 0.5, 0.25].map(t => {
              const max = Math.max(...chartData.map(d => Math.max(d.a, d.b||0)));
              return <div key={t} style={{ fontSize:9, color:C.muted }}>{fmt(max*t).replace(".00","")}</div>;
            })}
          </div>
          <div style={{ flex:1 }}>
            <MiniChart data={chartData} color={C.accent} color2={C.blue} />
          </div>
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:16, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:16, height:2, background:C.accent, borderRadius:99 }} />
            <span style={{ fontSize:11, color:C.sub }}>Scenario A</span>
          </div>
          {compareOn && (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:16, height:2, background:C.blue, borderRadius:99, borderTop:"2px dashed "+C.blue }} />
              <span style={{ fontSize:11, color:C.sub }}>Scenario B</span>
            </div>
          )}
          {inflAdj && <span style={{ fontSize:10, color:C.muted }}>*inflation adjusted</span>}
        </div>
      </Card>

      {/* Milestones */}
      <Card>
        <SectionTitle>Projected Value</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {resultsA.map((r, i) => (
            <div key={r.years} style={{ background:C.surface, borderRadius:10, padding:"12px 14px",
              border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, color:C.sub, marginBottom:4 }}>{r.years} Years</div>
              <div style={{ fontSize:16, fontWeight:800, color:C.accent }}>{fmt(r.value)}</div>
              {compareOn && resultsB[i] && (
                <div style={{ fontSize:13, fontWeight:700, color:C.blue, marginTop:2 }}>
                  {fmt(resultsB[i].value)}
                  <span style={{ fontSize:10, color: resultsB[i].value > r.value ? C.green : C.rose, marginLeft:6 }}>
                    {resultsB[i].value > r.value ? "+" : ""}{fmt(resultsB[i].value - r.value)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Retirement Readiness */}
      <Card>
        <SectionTitle>Retirement Readiness</SectionTitle>
        <RetirementScore score={retireScore} />
        <div style={{ marginTop:16, background:C.surface, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:12, color:C.sub }}>Projected at {years} yrs</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.accent }}>{fmt(finalA)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:12, color:C.sub }}>Retirement target (25x)</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{fmt(retireTarget)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:12, color:C.sub }}>Gap</span>
            <span style={{ fontSize:12, fontWeight:700, color: finalA >= retireTarget ? C.green : C.rose }}>
              {finalA >= retireTarget ? "✅ Funded!" : `-${fmt(retireTarget - finalA)}`}
            </span>
          </div>
        </div>
        <div style={{ marginTop:10, fontSize:12, color:C.sub, lineHeight:1.6,
          background:C.surface, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}>
          Based on 25x annual income rule. Increase monthly contributions or return rate to improve your score.
        </div>
      </Card>

      {/* Faith Mode Projection */}
      {faithMode && (
        <Card>
          <div style={{ background:"linear-gradient(135deg,#1A1500,#100D00)", borderRadius:12,
            padding:"20px", border:`1px solid ${C.gold}33` }}>
            <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:8 }}>
              ✝️ Kingdom Impact Projection
            </div>
            <div style={{ fontSize:13, color:"#A89060", lineHeight:1.7, marginBottom:12 }}>
              If you gave <span style={{ color:C.gold, fontWeight:700 }}>10%</span> of your annual
              investment returns at year {years}, that would be{" "}
              <span style={{ color:C.gold, fontWeight:700 }}>{fmt(annualGiving)}/year</span> toward
              the Kingdom — enough to{" "}
              {annualGiving > 50000 ? "fund a missionary family and build a school" :
               annualGiving > 10000 ? "sponsor 20+ children and support a church plant" :
               annualGiving > 2000  ? "sponsor several children and fund local outreach" :
               "make a meaningful impact in your community"}.
            </div>
            <div style={{ fontSize:12, color:C.gold, fontStyle:"italic", borderTop:`1px solid ${C.gold}22`,
              paddingTop:10 }}>
              "Store up for yourselves treasures in heaven." — Matthew 6:20
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
