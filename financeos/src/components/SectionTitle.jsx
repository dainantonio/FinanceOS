import { C } from "../constants/colors";

export default function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.sub, letterSpacing:".08em",
        textTransform:"uppercase" }}>
        {children}
      </div>
      {action && (
        <div onClick={onAction}
          style={{ fontSize:11, color:C.accent, fontWeight:600, cursor:"pointer",
            letterSpacing:".02em" }}>
          {action}
        </div>
      )}
    </div>
  );
}
