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
  
  let imageUrl = null;
  // 1. Try generating an AI image using the prompt
  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: cleanPrompt,
      size: "1024x1024"
    });

    const img = result.data?.[0];

    if (img?.b64_json) {
      imageUrl = `data:image/png;base64,${img.b64_json}`;
    } else if (img?.url) {
      imageUrl = img.url;
    }

    if (imageUrl) { 
      return res.json({ 
        image: imageUrl, 
        prompt: cleanPrompt, 
        fallback: false,
        source: "openai"
      });
    }
  } catch (err) {
    console.error("OpenAI failed:", err.code || err.message);
  }

  // 2. Fallback: Unsplash API (requires an API key) 
  try {
    const query = cleanPrompt
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .slice(0, 5)
      .join(" ");

    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );

    if (!unsplashRes.ok) {
      throw new Error(`Unsplash API error: ${unsplashRes.status} ${unsplashRes.statusText}`);
    }
    const data = await unsplashRes.json();

    const first = data.results?.[0];
    if (!first) {
      throw new Error("No Unsplash results found");
    }

    imageUrl = first?.urls?.regular || null;

    if (imageUrl) {
      return res.json({ 
      image: imageUrl,
      prompt: cleanPrompt,
      fallback: true,
      source: "unsplash"
      });
    }
  } catch (err) {
    console.error("Unsplash failed:", err.message);
  }

  // 3. Final fallback: Placeholder image with prompt text
  const safePrompt = encodeURIComponent(cleanPrompt);
  imageUrl = `https://placehold.co/600x400/4F46E5/FFFFFF?text=${safePrompt}`;

  console.log("Using fallback image:", imageUrl);

  // Send the image URL back to the frontend
  res.json({
    image: imageUrl,
    prompt: cleanPrompt,
    fallback: true,
    source: "placeholder"
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});