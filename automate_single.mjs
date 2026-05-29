import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "cross-fetch";

dotenv.config();

const QUOTES_PATH = path.resolve("./quotes.json");

const THEME_POOL = [
  {
    name: "Midnight Gold",
    gradient: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    accent: "#FFD700",
    search: "luxury, black, dark, elegant, watch, gold"
  },
  {
    name: "Cyber Neon",
    gradient: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
    accent: "#00d2ff",
    search: "city, night, neon, futuristic"
  },
  {
    name: "Golden Sunset",
    gradient: "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)",
    accent: "#FFD700",
    search: "sunset, warm, beach, light"
  },
  {
    name: "Royal Bloom",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    accent: "#FFD700",
    search: "purple, abstract, rich"
  }
];

const HASHTAG_POOLS = {
  sigma: ["#sigma", "#grindset", "#discipline", "#mentality", "#hardwork", "#hustle"],
  stoic: ["#stoicism", "#stoic", "#philosophy", "#wisdom", "#innerpeace", "#mindset"],
  wealth: ["#success", "#wealth", "#abundance", "#growth", "#financialfreedom"],
  luxury: ["#luxury", "#aesthetic", "#motivation", "#lifestyle", "#premium", "#vibes"]
};

function generateSEOMetadata(quote, theme, scheduleTime) {
  const hooks = [
    "READ THIS TWICE 🧠", 
    "THE HARD TRUTH ⚡", 
    "99% FAIL HERE 📉", 
    "SIGMA RULE #1 🤫", 
    "LISTEN CAREFULLY 💎", 
    "UNSTOPPABLE MINDSET 🔥"
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  
  let title = `${hook} | ${quote.part1.toUpperCase()} ${quote.part2.toUpperCase()} #shorts #motivation`;
  if (title.length > 100) title = title.substring(0, 97) + "...";
  
  const poolKeys = Object.keys(HASHTAG_POOLS);
  const selectedPool = HASHTAG_POOLS[poolKeys[Math.floor(Math.random() * poolKeys.length)]];
  const commonTags = ["#mindgambit", "#viral", "#shorts", "#motivation"];
  const allHashtags = [...new Set([...selectedPool, ...commonTags])].join(" ");
  
  const cta = "\n\nSAVE THIS 💾 to remind yourself of the goal. TAG someone who needs this mindset. 🔥";
  const description = `${quote.part1} ${quote.part2}\n\n— ${quote.author}${cta}\n\n${allHashtags}`;
  
  return { 
    title, 
    description, 
    tags: ["motivation", "sigma", "mindset", "success", "mind gambit", ...selectedPool.map(t => t.replace("#", ""))],
    category: "27",
    scheduleTime: scheduleTime.toISOString() 
  };
}

async function fetchBackgroundVideo(query) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;
  const viralQuery = `${query}, cinematic, 4k, moody, high contrast`;
  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(viralQuery)}&orientation=portrait&per_page=15`,
      { headers: { Authorization: apiKey } }
    );
    const data = await response.json();
    if (data.videos && data.videos.length > 0) {
      const video = data.videos[Math.floor(Math.random() * Math.min(8, data.videos.length))];
      const sortedFiles = video.video_files.sort((a, b) => b.width - a.width);
      return sortedFiles[0].link;
    }
  } catch (error) { console.error("❌ Pexels error:", error); }
  return null;
}

async function renderVideo(quote, videoUrl, theme, bundleLocation) {
  const inputProps = { 
    part1: quote.part1, 
    part2: quote.part2, 
    author: quote.author, 
    videoUrl, 
    isImage: false,
    theme 
  };
  const composition = await selectComposition({ serveUrl: bundleLocation, id: "MotivationalShort", inputProps });
  const outputLocation = `output_viral_${quote.id}.mp4`;
  console.log(`🎬 Rendering: ${quote.id} (4K VIRAL INSTANT)...`);
  await renderMedia({
    composition, 
    serveUrl: bundleLocation, 
    codec: "h264", 
    outputLocation, 
    inputProps, 
    concurrency: 1,
    onProgress: ({ progress }) => { 
      const dots = ".".repeat(Math.floor(progress * 20));
      process.stdout.write(`⏳ Rendering [${dots.padEnd(20)}] ${(progress * 100).toFixed(1)}%\r`); 
    }
  });
  return path.resolve(outputLocation);
}

async function uploadToYouTube(filePath, metadata) {
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  const youtube = google.youtube({ version: "v3", auth });
  console.log(`☁️ Uploading as PUBLIC immediately to YouTube...`);
  await youtube.videos.insert({
    part: "snippet,status",
    requestBody: {
      snippet: { title: metadata.title, description: metadata.description, tags: metadata.tags, categoryId: metadata.category },
      status: { 
        privacyStatus: "public", 
        selfDeclaredMadeForKids: false 
      },
    },
    media: { body: fs.createReadStream(filePath) },
    uploadType: "resumable",
  });
  console.log("✅ YouTube upload successful!");
}

async function uploadToInstagram(filePath, metadata) {
  const IG_ID = process.env.IG_BUSINESS_ACCOUNT_ID;
  const IG_TOKEN = process.env.IG_ACCESS_TOKEN;
  
  if (!IG_ID || !IG_TOKEN || IG_ID.includes("your_")) {
    console.warn("⚠️ Instagram credentials missing or default. Skipping IG upload.");
    return;
  }

  try {
    console.log(`📦 Hosting video temporarily for Instagram...`);
    const fileBuffer = fs.readFileSync(filePath);
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), path.basename(filePath));
    
    const hostResponse = await fetch('https://file.io/?expires=1h', {
      method: 'POST',
      body: formData
    });
    const hostData = await hostResponse.json();
    if (!hostData.success) throw new Error("File hosting failed: " + JSON.stringify(hostData));
    const videoUrl = hostData.link;
    console.log(`🔗 Temporary Link (expires in 1h): ${videoUrl}`);

    console.log(`📸 Creating Instagram Reels container...`);
    const containerResponse = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption: metadata.description,
        access_token: IG_TOKEN,
        thumb_offset: 1200
      })
    });
    const containerData = await containerResponse.json();
    if (containerData.error) throw new Error("IG Container error: " + JSON.stringify(containerData.error));
    const creationId = containerData.id;

    console.log(`⏳ Waiting for Instagram to process video...`);
    let status = 'IN_PROGRESS';
    let attempts = 0;
    while (status === 'IN_PROGRESS' && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 15000));
      const statusResponse = await fetch(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${IG_TOKEN}`);
      const statusData = await statusResponse.json();
      status = statusData.status_code;
      attempts++;
      if (status === 'ERROR') throw new Error("IG Processing failed: " + JSON.stringify(statusData));
      if (status === 'FINISHED') break;
    }

    if (status !== 'FINISHED') throw new Error("IG Processing timed out.");

    console.log(`🚀 Publishing to Instagram Reels...`);
    const publishResponse = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: IG_TOKEN
      })
    });
    const publishData = await publishResponse.json();
    if (publishData.error) throw new Error("IG Publish error: " + JSON.stringify(publishData.error));
    
    console.log("✅ Instagram Reels posted successfully!");
  } catch (error) {
    console.error("❌ Instagram upload failed:", error.message);
  }
}

