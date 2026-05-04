import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "cross-fetch";

dotenv.config();

const QUOTES_PATH = path.resolve("./quotes.json");

// --- VIRAL THEME POOL ---
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

// --- SEO METADATA GENERATOR ---
function generateSEOMetadata(quote, theme, scheduleTime) {
  const hooks = ["LISTEN CAREFULLY", "MOST POWERFUL", "SIGMA MINDSET", "DON'T SKIP", "THE HARD TRUTH", "WATCH THIS TWICE"];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  
  let title = `${hook}: ${quote.part1} ${quote.part2} 🚀 #motivation #mindset #sigma #shorts`;
  if (title.length > 100) title = title.substring(0, 97) + "...";
  
  const description = `${quote.part1} ${quote.part2}\n\n— ${quote.author}\n\nElevate your mindset with Mind Gambit. One quote can change your life.\n\n#mindgambit #motivation #quotes #success #mindset #sigma #shorts`;
  
  return { 
    title, 
    description, 
    tags: ["motivation", "sigma", "mindset", "success", "mind gambit", "shorts"],
    category: "27",
    scheduleTime: scheduleTime.toISOString() 
  };
}

// --- PEXELS INTEGRATION ---
async function fetchBackgroundVideo(query) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=10`,
      { headers: { Authorization: apiKey } }
    );
    const data = await response.json();
    if (data.videos && data.videos.length > 0) {
      const video = data.videos[Math.floor(Math.random() * Math.min(5, data.videos.length))];
      const sortedFiles = video.video_files.sort((a, b) => b.width - a.width);
      return sortedFiles[0].link;
    }
  } catch (error) { console.error("❌ Pexels error:", error); }
  return null;
}

// --- QUOTE SELECTION ---
function getNextQuote() {
  const quotes = JSON.parse(fs.readFileSync(QUOTES_PATH, "utf-8"));
  const available = quotes.filter(q => !q.used);
  if (available.length === 0) throw new Error("No more unused quotes!");
  const quote = available[Math.floor(Math.random() * available.length)];
  quote.used = true;
  fs.writeFileSync(QUOTES_PATH, JSON.stringify(quotes, null, 2));
  return quote;
}

// --- RENDERING ---
async function renderVideo(quote, videoUrl, theme, bundleLocation) {
  const inputProps = { part1: quote.part1, part2: quote.part2, author: quote.author, videoUrl, theme };
  const composition = await selectComposition({ serveUrl: bundleLocation, id: "MotivationalShort", inputProps });
  const outputLocation = `output_${quote.id}.mp4`;
  console.log(`🎬 Rendering: ${quote.id} (4K Viral)...`);
  await renderMedia({
    composition, serveUrl: bundleLocation, codec: "h264", outputLocation, inputProps, concurrency: 2,
    onProgress: ({ progress }) => { process.stdout.write(`⏳ ${(progress * 100).toFixed(1)}%\r`); }
  });
  return path.resolve(outputLocation);
}

// --- UPLOAD ---
async function uploadToYouTube(filePath, metadata) {
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  const youtube = google.youtube({ version: "v3", auth });
  console.log(`☁️ Scheduling for: ${metadata.scheduleTime}`);
  await youtube.videos.insert({
    part: "snippet,status",
    requestBody: {
      snippet: { title: metadata.title, description: metadata.description, tags: metadata.tags, categoryId: metadata.category },
      status: { privacyStatus: "private", publishAt: metadata.scheduleTime, selfDeclaredMadeForKids: false },
    },
    media: { body: fs.createReadStream(filePath) },
  });
  console.log("✅ Scheduled successfully!");
}

// --- MAIN ---
async function main() {
  try {
    const bundleLocation = await bundle({ entryPoint: path.resolve("./src/index.jsx"), sourceMaps: false });
    const now = new Date();
    const schedules = [
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0),
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0),
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0)
    ];
    for (let i = 0; i < 3; i++) {
      console.log(`\n📦 Processing Video ${i + 1}/3...`);
      const quote = getNextQuote();
      const theme = THEME_POOL[Math.floor(Math.random() * THEME_POOL.length)];
      const videoUrl = await fetchBackgroundVideo(`${quote.keywords}, ${theme.search}`);
      const videoPath = await renderVideo(quote, videoUrl, theme, bundleLocation);
      const metadata = generateSEOMetadata(quote, theme, schedules[i]);
      await uploadToYouTube(videoPath, metadata);
    }
    console.log(`\n🏁 Done! All 3 viral videos scheduled.`);
  } catch (error) {
    console.error("\n❌ Automation failed:", error);
    process.exit(1);
  }
}
main();
