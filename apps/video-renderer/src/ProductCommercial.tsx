import { Audio, Sequence } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { ImageMontageScene } from "./scenes/ImageMontageScene";
import { OutroScene } from "./scenes/OutroScene";
import type { ProductCommercialProps } from "./types";

export type { ProductCommercialProps } from "./types";

export const FPS = 30;
const INTRO_FRAMES = 60; // 2s logo sting, overlaid on top of the montage's opening image
const OUTRO_FRAMES = 90; // 3s closing card
const AUDIO_START_DELAY_FRAMES = 15; // 0.5s of quiet before narration starts
const MAX_TOTAL_FRAMES = 3 * 60 * FPS; // hard cap at 3 minutes

/** Total video length tracks the narration's actual length (+ a little breathing room at the
 *  end for the outro card to land), capped at 3 minutes -- a short script makes a short video
 *  instead of a padded one. */
export function calculateTotalFrames(audioDurationInSeconds: number): number {
  const audioFrames = Math.round(audioDurationInSeconds * FPS) + AUDIO_START_DELAY_FRAMES;
  const withOutro = audioFrames + OUTRO_FRAMES;
  return Math.max(Math.min(withOutro, MAX_TOTAL_FRAMES), INTRO_FRAMES + OUTRO_FRAMES);
}

export const ProductCommercial: React.FC<ProductCommercialProps> = ({
  productName,
  priceLabel,
  imageUrls,
  audioUrl,
  audioDurationInSeconds,
  ctaText,
}) => {
  const totalFrames = calculateTotalFrames(audioDurationInSeconds);
  const montageFrames = totalFrames - OUTRO_FRAMES;

  return (
    <>
      <Sequence from={0} durationInFrames={montageFrames}>
        <ImageMontageScene imageUrls={imageUrls} durationInFrames={montageFrames} />
      </Sequence>

      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <IntroScene productName={productName} />
      </Sequence>

      <Sequence from={montageFrames} durationInFrames={OUTRO_FRAMES}>
        <OutroScene priceLabel={priceLabel} ctaText={ctaText} />
      </Sequence>

      {audioUrl && (
        <Sequence from={AUDIO_START_DELAY_FRAMES}>
          <Audio src={audioUrl} />
        </Sequence>
      )}
    </>
  );
};
