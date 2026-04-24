const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const { INTERVIEWER_PROMPT, COACH_PROMPT, FINAL_REPORT_PROMPT } = require("./prompts");
const { generateToken, verifyToken, useToken } = require("./tokens");
const { sendTokenEmail } = require("./email");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Route 1 — Generate a new token (called by you after each payment)
app.post("/api/generate-token", async (req, res) => {
  const { secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = await generateToken();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 2 — Verify token (without consuming it)
app.post("/api/verify-token", async (req, res) => {
  const { token } = req.body;
  try {
    const valid = await verifyToken(token);
    if (!valid) {
      return res.status(401).json({ valid: false, message: "Invalid or already used token" });
    }
    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 2b — Consume token when interview starts
app.post("/api/use-token", async (req, res) => {
  const { token } = req.body;
  try {
    await useToken(token);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 3 — Get next interview question
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

// Route 4 — Get coach feedback
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

// Route 5 — Get final report
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

// Route 6 — Webhook called by Superprofile after payment
app.post("/api/webhook", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "No email provided" });
    }
    const token = await generateToken();
    await sendTokenEmail(email, token);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
