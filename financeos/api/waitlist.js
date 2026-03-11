export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const SUPABASE_URL     = process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON    = process.env.VITE_SUPABASE_ANON_KEY;
  const RESEND_API_KEY   = process.env.RESEND_API_KEY;

  // 1. Save to Supabase
  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON,
      "Authorization": `Bearer ${SUPABASE_ANON}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ email }),
  });

  if (!sbRes.ok && sbRes.status !== 409) {
    const err = await sbRes.text();
    return res.status(500).json({ error: "Failed to save email", detail: err });
  }

  const alreadySignedUp = sbRes.status === 409;

  // 2. Send welcome email via Resend
  if (!alreadySignedUp) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FinanceOS <onboarding@resend.dev>",
        to: [email],
        subject: "You're on the FinanceOS waitlist! 🚀",
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #080C16; color: #E8EDF5;">
            <div style="font-size: 24px; font-weight: 800; color: #E8EDF5; margin-bottom: 4px;">
              Finance<span style="color: #00E5C3;">OS</span>
            </div>
            <div style="font-size: 13px; color: #7A8BA8; margin-bottom: 32px;">Your Financial Command Center</div>

            <h1 style="font-size: 28px; font-weight: 800; color: #E8EDF5; margin-bottom: 12px; line-height: 1.2;">
              You're on the list! 🎉
            </h1>
            <p style="font-size: 15px; color: #7A8BA8; line-height: 1.7; margin-bottom: 24px;">
              Thanks for joining the FinanceOS waitlist. You're among the first to take control of your finances with AI-powered insights, real-time spending tracking, and biblical stewardship guidance.
            </p>

            <div style="background: #141D2E; border: 1px solid #1C2840; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
              <div style="font-size: 13px; font-weight: 700; color: #00E5C3; margin-bottom: 16px; letter-spacing: .06em;">WHAT YOU'LL GET</div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${[
                  ["🤖", "AI Financial Coach — personalized advice from your real data"],
                  ["📊", "Stewardship Score — your financial health at a glance"],
                  ["🎯", "Goals Engine — track every savings goal with ETAs"],
                  ["🔍", "Leak Detector — find what's costing you thousands per year"],
                  ["✝️", "Faith Mode — optional biblical stewardship guidance"],
                ].map(([icon, text]) => `
                  <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <span style="font-size: 18px;">${icon}</span>
                    <span style="font-size: 14px; color: #7A8BA8; line-height: 1.5;">${text}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <div style="background: #1A1500; border: 1px solid rgba(245,200,66,0.2); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
              <div style="font-size: 12px; color: #F5C842; font-weight: 700; margin-bottom: 6px;">✝️ A NOTE ON STEWARDSHIP</div>
              <div style="font-size: 13px; color: #A89060; font-style: italic; line-height: 1.6;">
                "The plans of the diligent lead surely to abundance." — Proverbs 21:5
              </div>
            </div>

            <a href="https://financeos-gamma.vercel.app" 
              style="display: block; background: #00E5C3; color: #000; text-align: center; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; margin-bottom: 24px;">
              Explore the Live Demo →
            </a>

            <p style="font-size: 12px; color: #3A4A62; text-align: center; line-height: 1.6;">
              Early members get premium features free for 3 months at launch.<br/>
              We'll email you as soon as your spot is ready.
            </p>
          </div>
        `,
      }),
    });
  }

  return res.status(200).json({
    success: true,
    alreadySignedUp,
    message: alreadySignedUp
      ? "You're already on the waitlist!"
      : "You're on the list! Check your email.",
  });
}
