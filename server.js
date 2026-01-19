import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { knowledgeBase } from "./knowledgeBase.js";

dotenv.config();

const app = express();

// ✅ Allow requests from anywhere (safe for now)
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ Health check (browser test)
app.get("/", (req, res) => {
  res.send("AI backend is running");
});

// ✅ OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Chat API
app.post("/api/chat", async (req, res) => {
  console.log("👉 /api/chat HIT");
  console.log("👉 BODY:", req.body);

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: knowledgeBase },
        ...messages,
      ],
      temperature: 0.3,
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("❌ AI ERROR:", error);
    res.status(500).json({ error: "AI failed" });
  }
});

// ✅ Render requires PORT from env
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});
