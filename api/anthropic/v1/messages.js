// Proxy: accepts Claude-format requests, forwards to Google Gemini (free tier).
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^﻿/, "").trim();
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  try {
    // Extract the user message from Claude-format body
    const userMessage = req.body?.messages?.find((m) => m.role === "user")?.content || "";

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: req.body?.max_tokens || 1000 },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ error: data?.error?.message || "Gemini error" });
    }

    // Return in Claude-compatible format so the frontend needs no changes
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({
      content: [{ type: "text", text }],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
