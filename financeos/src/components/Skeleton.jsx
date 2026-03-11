import { C } from "../constants/colors";

export function SkeletonLine({ width = "100%", height = 14, style = {} }) {
  return (
    <div style={{ width, height, borderRadius: 8, background: C.border,
      backgroundImage: `linear-gradient(90deg, ${C.border} 0%, ${C.surface} 50%, ${C.border} 100%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s ease-in-out infinite",
      ...style }} />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20,
      padding:"20px", marginBottom:14 }}>
      <SkeletonLine width="40%" height={10} style={{ marginBottom:16 }} />
      <SkeletonLine height={28} style={{ marginBottom:10 }} />
      <SkeletonLine width="70%" height={10} style={{ marginBottom:10 }} />
      <SkeletonLine height={6} style={{ borderRadius:99 }} />
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0",
      borderBottom:`1px solid ${C.border}` }}>
      <div style={{ width:36, height:36, borderRadius:10, background:C.border,
        backgroundImage:`linear-gradient(90deg,${C.border} 0%,${C.surface} 50%,${C.border} 100%)`,
        backgroundSize:"200% 100%", animation:"shimmer 1.4s ease-in-out infinite", flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <SkeletonLine width="60%" height={12} style={{ marginBottom:6 }} />
        <SkeletonLine width="40%" height={9} />
      </div>
      <SkeletonLine width={50} height={14} />
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
