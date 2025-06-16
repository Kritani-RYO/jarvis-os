// /api/chat.js (Node.js on Vercel)
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  const { message } = req.body;

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-3.5-turbo'
      messages: [{ role: 'user', content: message }],
    });

    res.status(200).json({ reply: chat.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ reply: "⚠️ I'm unable to process your request at the moment." });
  }
}
