import { C } from "../constants/colors";
export default function Chip({ label, color = C.accent }) {
  return (
    <span style={{ background:color+"22",color,border:`1px solid ${color}44`,
      borderRadius:99,padding:"2px 10px",fontSize:11,fontWeight:600,letterSpacing:".02em" }}>
      {label}
    </span>
  );
}
