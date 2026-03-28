import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, "../.env.local") });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Clients
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

// Correct Gemini Initialization
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Support for design analysis
app.post("/api/analyze", async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    console.log(`Analyzing image: ${imageUrl}`);
    
    // Fetch image data
    const imageResponse = await fetch(imageUrl);
    const imageData = await imageResponse.arrayBuffer();
    
    const analysisPrompt = prompt || "Analyze this web design. Extract the primary color palette (hex), typography (font families), and a structured description of the layout and aesthetic. Return the result in JSON format.";

    const response = await (genAI as any).models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: [
        {
          parts: [
            { text: analysisPrompt },
            {
              inlineData: {
                data: Buffer.from(imageData).toString("base64"),
                mimeType: "image/png",
              },
            },
          ],
        },
      ],
    });

    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Try to parse JSON if possible
    let jsonResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResult = JSON.parse(jsonMatch[0]);
      } else {
        jsonResult = { text: responseText };
      }
    } catch (e) {
      jsonResult = { text: responseText };
    }

    res.json(jsonResult);
  } catch (error: any) {
    console.error("Analysis failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("<h1>Design Hub API Server</h1><p>The backend is running. Use /api/analyze for analysis.</p>");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