async function replenishQuotes() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text().trim();
  if (text.startsWith("```json")) {
    text = text.replace(/```json|```/g, "").trim();
  } else if (text.startsWith("```")) {
    text = text.replace(/```/g, "").trim();
  }
  const newQuotes = JSON.parse(text);
  const uniqueNewQuotes = newQuotes.filter(nq => !existingTexts.includes(nq.part1.toLowerCase()));
  const updatedQuotes = [...existingQuotes, ...uniqueNewQuotes];
  fs.writeFileSync(QUOTES_PATH, JSON.stringify(updatedQuotes, null, 2));
  console.log(`✅ Success! Added ${uniqueNewQuotes.length} new quotes to quotes.json.`);
}

function getNextQuote() {
  const quotes = JSON.parse(fs.readFileSync(QUOTES_PATH, "utf-8"));
  const available = quotes.filter(q => !q.used);
  if (available.length === 0) throw new Error("No more unused quotes!");
  const quote = available[Math.floor(Math.random() * available.length)];
  quote.used = true;
  quote.lastUsed = new Date().toISOString();
  fs.writeFileSync(QUOTES_PATH, JSON.stringify(quotes, null, 2));
  return quote;
}

async function main() {
  try {
    console.log("🚀 Starting GitHub Actions Single Video Upload...");
    const bundleLocation = await bundle({ entryPoint: path.resolve("./src/index.jsx"), sourceMaps: false });
    
    let quote;
    try {
      quote = getNextQuote();
    } catch (error) {
      if (error.message.includes("No more unused quotes")) {
        console.log("🔄 Out of quotes! Automatically replenishing...");
        await replenishQuotes();
        quote = getNextQuote();
      } else {
        throw error;
      }
    }
    
    const theme = THEME_POOL[Math.floor(Math.random() * THEME_POOL.length)];
    const videoUrl = await fetchBackgroundVideo(`${quote.keywords}, ${theme.search}`);
    const videoPath = await renderVideo(quote, videoUrl, theme, bundleLocation);
    const metadata = generateSEOMetadata(quote, theme, new Date());
    
    let ytSuccess = false;
    try {
      await uploadToYouTube(videoPath, metadata);
      ytSuccess = true;
    } catch (ytError) {
      console.error(`❌ YouTube upload failed:`, ytError.message || ytError);
    }
    
    let igSuccess = false;
    try {
      await uploadToInstagram(videoPath, metadata);
      igSuccess = true;
    } catch (igError) {
      console.error(`❌ Instagram upload failed:`, igError.message || igError);
    }
    
    if (ytSuccess || igSuccess) {
      console.log(`✅ Success! Video processed successfully.`);
    } else {
      console.error(`❌ Error: Video failed to upload on all platforms.`);
    }
  } catch (error) {
    console.error("\n❌ Automation failed:", error);
    process.exit(1);
  }
}
main();
