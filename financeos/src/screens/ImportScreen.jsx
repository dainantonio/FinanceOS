import { useState, useRef } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import { supabase } from "../lib/supabase";

const CATEGORY_PROMPT = (rows) => `
You are a financial transaction categorizer. Given these bank transactions, return a JSON array where each item has:
- "date": the transaction date (YYYY-MM-DD format, convert from M/D/YYYY)
- "note": cleaned merchant name (remove "POS DEBIT", "ACH", card digits, extra spaces, location codes)
- "amount": absolute value as a number (always positive)
- "category": one of: Food, Transport, Shopping, Bills, Entertainment, Health, Travel, Income, Giving, Other

Transactions:
${rows.map((r, i) => `${i}. Date: ${r.date}, Description: ${r.desc}, Amount: ${r.amount}`).join("\n")}

Rules:
- Clean up messy bank descriptions (e.g. "POS DEBIT  WM SUPERCENTER #1478  SOUTH POINT OH" -> "Walmart Supercenter")
- If amount is positive it is income/credit - use "Income" category
- If amount is negative it is an expense
- Always return amount as positive number
- Return ONLY a valid JSON array, no markdown, no explanation
`;

function parseChaseCSV(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());

  // Find header row
  const headerIdx = lines.findIndex(l =>
    l.toLowerCase().includes("description") && l.toLowerCase().includes("amount")
  );
  if (headerIdx === -1) throw new Error("Could not find headers in CSV");

  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const dateIdx = headers.findIndex(h => h.includes("date"));
  const descIdx = headers.findIndex(h => h.includes("description"));
  const amtIdx  = headers.findIndex(h => h === "amount");

  if (dateIdx === -1 || descIdx === -1 || amtIdx === -1) {
    throw new Error(`Missing columns. Found: ${headers.join(", ")}`);
  }

  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma but respect quoted fields
    const cols = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { cols.push(current.trim()); current = ""; }
      else current += ch;
    }
    cols.push(current.trim());

    const date = cols[dateIdx]?.replace(/"/g, "").trim();
    const desc = cols[descIdx]?.replace(/"/g, "").trim();
    const amt  = cols[amtIdx]?.replace(/"/g, "").trim();

    if (!date || !desc || !amt || isNaN(parseFloat(amt))) continue;

    rows.push({ date, desc, amount: amt });
  }

  if (rows.length === 0) throw new Error("No valid transactions found in file");
  return rows;
}

function StatusBadge({ status }) {
  const map = {
    idle:        { color: C.sub,    label: "Ready to import" },
    parsing:     { color: C.gold,   label: "Reading CSV..." },
    categorizing:{ color: C.blue,   label: "AI categorizing..." },
    saving:      { color: C.accent, label: "Saving to database..." },
    done:        { color: C.green,  label: "Import complete!" },
    error:       { color: C.rose,   label: "Something went wrong" },
  };
  const s = map[status] || map.idle;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:s.color,
        boxShadow:`0 0 8px ${s.color}`,
        animation: ["parsing","categorizing","saving"].includes(status) ? "pulse 1s ease-in-out infinite" : "none" }} />
      <span style={{ fontSize:13, color:s.color, fontWeight:600 }}>{s.label}</span>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}

const CATEGORY_COLORS = {
  Food:"#F59E0B", Transport:"#3B82F6", Shopping:"#8B5CF6",
  Bills:"#F43F5E", Entertainment:"#EC4899", Health:"#10B981",
  Travel:"#06B6D4", Income:"#00E5C3", Giving:"#A78BFA", Other:"#6B7280",
};

