import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Canvas, FabricImage, FabricObject, InteractiveFabricObject, IText, Rect } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PX_PER_CM } from "./canvas-constants";
import { removeBackground } from "./remove-background";

// Fabric's default selection handles (13px, invisible "transparent" corners, a 24px touch
// target) are sized for mouse precision -- on a phone they're nearly impossible to grab
// accurately, making resize/rotate feel broken. Bigger, visible, circular handles plus some
// breathing room around the selection border fix that for every object this canvas creates.
InteractiveFabricObject.ownDefaults = {
  ...InteractiveFabricObject.ownDefaults,
  cornerSize: 22,
  touchCornerSize: 44,
  cornerStyle: "circle",
  transparentCorners: false,
  cornerColor: "#f8471a",
  cornerStrokeColor: "#111111",
  borderColor: "#111111",
  borderScaleFactor: 2,
  padding: 8,
};

/** Keeps a canvas object's rendered bounding box (which accounts for its current scale and
 *  rotation) inside the print-area guide rect -- nothing the customer places should be able to
 *  grow or drag past the printable region and end up on a sleeve, seam, or off the garment
 *  entirely. If the object is simply bigger than the area in some dimension, it gets centered on
 *  that axis instead of fighting to satisfy both edges at once. */
function clampPositionToArea(obj: FabricObject, area: Rect): void {
  const bounds = obj.getBoundingRect();
  const areaLeft = area.left;
  const areaTop = area.top;
  const areaWidth = area.width;
  const areaHeight = area.height;

  let dx = 0;
  if (bounds.width > areaWidth) {
    dx = areaLeft + (areaWidth - bounds.width) / 2 - bounds.left;
  } else if (bounds.left < areaLeft) {
    dx = areaLeft - bounds.left;
  } else if (bounds.left + bounds.width > areaLeft + areaWidth) {
    dx = areaLeft + areaWidth - (bounds.left + bounds.width);
  }

  let dy = 0;
  if (bounds.height > areaHeight) {
    dy = areaTop + (areaHeight - bounds.height) / 2 - bounds.top;
  } else if (bounds.top < areaTop) {
    dy = areaTop - bounds.top;
  } else if (bounds.top + bounds.height > areaTop + areaHeight) {
    dy = areaTop + areaHeight - (bounds.top + bounds.height);
  }

  if (dx !== 0 || dy !== 0) {
    obj.set({ left: (obj.left ?? 0) + dx, top: (obj.top ?? 0) + dy });
    obj.setCoords();
  }
}

function clampScaleToArea(obj: FabricObject, area: Rect): void {
  const bounds = obj.getBoundingRect();
  const scaleFactor = Math.min(1, area.width / bounds.width, area.height / bounds.height);
  if (scaleFactor < 1) {
    obj.set({ scaleX: (obj.scaleX ?? 1) * scaleFactor, scaleY: (obj.scaleY ?? 1) * scaleFactor });
    obj.setCoords();
  }
  clampPositionToArea(obj, area);
}

export interface PrintAreaCm {
  widthCm: number;
  heightCm: number;
  offsetXCm: number;
  offsetYCm: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fill: string;
}

export interface AddImageMeta {
  /** The un-background-removed source -- what "restore" reverts to. Defaults to `url` itself. */
  originalUrl?: string;
  bgRemoved?: boolean;
}

export interface SideCanvasHandle {
  addText: (text: string, style: TextStyle) => void;
  addImageFromUrl: (url: string, crossOrigin?: boolean, meta?: AddImageMeta) => Promise<void>;
  /** Toggles the selected image between its background-removed and original version. No-ops if
   *  the current selection isn't an image. */
  toggleSelectedBackground: () => Promise<void>;
  deleteSelected: () => void;
  applyTextStyle: (style: Partial<TextStyle>) => void;
  bringForward: () => void;
  sendBackward: () => void;
  exportPng: () => string;
  exportJson: () => Record<string, unknown>;
  hasContent: () => boolean;
  /** How many chargeable elements (text blocks, images) are on this side right now -- mirrors
   *  the backend's countDesignElements so the price shown while designing matches what actually
   *  gets charged when it's added to cart. */
  elementCount: () => number;
  loadJson: (json: Record<string, unknown> | null) => Promise<void>;
}

export interface CanvasSelection {
  isText: boolean;
  style?: TextStyle;
  isImage?: boolean;
  bgRemoved?: boolean;
}

interface SideCanvasProps {
  backgroundUrl: string | undefined;
  printArea: PrintAreaCm | undefined;
  visible: boolean;
  onSelectionChange?: (selection: CanvasSelection | null) => void;
  onBackgroundError?: () => void;
}

