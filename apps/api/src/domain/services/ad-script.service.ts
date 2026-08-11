/**
 * Builds Egyptian-colloquial Arabic ad copy from product data as a starting point -- the admin
 * always sees and can edit this text before a video is generated, so it doesn't need to be
 * perfect, just a reasonable first draft. Not written by a native copywriter; review tone/dialect
 * before relying on it for real campaigns.
 */
export interface AdScriptInput {
  productName: string;
  basePrice: number;
  colorNames: string[];
  garmentType: "TEE" | "HOODIE";
}

export function buildAdScript(input: AdScriptInput): string {
  const garmentWord = input.garmentType === "HOODIE" ? "الهودي" : "التيشيرت";
  const colorsPhrase = input.colorNames.length > 0 ? `متوفر بألوان ${input.colorNames.join("، ")}.` : "";

  return [
    `قدّملكم ${garmentWord} ${input.productName}.`,
    `تصميم مريح وجودة عالية تناسب يومك.`,
    colorsPhrase,
    `وتقدر كمان تصمم طباعتك الخاصة وتخلي القطعة بأسلوبك.`,
    `السعر بس ${input.basePrice} جنيه.`,
    `اطلب دلوقتي من D-Shirtak، وهيوصلك لحد باب البيت.`,
  ]
    .filter(Boolean)
    .join(" ");
}
