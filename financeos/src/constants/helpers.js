export const fmt = (n) => n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
export const fmtDec = (n) => n.toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2});