export const SideCanvas = forwardRef<SideCanvasHandle, SideCanvasProps>(function SideCanvas(
  { backgroundUrl, printArea, visible, onSelectionChange, onBackgroundError },
  ref,
) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const guideRef = useRef<Rect | null>(null);
  const selectedRef = useRef<IText | null>(null);
  // Tracks each image's un-background-removed source and current toggle state, keyed by the
  // fabric object itself -- not serialized/persisted, purely a live-editing convenience (once
  // exported, whatever's on the canvas is baked in, same as a text edit).
  const imageMetaRef = useRef(new WeakMap<FabricObject, { originalUrl: string; bgRemoved: boolean }>());
  // Callers (e.g. DesignerPage) pass onBackgroundError as an inline arrow function, which is a
  // new reference every render. Keeping it out of the image-load effect's dependency array via a
  // ref -- rather than listing it there -- stops that effect from re-fetching the background
  // image (a real network request) on every unrelated re-render of the parent page.
  const onBackgroundErrorRef = useRef(onBackgroundError);
  onBackgroundErrorRef.current = onBackgroundError;

  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      preserveObjectStacking: true,
    });
    canvas.setDimensions({ width: "100%", height: "100%" }, { cssOnly: true });
    fabricRef.current = canvas;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      const isText = active instanceof IText;
      selectedRef.current = isText ? active : null;
      if (!active) {
        onSelectionChange?.(null);
      } else if (isText) {
        onSelectionChange?.({
          isText: true,
          style: { fontFamily: String(active.fontFamily), fontSize: Number(active.fontSize), fill: String(active.fill) },
        });
      } else if (active instanceof FabricImage) {
        const meta = imageMetaRef.current.get(active);
        onSelectionChange?.({ isText: false, isImage: true, bgRemoved: meta?.bgRemoved ?? false });
      } else {
        onSelectionChange?.({ isText: false });
      }
    };
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => {
      selectedRef.current = null;
      onSelectionChange?.(null);
    });

    // Nothing the customer places should end up outside the printable area -- otherwise part of
    // it lands on a sleeve, a seam, or off the garment entirely. Correcting this live, on
    // object:moving/scaling/rotating, sounds right but isn't: fabric recomputes left/top/scale
    // from the drag's original anchor plus total pointer distance on every single pointer-move
    // frame, not incrementally from the previous frame -- so a correction applied this frame gets
    // silently overwritten by fabric's own recompute on the very next one. The object still
    // escapes, and now there's wasted work fighting it every frame, which reads as lag. Snapping
    // back once the gesture actually finishes (object:modified fires once, on release) sidesteps
    // that fight entirely and is the reliable way to do this in fabric.
    canvas.on("object:modified", (e) => {
      if (!e.target || !guideRef.current) return;
      clampScaleToArea(e.target, guideRef.current);
      canvas.requestRenderAll();
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !backgroundUrl) return;
    let cancelled = false;
    FabricImage.fromURL(backgroundUrl, { crossOrigin: "anonymous" })
      .then((img) => {
        if (cancelled || !fabricRef.current) return;
        // A CORS-blocked or 404'd image resolves as a zero-size FabricImage instead of
        // rejecting — catch that here too, not just the .catch() below.
        if (!img.width || !img.height) {
          onBackgroundErrorRef.current?.();
          return;
        }
        img.set({
          left: 0,
          top: 0,
          originX: "left",
          originY: "top",
          scaleX: CANVAS_WIDTH / img.width,
          scaleY: CANVAS_HEIGHT / img.height,
          selectable: false,
          evented: false,
        });
        canvas.backgroundImage = img;
        canvas.renderAll();
      })
      .catch(() => {
        if (!cancelled) onBackgroundErrorRef.current?.();
      });
    return () => {
      cancelled = true;
    };
  }, [backgroundUrl]);

  useEffect(() => {
    const canvas = fabricRef.current;
    // The canvas element is CSS `display:none` while its side isn't active. Fabric computes its
    // wrapper/container sizing from the element's live layout box, so a canvas that was hidden
    // when the background image finished loading can end up stuck at zero size -- it never
    // actually draws once revealed, even though the fetch succeeded and no error ever fired.
    // Re-applying the CSS dimensions and forcing a render once the element is visible again fixes
    // that without needing to recreate the canvas.
    if (!canvas || !visible) return;
    canvas.setDimensions({ width: "100%", height: "100%" }, { cssOnly: true });
    canvas.requestRenderAll();
  }, [visible]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !printArea) return;

    if (guideRef.current) {
      canvas.remove(guideRef.current);
    }
    const guide = new Rect({
      left: printArea.offsetXCm * PX_PER_CM,
      top: printArea.offsetYCm * PX_PER_CM,
      width: printArea.widthCm * PX_PER_CM,
      height: printArea.heightCm * PX_PER_CM,
      fill: "transparent",
      stroke: "rgba(4,4,4,0.28)",
      strokeDashArray: [6, 5],
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      hoverCursor: "default",
    });
    guideRef.current = guide;
    canvas.add(guide);
    canvas.bringObjectToFront(guide);
    canvas.renderAll();
  }, [printArea]);

  function keepGuideOnTop() {
    const canvas = fabricRef.current;
    if (canvas && guideRef.current) canvas.bringObjectToFront(guideRef.current);
    canvas?.renderAll();
  }

  useImperativeHandle(
    ref,
    (): SideCanvasHandle => ({
      addText(text, style) {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const centerX = printArea ? (printArea.offsetXCm + printArea.widthCm / 2) * PX_PER_CM : CANVAS_WIDTH / 2;
        const centerY = printArea ? (printArea.offsetYCm + printArea.heightCm / 2) * PX_PER_CM : CANVAS_HEIGHT / 2;
        const textbox = new IText(text, {
          left: centerX,
          top: centerY,
          originX: "center",
          originY: "center",
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fill: style.fill,
        });
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        keepGuideOnTop();
      },
      async addImageFromUrl(url, crossOrigin = true, meta) {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const img = await FabricImage.fromURL(url, crossOrigin ? { crossOrigin: "anonymous" } : {});
        const maxDim = printArea ? printArea.widthCm * PX_PER_CM : CANVAS_WIDTH * 0.4;
        const scale = Math.min(1, maxDim / (img.width || maxDim));
        const centerX = printArea ? (printArea.offsetXCm + printArea.widthCm / 2) * PX_PER_CM : CANVAS_WIDTH / 2;
        const centerY = printArea ? (printArea.offsetYCm + printArea.heightCm / 2) * PX_PER_CM : CANVAS_HEIGHT / 2;
        img.set({ left: centerX, top: centerY, originX: "center", originY: "center", scaleX: scale, scaleY: scale });
        imageMetaRef.current.set(img, { originalUrl: meta?.originalUrl ?? url, bgRemoved: meta?.bgRemoved ?? false });
        canvas.add(img);
        canvas.setActiveObject(img);
        keepGuideOnTop();
      },
      async toggleSelectedBackground() {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!canvas || !active || !(active instanceof FabricImage)) return;
        // No tracked entry (e.g. an object loaded from a previously-saved design) -- fall back to
        // treating its current source as "original" so toggling still works from here on.
        const existing = imageMetaRef.current.get(active);
        const meta = existing ?? { originalUrl: active.getSrc(), bgRemoved: false };
        if (!meta.originalUrl) return;

        if (meta.bgRemoved) {
          await active.setSrc(meta.originalUrl, { crossOrigin: "anonymous" });
          meta.bgRemoved = false;
        } else {
          const processed = await removeBackground(meta.originalUrl).catch(() => meta.originalUrl);
          await active.setSrc(processed, {});
          meta.bgRemoved = processed !== meta.originalUrl;
        }
        imageMetaRef.current.set(active, meta);
        canvas.requestRenderAll();
        onSelectionChange?.({ isText: false, isImage: true, bgRemoved: meta.bgRemoved });
      },
      deleteSelected() {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!canvas || !active) return;
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.renderAll();
      },
      applyTextStyle(style) {
        const canvas = fabricRef.current;
        const active = selectedRef.current;
        if (!canvas || !active) return;
        active.set(style);
        canvas.renderAll();
      },
      bringForward() {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!canvas || !active) return;
        canvas.bringObjectForward(active);
        keepGuideOnTop();
      },
      sendBackward() {
        const canvas = fabricRef.current;
        const active = canvas?.getActiveObject();
        if (!canvas || !active) return;
        canvas.sendObjectBackwards(active);
      },
      exportPng() {
        const canvas = fabricRef.current;
        if (!canvas) return "";
        const guide = guideRef.current;
        if (guide) guide.visible = false;
        canvas.discardActiveObject();
        canvas.renderAll();
        const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
        if (guide) guide.visible = true;
        canvas.renderAll();
        return dataUrl;
      },
      exportJson() {
        const canvas = fabricRef.current;
        if (!canvas) return {};
        return canvas.toJSON() as Record<string, unknown>;
      },
      hasContent() {
        const canvas = fabricRef.current;
        if (!canvas) return false;
        return canvas.getObjects().some((obj) => obj !== guideRef.current);
      },
      elementCount() {
        const canvas = fabricRef.current;
        if (!canvas) return 0;
        return canvas.getObjects().filter((obj) => obj !== guideRef.current).length;
      },
      async loadJson(json) {
        const canvas = fabricRef.current;
        if (!canvas || !json) return;
        await canvas.loadFromJSON(json);
        canvas.getObjects().forEach((obj) => {
          if (obj.excludeFromExport) canvas.remove(obj);
        });
        guideRef.current = null;
        canvas.renderAll();
      },
    }),
    [printArea],
  );

  // Fabric replaces this <canvas> with its own wrapper div (and a second, internally-managed
  // "upper canvas" for the selection layer) as soon as it initializes, copying whatever class the
  // element had AT THAT MOMENT onto those internal layers -- it never re-syncs after. Toggling
  // `hidden`/`block` on the canvas itself therefore only ever affects the very first render: once
  // Fabric has taken over, this node is nested inside a wrapper Fabric owns, not positioned by us,
  // so it just falls into normal document flow (stacking below the other side, clipped by the
  // parent's overflow:hidden) regardless of later visibility changes. Owning the visibility toggle
  // on a plain div we keep control of -- one level up from anything Fabric touches -- sidesteps
  // that entirely.
  return (
    <div className={visible ? "absolute inset-0" : "hidden"}>
      <canvas ref={canvasElRef} aria-label="Design canvas" />
    </div>
  );
});
