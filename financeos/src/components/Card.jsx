import { C } from "../constants/colors";

export default function Card({ children, style = {}, glow, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: "20px",
        marginBottom: 14,
        boxShadow: glow
          ? `0 0 32px ${glow}18, 0 4px 16px #00000050`
          : "0 4px 16px #00000040",
        transition: "transform .15s, box-shadow .15s",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 6px 24px #00000060`; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 16px #00000040"; } : undefined}
    >
      {children}
    </div>
  );
}
