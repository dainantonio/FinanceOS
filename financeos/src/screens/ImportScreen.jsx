import { useState, useRef } from "react";
import { C } from "../constants/colors";
import { fmt } from "../constants/helpers";
import Card from "../components/Card";
import SectionTitle from "../components/SectionTitle";
import { supabase } from "../lib/supabase";

const CATEGORY_PROMPT = (rows) => `
You are a financial transaction categorizer. Given these bank transactions, return a JSON array where each item has:
- "date": the transaction date (YYYY-MM-DD format)
- "note": cleaned merchant name (remove check numbers, card digits, location codes)
- "amount": absolute value as a number (always positive)
- "category": one of: Food, Transport, Shopping, Bills, Entertainment, Health, Travel, Income, Giving, Other

Transactions:
${rows.map((r, i) => `${i}. Date: ${r.date}, Description: ${r.desc}, Amount: ${r.amount}`).join("\n")}

Rules:
- If amount is positive in the CSV it may be a credit/income - use "Income" category
- If amount is negative it's a debit/expense
- Always return amount as positive number
- Return ONLY a valid JSON array, no markdown, no explanation
`;

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const dateIdx = headers.findIndex(h => h.includes("date"));
  const descIdx = headers.findIndex(h => h.includes("desc"));
  const amtIdx  = headers.findIndex(h => h.includes("amount"));

  return lines.slice(1).map(line => {
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || line.split(",");
    const clean = cols.map(c => c?.replace(/"/g, "").trim() || "");
    return {
      date: clean[dateIdx] || "",
      desc: clean[descIdx] || "",
      amount: clean[amtIdx] || "0",
    };
  }).filter(r => r.date && r.desc);
}

function StatusBadge({ status }) {
  const map = {
    idle:       { color: C.sub,    label: "Ready to import" },
    parsing:    { color: C.gold,   label: "Reading CSV..." },
    categorizing:{ color: C.blue,  label: "AI categorizing..." },
    saving:     { color: C.accent, label: "Saving to database..." },
    done:       { color: C.green,  label: "Import complete ✅" },
    error:      { color: C.rose,   label: "Something went wrong" },
  };
  const s = map[status] || map.idle;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:s.color,
        boxShadow:`0 0 8px ${s.color}`, animation: ["parsing","categorizing","saving"].includes(status) ? "pulse 1s ease-in-out infinite" : "none" }} />
      <span style={{ fontSize:13, color:s.color, fontWeight:600 }}>{s.label}</span>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}

export default function ImportScreen({ userId, onImportDone }) {
  const [status,   setStatus]   = useState("idle");
  const [preview,  setPreview]  = useState([]);
  const [error,    setError]    = useState("");
  const [imported, setImported] = useState(0);
  const [skipped,  setSkipped]  = useState(0);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError(""); setPreview([]); setImported(0); setSkipped(0);

    try {
      setStatus("parsing");
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) throw new Error("No transactions found in CSV");

      setStatus("categorizing");

      // Batch into groups of 50 to avoid token limits
      const BATCH = 50;
      const categorized = [];
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: CATEGORY_PROMPT(batch) }],
          }),
        });
        const data = await res.json();
        const text2 = data.content?.[0]?.text || "[]";
        const clean = text2.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        categorized.push(...parsed);
      }

      setPreview(categorized);
      setStatus("idle");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
    e.target.value = "";
  }

  async function confirmImport() {
    setStatus("saving");
    let saved = 0, skip = 0;
    for (const tx of preview) {
      const { error: err } = await supabase.from("spending").insert({
        user_id:  userId,
        amount:   Math.abs(parseFloat(tx.amount) || 0),
        category: tx.category || "Other",
        note:     tx.note || tx.desc || "",
        date:     tx.date || new Date().toISOString().split("T")[0],
      });
      if (err) skip++; else saved++;
    }
    setImported(saved); setSkipped(skip);
    setPreview([]);
    setStatus("done");
    if (onImportDone) onImportDone();
  }

  const CATEGORY_COLORS = {
    Food:"#F59E0B", Transport:"#3B82F6", Shopping:"#8B5CF6",
    Bills:"#F43F5E", Entertainment:"#EC4899", Health:"#10B981",
    Travel:"#06B6D4", Income:"#00E5C3", Giving:"#A78BFA", Other:"#6B7280",
  };

  return (
    <div>
      {/* Header */}
      <Card>
        <SectionTitle>Import Transactions</SectionTitle>
        <div style={{ fontSize:13, color:C.sub, lineHeight:1.7, marginBottom:16 }}>
          Download your bank statement as a CSV and upload it here. AI will automatically
          clean merchant names and categorize every transaction.
        </div>
        <div style={{ background:C.surface, borderRadius:12, padding:"14px",
          border:`1px solid ${C.border}`, marginBottom:14, fontSize:12, color:C.sub, lineHeight:1.8 }}>
          <div style={{ fontWeight:700, color:C.text, marginBottom:6 }}>Chase CSV format:</div>
          <code style={{ color:C.accent }}>Date, Description, Amount, Balance</code>
          <div style={{ marginTop:6 }}>✅ Works with Chase, most US banks</div>
        </div>
        <StatusBadge status={status} />
      </Card>

      {/* Upload */}
      {status !== "done" && (
        <Card>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile}
            style={{ display:"none" }} />
          <button onClick={() => fileRef.current?.click()}
            disabled={["parsing","categorizing","saving"].includes(status)}
            style={{ width:"100%", background: C.accent+"20",
              border:`2px dashed ${C.accent}60`, borderRadius:14, padding:"28px 20px",
              cursor:"pointer", fontFamily:"inherit", transition:"all .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.accent+"30"}
            onMouseLeave={e => e.currentTarget.style.background = C.accent+"20"}>
            <div style={{ fontSize:32, marginBottom:10 }}>📂</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.accent, marginBottom:4 }}>
              {["parsing","categorizing","saving"].includes(status) ? "Processing..." : "Tap to upload CSV"}
            </div>
            <div style={{ fontSize:12, color:C.sub }}>Chase bank statement (.csv)</div>
          </button>
          {error && (
            <div style={{ marginTop:12, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.3)",
              borderRadius:10, padding:"10px 14px", fontSize:13, color:C.rose }}>
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

          {/* Category summary */}
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

          {/* Transaction list preview */}
          <div style={{ maxHeight:280, overflowY:"auto", marginBottom:16 }}>
            {preview.map((tx, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"10px 0",
                borderBottom:`1px solid ${C.border}` }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {tx.note}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:3, alignItems:"center" }}>
                    <span style={{ fontSize:10, color:C.muted }}>{tx.date}</span>
                    <span style={{ fontSize:10, background:(CATEGORY_COLORS[tx.category]||C.sub)+"20",
                      color:CATEGORY_COLORS[tx.category]||C.sub, padding:"1px 6px",
                      borderRadius:99, fontWeight:600 }}>{tx.category}</span>
                  </div>
                </div>
                <div style={{ fontSize:14, fontWeight:700,
                  color: tx.category === "Income" ? C.green : C.text, marginLeft:12 }}>
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
            <div style={{ fontSize:18, fontWeight:800, color:C.green, marginBottom:6 }}>
              Import Complete!
            </div>
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

      {/* Tips */}
      <Card>
        <SectionTitle>How to export from Chase</SectionTitle>
        {[
          ["1", "Log in at chase.com"],
          ["2", "Go to your checking or credit card account"],
          ["3", "Click 'Download account activity'"],
          ["4", "Select date range → choose CSV format"],
          ["5", "Upload the file here"],
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
