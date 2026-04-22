const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const { INTERVIEWER_PROMPT, COACH_PROMPT, FINAL_REPORT_PROMPT } = require("./prompts");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Route 1 — Get next interview question
app.post("/api/interview", async (req, res) => {
  const { role, messages } = req.body;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: INTERVIEWER_PROMPT(role),
      messages,
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 2 — Get coach feedback on an answer
app.post("/api/feedback", async (req, res) => {
  const { question, answer } = req.body;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: COACH_PROMPT,
      messages: [
        {
          role: "user",
          content: `Interview Question: ${question}\n\nCandidate's Answer: ${answer}`,
        },
      ],
    });
    res.json({ feedback: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 3 — Get final report
app.post("/api/report", async (req, res) => {
  const { role, transcript } = req.body;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: FINAL_REPORT_PROMPT(role, transcript),
      messages: [{ role: "user", content: "Generate my final interview report." }],
    });
    res.json({ report: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});