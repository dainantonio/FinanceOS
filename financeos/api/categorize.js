export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { transactions } = req.body;
  if (!transactions || !transactions.length) {
    return res.status(400).json({ error: "No transactions provided" });
  }

  const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;

  const prompt = `
You are a financial transaction categorizer. Given these bank transactions, return a JSON array where each item has:
- "date": the transaction date (YYYY-MM-DD format, convert from M/D/YYYY)
- "note": cleaned merchant name (remove "POS DEBIT", "ACH", card digits, extra spaces, location codes)
- "amount": absolute value as a number (always positive)
- "category": one of: Food, Transport, Shopping, Bills, Entertainment, Health, Travel, Income, Giving, Other

Transactions:
${transactions.map((r, i) => `${i}. Date: ${r.date}, Description: ${r.desc}, Amount: ${r.amount}`).join("\n")}

Rules:
- Clean up messy bank descriptions (e.g. "POS DEBIT  WM SUPERCENTER #1478  SOUTH POINT OH" -> "Walmart Supercenter")
- If amount is positive it is income/credit - use "Income" category
- If amount is negative it is an expense
- Always return amount as positive number
- Return ONLY a valid JSON array, no markdown, no explanation
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  );

  const data = await response.json();

  if (data.error) {
    return res.status(500).json({ error: data.error.message });
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return res.status(200).json({ transactions: parsed });
  } catch {
    return res.status(500).json({ error: "Failed to parse AI response", raw: text });
  }
}
