import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Correct initialization
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt, framework } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // ✅ Use a supported model
    const result = await client.models.generateContent({
      model: "models/gemini-2.5-flash", // <-- changed from gemini-1.5-flash
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a complete HTML page with <!DOCTYPE html> for a ${framework} component.
- Include <html>, <head>, <body>, and all necessary meta tags.
- Include all CSS inside <style> tags in the <head> or via CDN links if using Tailwind/Bootstrap.
- Do not include unnecessary comments or extra scripts.
- The body should contain a fully functional, responsive component based on this requirement:
"${prompt}"
- Make it clean, structured, and ready for preview in a browser or iframe.`,
            },
          ],
        },
      ],
    });

    // Some versions of the SDK return result.output_text instead of result.text
    const outputText = result.text || result.output_text || "";

    res.json({ result: outputText });
  } catch (error) {
    console.error("🔥 BACKEND ERROR:", error);
    res.status(500).json({ error: "Generation failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
  console.log(`✅ Backend running on port ${PORT}`)
);

