import { useEffect, useState } from "react";
import type { FontDto } from "@d-shirtak/shared";

/** Loads each admin-uploaded font via the FontFace API so both the canvas and the font picker
 *  UI can render text in it immediately, without needing a stylesheet per font. */
export function useLoadWebFonts(fonts: FontDto[] | undefined): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!fonts || fonts.length === 0) {
      setReady(true);
      return;
    }
    let cancelled = false;
    Promise.all(
      fonts.map(async (font) => {
        try {
          const face = new FontFace(font.fontFamily, `url(${font.fileUrl})`);
          const loaded = await face.load();
          document.fonts.add(loaded);
        } catch {
          // font failed to load — the picker will still list it, falling back to the browser default
        }
      }),
    ).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [fonts]);

  return ready;
}
