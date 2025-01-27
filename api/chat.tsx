// /pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { prompt, apiKey } = req.body;

    try {
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt,
          max_tokens: 150,
        }),
      });

      const data = await response.json();
      res.status(200).json({ reply: data.choices[0]?.text.trim() });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch GPT response" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
