import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There is no direct listModels in the client SDK like this, 
    // it's usually part of the admin/management API.
    // But we can try a few standard ones.
    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ Model ${m} is working.`);
      } catch (e) {
        console.log(`❌ Model ${m} failed: ${e.message}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
