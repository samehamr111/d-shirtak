import { AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicFontFamily } from "../fonts";

interface ImageMontageSceneProps {
  imageUrls: string[];
  durationInFrames: number;
}

const FADE_FRAMES = 15;
const BRAND = "#00c97a";

const CAPTION_POOL = ["جودة عالية وخامة مريحة", "تصميم يناسب يومك", "استايل يعبّر عنك", "طباعة تدوم طويلاً"];

function KenBurnsImage({ src, beatFrames, direction }: { src: string; beatFrames: number; direction: 1 | -1 }) {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, beatFrames], [1, 1.15], { extrapolateRight: "clamp" });
  const translateX = interpolate(frame, [0, beatFrames], [0, direction * -3], { extrapolateRight: "clamp" });
  const opacity = interpolate(
    frame,
    [0, FADE_FRAMES, beatFrames - FADE_FRAMES, beatFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "#0a0a0a" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${translateX}%)`,
        }}
      />
    </AbsoluteFill>
  );
}

function BeatCaption({ text, beatFrames }: { text: string; beatFrames: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    from: 50,
    to: 0,
    durationInFrames: 18,
    config: { damping: 14, mass: 0.6 },
  });
  const fadeOut = interpolate(frame, [beatFrames - 14, beatFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 220 }}>
      <div
        dir="rtl"
        style={{
          opacity,
          transform: `translateY(${slideIn}px)`,
          background: "rgba(4,4,4,0.72)",
          borderRight: `4px solid ${BRAND}`,
          borderRadius: "12px 0 0 12px",
          padding: "14px 26px",
          maxWidth: "80%",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <span style={{ fontFamily: arabicFontFamily, color: "white", fontSize: 34, fontWeight: 600 }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
}

export const ImageMontageScene: React.FC<ImageMontageSceneProps> = ({ imageUrls, durationInFrames }) => {
  const beatFrames = Math.max(1, Math.floor(durationInFrames / imageUrls.length));

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {imageUrls.map((src, i) => (
        <Sequence key={src + i} from={i * beatFrames} durationInFrames={beatFrames}>
          <KenBurnsImage src={src} beatFrames={beatFrames} direction={i % 2 === 0 ? 1 : -1} />
          {i > 0 && <BeatCaption text={CAPTION_POOL[(i - 1) % CAPTION_POOL.length]!} beatFrames={beatFrames} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