export default function ImportScreen({ userId, onImportDone }) {
  const [status,   setStatus]   = useState("idle");
  const [preview,  setPreview]  = useState([]);
  const [error,    setError]    = useState("");
  const [imported, setImported] = useState(0);
  const [skipped,  setSkipped]  = useState(0);
  const [dragging, setDragging] = useState(false);
  const [rawCount, setRawCount] = useState(0);
  const fileRef = useRef();

  async function processFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().includes("csv") && !file.type.includes("csv") && !file.type.includes("excel")) {
      setError("Please upload a .csv file — in Chase, use 'Download account activity' not 'View statement'");
      setStatus("error"); return;
    }
    setError(""); setPreview([]); setImported(0); setSkipped(0);

    try {
      setStatus("parsing");
      const text = await file.text();
      const rows = parseChaseCSV(text);
      setRawCount(rows.length);

      setStatus("categorizing");
      const BATCH = 50;
      const categorized = [];
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const res = await fetch("/api/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions: batch }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        categorized.push(...(data.transactions || []));
      }
      setPreview(categorized);
      setStatus("idle");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function confirmImport() {
    setStatus("saving");
    let saved = 0, skip = 0;
    for (const tx of preview) {
      const { error: err } = await supabase.from("spending").insert({
        user_id:  userId,
        amount:   Math.abs(parseFloat(tx.amount) || 0),
        category: tx.category || "Other",
        note:     tx.note || "",
        date:     tx.date || new Date().toISOString().split("T")[0],
      });
      if (err) skip++; else saved++;
    }
    setImported(saved); setSkipped(skip);
    setPreview([]);
    setStatus("done");
    if (onImportDone) onImportDone();
  }

  return (
    <div>
      {/* Header */}
      <Card>
        <SectionTitle>Import Transactions</SectionTitle>
        <div style={{ fontSize:13, color:C.sub, lineHeight:1.7, marginBottom:16 }}>
          Upload your Chase CSV and AI will clean merchant names and categorize every transaction automatically.
        </div>
        <div style={{ background:C.surface, borderRadius:12, padding:"12px 14px",
          border:`1px solid ${C.border}`, marginBottom:14, fontSize:12, color:C.sub }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:4 }}>Chase format detected:</div>
          <code style={{ color:C.accent, fontSize:11 }}>Details, Posting Date, Description, Amount, Type...</code>
        </div>
        <StatusBadge status={status} />
      </Card>

      {/* Drop Zone */}
      {status !== "done" && (
        <Card>
          <input ref={fileRef} type="file" accept=".csv,.CSV" onChange={handleFile} style={{ display:"none" }} />
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragEnter={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !["parsing","categorizing","saving"].includes(status) && fileRef.current?.click()}
            style={{
              width:"100%", borderRadius:14, padding:"32px 20px", textAlign:"center",
              background: dragging ? C.accent+"28" : C.accent+"18",
              border:`2px dashed ${dragging ? C.accent : C.accent+"55"}`,
              cursor: ["parsing","categorizing","saving"].includes(status) ? "default" : "pointer",
              transition:"all .2s",
              transform: dragging ? "scale(1.02)" : "scale(1)",
            }}>
            <div style={{ fontSize:36, marginBottom:10 }}>
              {["parsing","categorizing","saving"].includes(status) ? "⏳" : dragging ? "⬇️" : "📂"}
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:C.accent, marginBottom:6 }}>
              {["parsing","categorizing","saving"].includes(status)
                ? `Processing ${rawCount} transactions...`
                : dragging ? "Drop it here!" : "Tap or drag & drop your CSV"}
            </div>
            <div style={{ fontSize:12, color:C.sub }}>Chase account activity (.csv)</div>
          </div>

          {error && (
            <div style={{ marginTop:12, background:"rgba(244,63,94,0.1)",
              border:"1px solid rgba(244,63,94,0.3)", borderRadius:10,
              padding:"12px 14px", fontSize:13, color:C.rose, lineHeight:1.6 }}>
              ⚠️ {error}
            </div>
          )}
        </Card>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <SectionTitle>{preview.length} transactions ready</SectionTitle>
            <div style={{ fontSize:11, color:C.sub }}>Review before saving</div>
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
            {Object.entries(
              preview.reduce((acc, t) => { acc[t.category] = (acc[t.category]||0)+1; return acc; }, {})
            ).map(([cat, count]) => (
              <div key={cat} style={{ background:(CATEGORY_COLORS[cat]||C.sub)+"20",
                border:`1px solid ${(CATEGORY_COLORS[cat]||C.sub)}44`,
                borderRadius:99, padding:"4px 10px", fontSize:11,
                color:CATEGORY_COLORS[cat]||C.sub, fontWeight:600 }}>
                {cat} ({count})
              </div>
            ))}
          </div>

          <div style={{ maxHeight:280, overflowY:"auto", marginBottom:16 }}>
            {preview.map((tx, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {tx.note}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:3, alignItems:"center" }}>
                    <span style={{ fontSize:10, color:C.muted }}>{tx.date}</span>
                    <span style={{ fontSize:10, background:(CATEGORY_COLORS[tx.category]||C.sub)+"20",
                      color:CATEGORY_COLORS[tx.category]||C.sub,
                      padding:"1px 6px", borderRadius:99, fontWeight:600 }}>
                      {tx.category}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize:14, fontWeight:700, marginLeft:12,
                  color: tx.category === "Income" ? C.green : C.text }}>
                  {tx.category === "Income" ? "+" : "-"}{fmt(Math.abs(tx.amount))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={confirmImport}
            style={{ width:"100%", background:C.accent, border:"none", borderRadius:12,
              padding:"13px", fontSize:14, fontWeight:700, color:"#000",
              fontFamily:"inherit", cursor:"pointer" }}>
            Save {preview.length} Transactions →
          </button>
          <button onClick={() => { setPreview([]); setStatus("idle"); }}
            style={{ width:"100%", marginTop:10, background:"none",
              border:`1px solid ${C.border}`, borderRadius:12, padding:"11px",
              fontSize:13, color:C.sub, fontFamily:"inherit", cursor:"pointer" }}>
            Cancel
          </button>
        </Card>
      )}

      {/* Success */}
      {status === "done" && (
        <Card glow={C.green}>
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
            <div style={{ fontSize:18, fontWeight:800, color:C.green, marginBottom:6 }}>Import Complete!</div>
            <div style={{ fontSize:13, color:C.sub, marginBottom:20 }}>
              <span style={{ color:C.text, fontWeight:700 }}>{imported}</span> transactions saved
              {skipped > 0 && <span> · <span style={{ color:C.rose }}>{skipped} skipped</span></span>}
            </div>
            <button onClick={() => { setStatus("idle"); setImported(0); setSkipped(0); }}
              style={{ background:C.accent+"20", border:`1px solid ${C.accent}44`,
                borderRadius:10, padding:"10px 24px", fontSize:13, fontWeight:700,
                color:C.accent, cursor:"pointer", fontFamily:"inherit" }}>
              Import Another File
            </button>
          </div>
        </Card>
      )}

      {/* How to export */}
      <Card>
        <SectionTitle>How to export from Chase</SectionTitle>
        {[
          ["1", "Log into chase.com on desktop"],
          ["2", "Click your checking or credit card account"],
          ["3", "Click 'Download account activity' (not View Statement)"],
          ["4", "Set your date range"],
          ["5", "Make sure format is CSV → Download"],
          ["6", "Upload or drag the file above"],
        ].map(([n, tip]) => (
          <div key={n} style={{ display:"flex", gap:12, padding:"8px 0",
            borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:C.accent+"20",
              border:`1px solid ${C.accent}33`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:11, fontWeight:700, color:C.accent, flexShrink:0 }}>
              {n}
            </div>
            <span style={{ fontSize:13, color:C.sub, lineHeight:1.5 }}>{tip}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
