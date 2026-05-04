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
  const { fps, durationInFrames } = useVideoConfig();

  // Fallback theme if not provided
  const activeTheme = theme || {
    gradient: "linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)",
    accent: "#FFD700"
  };

  // Timing: Part 1 is 0-7s (0-210 frames), Part 2 is 7-9s (210-270 frames)
  const part1Opacity = interpolate(
    frame,
    [0, 15, 195, 210],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const part2Opacity = interpolate(
    frame,
    [210, 225, 255, 270],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);

  // Handle text color based on theme brightness
  const isLightTheme = activeTheme.name === "Morning Sky";
  const textColor = isLightTheme ? "#2d3436" : "white";
  const quoteColor = activeTheme.accent;

  return (
    <AbsoluteFill style={{ backgroundColor: isLightTheme ? "#fdfbf7" : "#1a1a1a", overflow: "hidden" }}>
      {/* Background Layer - DYNAMIC THEME */}
      <AbsoluteFill style={{ 
        transform: `scale(${scale})`,
        background: activeTheme.gradient
      }}>
        {videoUrl && (
          <Video
            src={videoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isLightTheme ? 0.4 : 0.6,
              mixBlendMode: isLightTheme ? "multiply" : "overlay"
            }}
            muted
            loop
            onError={(e) => console.error("Video load error:", e)}
          />
        )}
        <AbsoluteFill 
          style={{ 
            background: "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)"
          }} 
        />
      </AbsoluteFill>

      {/* Lofi Music */}
      <Audio src={staticFile("lofi.mp3")} volume={0.4} />

      {/* Watermark / Branding */}
      <div style={{
        position: "absolute",
        bottom: "60px",
        left: "0",
        right: "0",
        textAlign: "center",
        fontFamily,
        fontSize: "28px",
        fontWeight: "700",
        color: textColor,
        opacity: 0.5,
        letterSpacing: "4px",
        textTransform: "uppercase"
      }}>
        @MindGambit
      </div>

      {/* Part 1 Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "100px",
          paddingTop: "25%",
          opacity: part1Opacity,
        }}
      >
        <div style={{ textAlign: "center", color: textColor }}>
          <div style={{ fontSize: "140px", fontFamily: playfair, marginBottom: "-50px", opacity: 0.8, color: quoteColor }}>
            “
          </div>
          <h1 style={{ 
            fontFamily: playfair, 
            fontSize: "84px", 
            fontWeight: "800", 
            lineHeight: "1.2", 
            margin: "0",
            textShadow: isLightTheme ? "none" : "0 4px 15px rgba(0,0,0,0.2)" 
          }}>
            {part1.endsWith("...") ? part1 : `${part1}...`}
          </h1>
          <div style={{ marginTop: "50px", height: "3px", width: "120px", backgroundColor: quoteColor, marginInline: "auto" }} />
          <p style={{ fontFamily, fontSize: "38px", fontWeight: "600", marginTop: "50px", textTransform: "uppercase", letterSpacing: "6px", opacity: 0.9 }}>
            — {author} —
          </p>
        </div>
      </AbsoluteFill>

      {/* Part 2 Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px",
          opacity: part2Opacity,
        }}
      >
        <div style={{ textAlign: "center", color: textColor }}>
          <h1 style={{ 
            fontFamily: playfair, 
            fontSize: "100px", 
            fontWeight: "900", 
            lineHeight: "1.1", 
            color: quoteColor,
            textShadow: isLightTheme ? "none" : "0 10px 30px rgba(0,0,0,0.3)"
          }}>
            {part2}
          </h1>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
