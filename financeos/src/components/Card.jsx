import { C } from "../constants/colors";
export default function Card({ children, style = {}, glow }) {
  return (
    <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,
      padding:"18px 20px",marginBottom:14,
      boxShadow:glow?`0 0 24px ${glow}22`:"0 2px 8px #00000040",...style }}>
      {children}
    </div>
  );
}
