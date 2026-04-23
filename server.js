const cors = require("cors");
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

//To set API key, in bash run: export OPENAI_API_KEY="your-key"
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", async (req, res) => {

  // Get prompt from request body
  const { prompt } = req.body;
  const cleanPrompt = prompt?.trim();

  if (!cleanPrompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  let imageUrl;
  
  try {
    // Try generating an AI image using the prompt
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: cleanPrompt,
      size: "1024x1024"
    });

    if (!result.data || !result.data[0]) {
      throw new Error("Invalid response from OpenAI");
    }

    imageUrl = result.data[0].url;
    
  } catch (err) {
    console.error("Error generating image:", err.code || err.message);
    
    if (err.code === "billing_hard_limit_reached" || 
      err.message?.includes("Billing hard limit")) {
      const safePrompt = encodeURIComponent(cleanPrompt);
      imageUrl = `https://placeimg.dev/400x300/4F46E5/FFFFFF?text=${safePrompt}`;

      console.log("Using fallback image:", imageUrl);

      return res.json({ 
        image: imageUrl,
        fallback: true
      });
    }
    
    return res.status(500).json({ error: "Failed to generate image" });
  }
  
  if (!imageUrl) {
    return res.status(500).json({ error: "No image generated" });
  }
  console.log("Generated image for prompt:", cleanPrompt);

  // Send the image URL back to the frontend
  res.json({
    image: imageUrl,
    prompt: cleanPrompt,
    fallback: false
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});