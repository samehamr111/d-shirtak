import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicFontFamily } from "../fonts";

interface OutroSceneProps {
  priceLabel: string;
  ctaText: string;
}

const BRAND = "#00c97a";

export const OutroScene: React.FC<OutroSceneProps> = ({ priceLabel, ctaText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const glow = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.3, 0.65]);

  const logoScale = spring({ frame, fps, from: 0.6, to: 1, durationInFrames: 20, config: { damping: 12, mass: 0.6 } });

  const pricePop = spring({
    frame: Math.max(0, frame - 14),
    fps,
    from: 0.4,
    to: 1,
    durationInFrames: 22,
    config: { damping: 9, mass: 0.5 },
  });
  const priceOpacity = interpolate(frame, [14, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ctaSlide = spring({
    frame: Math.max(0, frame - 30),
    fps,
    from: 30,
    to: 0,
    durationInFrames: 18,
    config: { damping: 14, mass: 0.6 },
  });
  const ctaOpacity = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#040404",
        opacity: sceneOpacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,201,122,${glow}) 0%, rgba(0,201,122,0) 70%)`,
        }}
      />

      <Img src={staticFile("logo-color.png")} style={{ width: 260, transform: `scale(${logoScale})`, position: "relative" }} />

      <div
        style={{
          marginTop: 20,
          padding: "10px 32px",
          borderRadius: 999,
          background: "rgba(0,201,122,0.12)",
          border: `2px solid rgba(0,201,122,${glow})`,
          opacity: priceOpacity,
          transform: `scale(${pricePop})`,
        }}
      >
        <p
          dir="rtl"
          style={{
            fontFamily: arabicFontFamily,
            color: BRAND,
            fontSize: 54,
            fontWeight: 800,
            margin: 0,
            textAlign: "center",
          }}
        >
          {priceLabel}
        </p>
      </div>

      <div
        style={{
          marginTop: 26,
          opacity: ctaOpacity,
          transform: `translateY(${ctaSlide}px)`,
          padding: "14px 34px",
          borderRadius: 12,
          background: `linear-gradient(90deg, ${BRAND}, #00926a)`,
          boxShadow: "0 10px 30px rgba(0,201,122,0.35)",
        }}
      >
        <p
          dir="rtl"
          style={{
            fontFamily: arabicFontFamily,
            color: "#040404",
            fontSize: 34,
            fontWeight: 700,
            margin: 0,
            textAlign: "center",
            maxWidth: 560,
          }}
        >
          {ctaText}
        </p>
      </div>
    </AbsoluteFill>
  );
};
