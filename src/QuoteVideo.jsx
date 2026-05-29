import { 
  AbsoluteFill, 
  useVideoConfig, 
  useCurrentFrame, 
  interpolate, 
  spring,
  Video,
  Audio,
  staticFile,
  Img
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "800", "900"],
  subsets: ["latin"]
});
const { fontFamily: playfair } = loadPlayfair("normal", {
  weights: ["400", "900"],
  subsets: ["latin"]
});

export const QuoteVideo = ({ part1, part2, author, videoUrl, isImage, theme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  // Fallback theme (Viral Dark/Gold)
  const activeTheme = theme || {
    name: "Midnight Gold",
    gradient: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    accent: "#FFD700",
    search: "luxury, black, dark, elegant, watch, gold"
  };

  // --- ANIMATIONS ---
  // Timing: 0-7s Hook, 7s-End Reveal
  const hookEndFrame = 210; // 7 seconds at 30fps
  
  const hookOpacity = interpolate(frame, [0, 15, hookEndFrame - 15, hookEndFrame], [0, 1, 1, 0]);
  const revealOpacity = interpolate(frame, [hookEndFrame, hookEndFrame + 15], [0, 1]);
  
  // Kinetic Typography (Word-by-word)
  const words = part2.split(" ");
  
  // Smooth Zoom (Viral movement / Ken Burns)
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);

  // Handle text color
  const isLightTheme = activeTheme.name === "Morning Sky";
  const textColor = isLightTheme ? "#1a1a1a" : "white";
  const quoteColor = activeTheme.accent;
  const sf = width / 2160; // Scaling factor for 4K

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* Background Layer with Viral Grain/Vignette */}
      <AbsoluteFill style={{ transform: `scale(${scale})`, background: activeTheme.gradient }}>
        {videoUrl && (
          isImage ? (
            <Img 
              src={videoUrl} 
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: isLightTheme ? 0.6 : 0.7,
                filter: "contrast(1.1) brightness(0.8) saturate(1.2)"
              }}
            />
          ) : (
            <Video
              src={videoUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: isLightTheme ? 0.4 : 0.5,
                mixBlendMode: isLightTheme ? "multiply" : "screen",
                filter: "contrast(1.1) brightness(0.9)"
              }}
              muted
              loop
            />
          )
        )}
        {/* Cinematic Vignette */}
        <AbsoluteFill style={{ 
          background: "radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(0,0,0,0.9) 100%)",
          mixBlendMode: "multiply"
        }} />
      </AbsoluteFill>

      {/* Audio Layer */}
      <Audio src={staticFile("lofi.mp3")} volume={0.15} />

      {/* Watermark */}
      <div style={{
        position: "absolute",
        bottom: 120 * sf,
        left: "0",
        right: "0",
        textAlign: "center",
        fontFamily,
        fontSize: 48 * sf,
        fontWeight: "900",
        color: quoteColor,
        opacity: 0.3,
        letterSpacing: 12 * sf,
        textTransform: "uppercase",
        textShadow: `0 0 ${15 * sf}px ${quoteColor}`
      }}>
        MIND GAMBIT
      </div>

      {/* Part 1: THE HOOK (Suspenseful) */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 200 * sf,
          opacity: hookOpacity,
        }}
      >
        <div style={{ textAlign: "center", color: textColor }}>
          <div style={{ 
            fontSize: 320 * sf, 
            fontFamily: playfair, 
            marginBottom: -80 * sf, 
            color: quoteColor,
            textShadow: `0 0 ${40 * sf}px ${quoteColor}66`
          }}>
            “
          </div>
          <h1 style={{ 
            fontFamily: playfair, 
            fontSize: 140 * sf, 
            fontWeight: "900", 
            lineHeight: "1.2", 
            margin: "0",
            textShadow: `0 ${10 * sf}px ${40 * sf}px rgba(0,0,0,0.8)` 
          }}>
            {part1.toUpperCase()}
          </h1>
          <div style={{ 
            marginTop: 80 * sf, 
            height: 8 * sf, 
            width: 300 * sf, 
            backgroundColor: quoteColor, 
            marginInline: "auto",
            boxShadow: `0 0 ${30 * sf}px ${quoteColor}` 
          }} />
          <p style={{ 
            fontFamily, 
            fontSize: 60 * sf, 
            fontWeight: "800", 
            marginTop: 80 * sf, 
            textTransform: "uppercase", 
            letterSpacing: 12 * sf, 
            opacity: 0.9,
          }}>
            — {author} —
          </p>
        </div>
      </AbsoluteFill>

      {/* Part 2: THE REVEAL (Kinetic Typography) */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 150 * sf,
          opacity: revealOpacity,
        }}
      >
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "center", 
          alignItems: "center", 
          maxWidth: "90%" 
        }}>
          {words.map((word, i) => {
            const wordDelay = hookEndFrame + (i * 2); // 2 frames delay per word for fast 1-second reveal
            const wordSpring = spring({
              frame: frame - wordDelay,
              fps,
              config: { damping: 10, stiffness: 120 }
            });
            
            return (
              <span
                key={i}
                style={{
                  fontFamily: playfair,
                  fontSize: 180 * sf,
                  fontWeight: "900",
                  margin: `0 ${20 * sf}px`,
                  color: (i % 3 === 0) ? quoteColor : textColor,
                  transform: `scale(${wordSpring}) translateY(${(1 - wordSpring) * 50}px)`,
                  opacity: wordSpring,
                  textShadow: `0 0 ${40 * sf}px rgba(0,0,0,0.5)`,
                  display: "inline-block"
                }}
              >
                {word.toUpperCase()}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

