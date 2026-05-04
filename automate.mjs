import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "cross-fetch";

dotenv.config();

const QUOTES_PATH = path.resolve("./quotes.json");

// --- THEME POOL FOR DAILY VARIETY ---
const THEME_POOL = [
  {
    name: "Golden Sunset",
    gradient: "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)",
    accent: "#FFD700",
    search: "sunset, warm, beach"
  },
  {
    name: "Deep Ocean",
    gradient: "linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)",
    accent: "#E0FFFF",
    search: "ocean, waves, blue"
  },
  {
    name: "Forest Mist",
    gradient: "linear-gradient(135deg, #134E5E 0%, #71B280 100%)",
    accent: "#F0FFF0",
    search: "forest, nature, green"
  },
  {
    name: "Royal Bloom",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    accent: "#FFD700",
    search: "abstract, purple, elegant"
  },
  {
    name: "Morning Sky",
    gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    accent: "#87CEEB",
    search: "sky, clouds, morning"
  }
];

// --- SEO METADATA GENERATOR ---
function generateSEOMetadata(quote, theme) {
  const hooks = [
    "LIFE CHANGING", "POWERFUL", "MOTIVATIONAL", "INSPIRING", "WISDOM", 
    "SUCCESS SECRET", "MINDSET", "DAILY DOSE", "WATCH UNTIL END"
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  
  let title = `${hook}: ${quote.part1} ${quote.part2} 🚀 #motivation #shorts #mindgambit`;
  
  // YouTube title limit is 100 characters
  if (title.length > 100) {
    title = title.substring(0, 97) + "...";
  }
  
  const description = `${quote.part1} ${quote.part2}\n\n— ${quote.author}\n\nWelcome to Mind Gambit. We bring you daily doses of motivation and wisdom to level up your mindset.\n\nSubscribe for more inspiration!\n\n#mindgambit #motivation #quotes #success #mindset #inspiration #shorts`;
  
  const tags = ["motivation", "quotes", "mindset", "success", "inspiration", "mind gambit", "shorts"];
  
  return { title, description, tags, category: "27" }; // 27 = Education
}

// --- PEXELS INTEGRATION ---
async function fetchBackgroundVideo(query) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ No PEXELS_API_KEY found. Using Theme Pool gradient.");
    return null; 
  }

  try {
    console.log(`🔍 Searching Pexels for: ${query}...`);
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=10`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    const data = await response.json();
    if (data.videos && data.videos.length > 0) {
      const video = data.videos[Math.floor(Math.random() * Math.min(5, data.videos.length))];
      const file = video.video_files.find(f => f.quality === "hd") || video.video_files[0];
      return file.link;
    }
  } catch (error) {
    console.error("❌ Error fetching Pexels video:", error);
  }

  return null;
}

// --- QUOTE SELECTION ---
function getNextQuote() {
  const quotes = JSON.parse(fs.readFileSync(QUOTES_PATH, "utf-8"));
  const available = quotes.filter(q => !q.used);
  
  if (available.length === 0) {
    throw new Error("No more unused quotes! Please restock quotes.json.");
  }

  return available[Math.floor(Math.random() * available.length)];
}

async function markQuoteAsUsed(quoteId) {
  const quotes = JSON.parse(fs.readFileSync(QUOTES_PATH, "utf-8"));
  const index = quotes.findIndex(q => q.id === quoteId);
  if (index !== -1) {
    quotes[index].used = true;
    quotes[index].lastUsed = new Date().toISOString();
    fs.writeFileSync(QUOTES_PATH, JSON.stringify(quotes, null, 2));
  }
}

// --- RENDERING ---
async function renderVideo(quote, videoUrl, theme) {
  console.log(`🚀 Rendering: "${quote.part1}..." using Theme: ${theme.name}`);

  const bundleLocation = await bundle({
    entryPoint: path.resolve("./src/index.jsx"),
    sourceMaps: false,
  });

  const inputProps = {
    part1: quote.part1,
    part2: quote.part2,
    author: quote.author,
    videoUrl,
    theme: theme,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "MotivationalShort",
    inputProps,
  });

  const outputLocation = `output_motivational_${quote.id}.mp4`;
  console.log(`🎬 Output path: ${outputLocation}`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps,
    onProgress: ({ progress }) => {
      process.stdout.write(`⏳ Progress: ${(progress * 100).toFixed(1)}%\r`);
    },
  });

  console.log(`\n✅ Render complete!`);
  return path.resolve(outputLocation);
}

// --- UPLOAD ---
async function uploadToYouTube(filePath, metadata) {
  const GOOGLE_AUTH_CONFIG = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  };

  if (!GOOGLE_AUTH_CONFIG.clientId || GOOGLE_AUTH_CONFIG.clientId.includes("YOUR_")) {
    console.warn("⚠️ Skipping YouTube upload due to missing credentials.");
    return null;
  }

  console.log("☁️ Uploading to YouTube...");
  const oauth2Client = new google.auth.OAuth2(GOOGLE_AUTH_CONFIG.clientId, GOOGLE_AUTH_CONFIG.clientSecret);
  oauth2Client.setCredentials({ refresh_token: GOOGLE_AUTH_CONFIG.refreshToken });
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  const response = await youtube.videos.insert({
    part: "snippet,status",
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: metadata.category,
      },
      status: { 
        privacyStatus: "public", 
        selfDeclaredMadeForKids: false 
      },
    },
    media: { body: fs.createReadStream(filePath) },
  });

  console.log(`\n✅ Upload successful! ID: ${response.data.id}`);
  return response.data;
}

// --- MAIN ---
async function main() {
  try {
    const quote = getNextQuote();
    const theme = THEME_POOL[Math.floor(Math.random() * THEME_POOL.length)];
    const searchQuery = `${quote.keywords}, ${theme.search}`;
    
    const videoUrl = await fetchBackgroundVideo(searchQuery);
    const videoPath = await renderVideo(quote, videoUrl, theme);
    
    const metadata = generateSEOMetadata(quote, theme);
    console.log(`✨ SEO Title: ${metadata.title}`);
    
    await uploadToYouTube(videoPath, metadata);
    await markQuoteAsUsed(quote.id);
    
    console.log(`\n🏁 Done! Mind Gambit automation complete.`);
    
  } catch (error) {
    console.error("\n❌ Automation failed:");
    console.error(error);
    process.exit(1);
  }
}

main();
