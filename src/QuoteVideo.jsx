import { 
  AbsoluteFill, 
  useVideoConfig, 
  useCurrentFrame, 
  interpolate, 
  spring,
  Video,
  Audio,
  staticFile
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

const { fontFamily } = loadFont();
const { fontFamily: playfair } = loadPlayfair();

export const QuoteVideo = ({ part1, part2, author, videoUrl, theme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  // Fallback theme (Viral Dark/Gold)
  const activeTheme = theme || {
    name: "Midnight Gold",
    gradient: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    accent: "#FFD700",
    search: "dark, moody, luxury"
  };

  // --- ANIMATIONS ---
  const part1Opacity = interpolate(frame, [0, 15, 195, 210], [0, 1, 1, 0]);
  const part2Opacity = interpolate(frame, [210, 225, 255, 270], [0, 1, 1, 0]);
  
  // Smooth Zoom (Viral movement)
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.2]);

  // Spring entrance for Part 2 (Viral "Pop")
  const part2Spring = spring({ frame: frame - 210, fps, config: { damping: 12, stiffness: 100 } });

  // Floating effect for author
  const floatY = interpolate(frame, [0, durationInFrames], [0, -20]);

  // Handle text color
  const isLightTheme = activeTheme.name === "Morning Sky";
  const textColor = isLightTheme ? "#1a1a1a" : "white";
  const quoteColor = activeTheme.accent;
  const sf = width / 1080;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* Background Layer with Viral Grain/Vignette */}
      <AbsoluteFill style={{ transform: `scale(${scale})`, background: activeTheme.gradient }}>
        {videoUrl && (
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
        )}
        {/* Cinematic Vignette */}
        <AbsoluteFill style={{ 
          background: "radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)",
          mixBlendMode: "multiply"
        }} />
      </AbsoluteFill>

      {/* Background Music */}
      <Audio src={staticFile("lofi.mp3")} volume={0.4} />

      {/* Watermark */}
      <div style={{
        position: "absolute",
        bottom: 80 * sf,
        left: "0",
        right: "0",
        textAlign: "center",
        fontFamily,
        fontSize: 32 * sf,
        fontWeight: "900",
        color: quoteColor,
        opacity: 0.4,
        letterSpacing: 8 * sf,
        textTransform: "uppercase",
        textShadow: `0 0 ${10 * sf}px ${quoteColor}`
      }}>
        MIND GAMBIT
      </div>

      {/* Part 1: THE HOOK (Suspenseful) */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: 100 * sf,
          paddingTop: "30%",
          opacity: part1Opacity,
        }}
      >
        <div style={{ textAlign: "center", color: textColor }}>
          <div style={{ 
            fontSize: 160 * sf, 
            fontFamily: playfair, 
            marginBottom: -40 * sf, 
            color: quoteColor,
            textShadow: `0 0 ${20 * sf}px ${quoteColor}66`
          }}>
            “
          </div>
          <h1 style={{ 
            fontFamily: playfair, 
            fontSize: 92 * sf, 
            fontWeight: "900", 
            lineHeight: "1.1", 
            margin: "0",
            textShadow: isLightTheme ? "none" : `0 ${5 * sf}px ${25 * sf}px rgba(0,0,0,0.5)` 
          }}>
            {part1.endsWith("...") ? part1 : `${part1}...`}
          </h1>
          <div style={{ 
            marginTop: 60 * sf, 
            height: 4 * sf, 
            width: 150 * sf, 
            backgroundColor: quoteColor, 
            marginInline: "auto",
            boxShadow: `0 0 ${15 * sf}px ${quoteColor}` 
          }} />
          <p style={{ 
            fontFamily, 
            fontSize: 40 * sf, 
            fontWeight: "800", 
            marginTop: 60 * sf, 
            textTransform: "uppercase", 
            letterSpacing: 8 * sf, 
            opacity: 0.8,
            transform: `translateY(${floatY}px)`
          }}>
            — {author} —
          </p>
        </div>
      </AbsoluteFill>

      {/* Part 2: THE REVEAL (Impactful) */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 80 * sf,
          opacity: part2Opacity,
          transform: `scale(${interpolate(part2Spring, [0, 1], [0.8, 1])})`
        }}
      >
        <div style={{ textAlign: "center", color: textColor }}>
          <h1 style={{ 
            fontFamily: playfair, 
            fontSize: 120 * sf, 
            fontWeight: "900", 
            lineHeight: "1", 
            color: quoteColor,
            textShadow: `0 0 ${40 * sf}px ${quoteColor}88, 0 ${10 * sf}px ${40 * sf}px rgba(0,0,0,0.5)`
          }}>
            {part2}
          </h1>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
