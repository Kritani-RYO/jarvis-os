// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({ error: "Failed to fetch response from OpenAI" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
