import { Composition } from "remotion";
import { QuoteVideo } from "./QuoteVideo";
import "./style.css";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MotivationalShort"
        component={QuoteVideo}
        durationInFrames={270} // 9 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          text: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
          videoUrl: "https://player.vimeo.com/external/370331493.sd.mp4?s=7b90124c16a246833b91e92d774a38f3&profile_id=139&oauth2_token_id=57447761", // Fallback video
        }}
      />
    </>
  );
};
