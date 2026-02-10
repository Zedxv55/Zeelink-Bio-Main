export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "ไม่มีคำตอบ";

    res.status(200).json({ reply: aiText });
  } catch (err) {
    res.status(500).json({ error: "AI error" });
  }
}
