import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { arabicFontFamily } from "../fonts";

interface IntroSceneProps {
  productName: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ productName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, from: 0.4, to: 1, durationInFrames: 22, config: { damping: 11, mass: 0.6 } });
  const nameSlide = spring({
    frame: Math.max(0, frame - 10),
    fps,
    from: 40,
    to: 0,
    durationInFrames: 20,
    config: { damping: 14, mass: 0.6 },
  });
  const nameOpacity = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sceneOpacity = interpolate(frame, [0, 12, 45, 60], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const glow = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.25, 0.55]);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(4,4,4,0.6)",
        opacity: sceneOpacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,201,122,${glow}) 0%, rgba(0,201,122,0) 70%)`,
        }}
      />
      <Img
        src={staticFile("logo-color.png")}
        style={{ width: 320, transform: `scale(${logoScale})`, position: "relative" }}
      />
      <p
        dir="rtl"
        style={{
          fontFamily: arabicFontFamily,
          color: "white",
          fontSize: 46,
          fontWeight: 700,
          marginTop: 24,
          textAlign: "center",
          opacity: nameOpacity,
          transform: `translateY(${nameSlide}px)`,
        }}
      >
        {productName}
      </p>
    </AbsoluteFill>
  );
};
