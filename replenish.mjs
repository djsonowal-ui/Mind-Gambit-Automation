import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const QUOTES_PATH = path.resolve("./quotes.json");

async function replenishQuotes() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  // Read existing quotes to avoid duplicates
  const existingQuotes = JSON.parse(fs.readFileSync(QUOTES_PATH, "utf-8"));
  const existingTexts = existingQuotes.map(q => q.part1.toLowerCase());

  console.log("🤖 Asking Gemini to generate 30 new motivational quotes...");

  const prompt = `
    Generate 30 high-quality 'Viral' motivational quotes for a YouTube channel called 'Mind Gambit'. 
    Focus on 'Sigma Mindset', Stoicism, and Discipline. 
    Each quote must be split into two parts: 
    - Part 1: The 'Viral Hook' (Must be aggressive, thought-provoking, or start with 'Most people...', 'The hard truth is...', 'Listen carefully...').
    - Part 2: The 'Mic Drop' (The impactful, short, and punchy conclusion).
    
    Format the output as a JSON array of objects. Each object MUST have these fields:
    - id: a unique string like 'ai_001', 'ai_002', etc.
    - part1: string (the hook)
    - part2: string (the punchline)
    - author: string (the original author or 'Mind Gambit' if original)
    - category: string (one word category like success, mindset, etc.)
    - keywords: comma separated strings (for Pexels background matching, e.g. 'mountain, sunny, bright')
    - used: false

    Return ONLY the raw JSON array. No markdown, no code blocks.
    
    Avoid these existing quotes: ${existingTexts.slice(0, 10).join(", ")}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Remove markdown code blocks if present
    if (text.startsWith("```json")) {
      text = text.replace(/```json|```/g, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```/g, "").trim();
    }

    const newQuotes = JSON.parse(text);
    
    // Filter out duplicates just in case
    const uniqueNewQuotes = newQuotes.filter(nq => !existingTexts.includes(nq.part1.toLowerCase()));
    
    const updatedQuotes = [...existingQuotes, ...uniqueNewQuotes];
    fs.writeFileSync(QUOTES_PATH, JSON.stringify(updatedQuotes, null, 2));

    console.log(`✅ Success! Added ${uniqueNewQuotes.length} new quotes to quotes.json.`);
    
  } catch (error) {
    console.error("❌ Failed to generate quotes:", error);
    process.exit(1);
  }
}

replenishQuotes();
