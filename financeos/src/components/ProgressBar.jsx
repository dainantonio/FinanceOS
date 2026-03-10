import { C } from "../constants/colors";
export default function ProgressBar({ pct, color = C.accent }) {
  return (
    <div style={{ height:6,background:C.border,borderRadius:99,overflow:"hidden" }}>
      <div style={{ width:`${pct}%`,height:"100%",background:color,borderRadius:99,
        transition:"width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}
