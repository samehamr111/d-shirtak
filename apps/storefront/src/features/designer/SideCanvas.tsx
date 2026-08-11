import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Canvas, FabricImage, IText, Rect } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PX_PER_CM } from "./canvas-constants";

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

export interface SideCanvasHandle {
  addText: (text: string, style: TextStyle) => void;
  addImageFromUrl: (url: string, crossOrigin?: boolean) => Promise<void>;
  deleteSelected: () => void;
  applyTextStyle: (style: Partial<TextStyle>) => void;
  bringForward: () => void;
  sendBackward: () => void;
  exportPng: () => string;
  exportJson: () => Record<string, unknown>;
  hasContent: () => boolean;
  loadJson: (json: Record<string, unknown> | null) => Promise<void>;
}

interface SideCanvasProps {
  backgroundUrl: string | undefined;
  printArea: PrintAreaCm | undefined;
  visible: boolean;
  onSelectionChange?: (selection: { isText: boolean; style?: TextStyle } | null) => void;
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
      async addImageFromUrl(url, crossOrigin = true) {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const img = await FabricImage.fromURL(url, crossOrigin ? { crossOrigin: "anonymous" } : {});
        const maxDim = printArea ? printArea.widthCm * PX_PER_CM : CANVAS_WIDTH * 0.4;
        const scale = Math.min(1, maxDim / (img.width || maxDim));
        const centerX = printArea ? (printArea.offsetXCm + printArea.widthCm / 2) * PX_PER_CM : CANVAS_WIDTH / 2;
        const centerY = printArea ? (printArea.offsetYCm + printArea.heightCm / 2) * PX_PER_CM : CANVAS_HEIGHT / 2;
        img.set({ left: centerX, top: centerY, originX: "center", originY: "center", scaleX: scale, scaleY: scale });
        canvas.add(img);
        canvas.setActiveObject(img);
        keepGuideOnTop();
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

  return (
    <canvas
      ref={canvasElRef}
      className={visible ? "block h-full w-full" : "hidden"}
      aria-label="Design canvas"
    />
  );
});
