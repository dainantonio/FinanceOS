import { C } from "../constants/colors";
export default function SectionTitle({ children, action }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
      <span style={{ fontSize:13,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:C.sub }}>
        {children}
      </span>
      {action && <span style={{ fontSize:12,color:C.accent,cursor:"pointer",fontWeight:600 }}>{action}</span>}
    </div>
  );
}
