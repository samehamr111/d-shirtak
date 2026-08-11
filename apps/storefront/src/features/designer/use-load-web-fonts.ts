import { useMemo, useRef } from "react";
import type { FontDto } from "@d-shirtak/shared";

/** Loads a single admin-uploaded font via the FontFace API, on demand, so the canvas and font
 *  picker UI can render it once the user actually chooses to use it. Fonts are only ever fetched
 *  when needed — e.g. picking an Arabic font never pulls the English font files, and vice versa —
 *  and each font is loaded at most once per session. */
export function useFontLoader(): (font: FontDto) => Promise<void> {
  const cache = useRef(new Map<string, Promise<void>>());

  return useMemo(
    () => (font: FontDto) => {
      let promise = cache.current.get(font.id);
      if (!promise) {
        promise = (async () => {
          try {
            const face = new FontFace(font.fontFamily, `url(${font.fileUrl})`);
            const loaded = await face.load();
            document.fonts.add(loaded);
          } catch {
            // font failed to load — text using it will fall back to the browser default
          }
        })();
        cache.current.set(font.id, promise);
      }
      return promise;
    },
    [],
  );
}
