import { C } from "../constants/colors";

export default function ProgressBar({ pct = 0, color = C.accent, height = 6 }) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <div style={{ height, background:C.border, borderRadius:99, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${clamped}%`, background:color,
        borderRadius:99, transition:"width .8s cubic-bezier(.4,0,.2,1)",
        boxShadow:`0 0 8px ${color}60` }} />
    </div>
  );
}
