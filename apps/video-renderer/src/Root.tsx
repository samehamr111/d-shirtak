import { Composition } from "remotion";
import { ProductCommercial, calculateTotalFrames, FPS } from "./ProductCommercial";
import { productCommercialSchema, type ProductCommercialProps } from "./types";

const defaultProps: ProductCommercialProps = {
  productName: "Classic Crew Tee",
  priceLabel: "350 جنيه",
  imageUrls: [],
  audioUrl: "",
  audioDurationInSeconds: 20,
  ctaText: "صمم قطعتك دلوقتي على D-Shirtak",
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ProductCommercial"
      component={ProductCommercial}
      schema={productCommercialSchema}
      durationInFrames={calculateTotalFrames(defaultProps.audioDurationInSeconds)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
      calculateMetadata={async ({ props }) => ({
        durationInFrames: calculateTotalFrames(props.audioDurationInSeconds),
      })}
    />
  );
};
