/**
 * Makes an image's background transparent by flood-filling from its edges: pixels connected to
 * the border and close in color to the sampled edge color become transparent, stopping wherever
 * the color changes sharply (the actual subject's outline). Works well for flat graphics/logos
 * on a solid background, and reasonably for photos with a plain, fairly uniform background --
 * not real subject segmentation, so a busy/complex photo background won't cut out cleanly.
 */
export async function removeBackground(imageUrl: string, threshold = 32): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.drawImage(img, 0, 0);

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  const [r, g, b, a] = averageCornerColor(data, width, height);
  // A transparent PNG stores meaningless (often zeroed) RGB under a fully-transparent pixel --
  // sampling that as "the background color" would flood-fill on garbage data and can eat right
  // through the actual subject if its real color happens to be close to (0,0,0). If the edges
  // are already transparent, there's nothing to remove -- leave the image exactly as it is.
  if (a < 16) return imageUrl;

  const thresholdSq = threshold * threshold;
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];
  for (let x = 0; x < width; x++) {
    stack.push(x, 0, x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    stack.push(0, y, width - 1, y);
  }

  while (stack.length > 0) {
    const y = stack.pop() as number;
    const x = stack.pop() as number;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const i = idx * 4;
    // Already transparent (e.g. anti-aliased edge of an existing cutout) -- definitely
    // background, keep flowing through it without trusting its RGB for the color check below.
    if (data[i + 3]! < 16) {
      stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
      continue;
    }

    const dr = data[i]! - r;
    const dg = data[i + 1]! - g;
    const db = data[i + 2]! - b;
    if (dr * dr + dg * dg + db * db > thresholdSq) continue; // hit the subject's edge -- stop

    data[i + 3] = 0;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function averageCornerColor(data: Uint8ClampedArray, width: number, height: number): [number, number, number, number] {
  const corners: [number, number][] = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  for (const [x, y] of corners) {
    const i = (y * width + x) * 4;
    r += data[i]!;
    g += data[i + 1]!;
    b += data[i + 2]!;
    a += data[i + 3]!;
  }
  return [r / corners.length, g / corners.length, b / corners.length, a / corners.length];
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}
