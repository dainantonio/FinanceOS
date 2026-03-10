import { C } from "../constants/colors";
export default function ScoreRing({ score }) {
  const r=28,circ=2*Math.PI*r,dash=(score/100)*circ;
  const color=score>=75?C.accent:score>=50?C.gold:C.rose;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform:"rotate(-90deg)" }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke={C.border} strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="14" fontWeight="700"
        style={{ transform:"rotate(90deg) translate(0,-72px)",transformOrigin:"36px 36px" }}>
        {score}
      </text>
    </svg>
  );
}
