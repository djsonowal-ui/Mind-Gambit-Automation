# Motivational Automation: Best Practices & Rules

To ensure the stability and quality of the automated motivational quote system, follow these rules and guidelines.

## 1. Content Quality
- **Quotes**: Only use high-quality, impactful quotes. Avoid generic or overly long text.
- **Author Credits**: Always include the correct author name.
- **Keywords**: Each quote must have 3-5 descriptive keywords for Pexels background matching.

## 2. Background Video (Pexels)
- **Search Orientation**: Always use `orientation=portrait` to get vertical videos.
- **Resolution**: Use HD or higher quality video files.
- **Variety**: Pick a random video from the top 5 results to avoid repetition for similar themes.

## 3. Video Rendering Rules (YouTube Shorts)
- **Resolution**: Render at **1080 x 1920** (Vertical). 
- **Framerate**: Always render at **30 fps**.
- **Duration**: Standard duration is **10 seconds** (300 frames).
- **Typography**: 
  - Quote: Use `Playfair Display` (Serif) for a premium, timeless feel.
  - Author: Use `Montserrat` (Sans-Serif) for clarity.
- **Color Palette**: Use white text with a dark overlay (30-60% opacity) for maximum readability.
- **Accents**: Use Golden (`#FFD700`) accents for the quote symbols and dividers.

## 4. Automation & State
- **State Persistence**: Mark a quote as `used` in `quotes.json` **after** a successful render.
- **Fallback**: Always have a high-quality fallback video URL in case the Pexels API fails.

## 5. Metadata & SEO
- **Title**: Include a hook and #shorts (e.g., "The Secret to Success 🚀 #motivation #shorts").
- **Description**: Add the full quote text and relevant tags.

## 6. Commands
- **Dev**: `npm run dev` to preview in Remotion Studio.
- **Render**: `node automate.mjs` to pick a quote, fetch a background, and render.
