const cors = require("cors");
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: "sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
});

app.post("/generate", (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  const safePrompt = prompt.replace(/ /g, "+");
  const imageUrl = "https://placeimg.dev/400x300/4F46E5/FFFFFF?text=" + safePrompt;
  console.log("Sending:", imageUrl);
  res.json({ image: imageUrl });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});