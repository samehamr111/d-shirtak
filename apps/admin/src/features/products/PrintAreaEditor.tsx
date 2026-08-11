import { useRef } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PX_PER_CM, TORSO_FRAME, type GarmentType } from "@d-shirtak/shared";

const REFERENCE_W = CANVAS_WIDTH / PX_PER_CM; // 100
const REFERENCE_H = CANVAS_HEIGHT / PX_PER_CM; // 116
const PREVIEW_SCALE = 3; // px per reference unit in this editor
const MIN_SIZE = 5;

export interface PrintAreaValue {
  widthCm: number;
  heightCm: number;
  offsetXCm: number;
  offsetYCm: number;
}

/** offsetX is never hand-entered -- it's always the print area centered within the garment's
 *  fixed torso frame, exactly like the seed data's centeredPrintArea() helper. Typing it by hand
 *  is exactly what let a print area drift onto a sleeve in the past. */
function centeredOffsetX(garmentType: GarmentType, widthCm: number): number {
  const torso = TORSO_FRAME[garmentType];
  return torso.left + (torso.width - widthCm) / 2;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

interface PrintAreaEditorProps {
  label: string;
  garmentType: GarmentType;
  backgroundImageUrl?: string;
  value: PrintAreaValue;
  onChange: (next: PrintAreaValue) => void;
}

export function PrintAreaEditor({ label, garmentType, backgroundImageUrl, value, onChange }: PrintAreaEditorProps) {
  const dragRef = useRef<{ mode: "move" | "resize"; startX: number; startY: number; start: PrintAreaValue } | null>(
    null,
  );
  const torso = TORSO_FRAME[garmentType];

  function setSize(widthCm: number, heightCm: number, offsetYCm: number) {
    const w = clamp(widthCm, MIN_SIZE, torso.width);
    const h = clamp(heightCm, MIN_SIZE, REFERENCE_H - offsetYCm);
    onChange({ widthCm: w, heightCm: h, offsetYCm, offsetXCm: centeredOffsetX(garmentType, w) });
  }

  function handleBodyPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { mode: "move", startX: e.clientX, startY: e.clientY, start: value };
  }
  function handleHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { mode: "resize", startX: e.clientX, startY: e.clientY, start: value };
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / PREVIEW_SCALE;
    const dy = (e.clientY - drag.startY) / PREVIEW_SCALE;
    if (drag.mode === "move") {
      const offsetYCm = clamp(drag.start.offsetYCm + dy, 0, REFERENCE_H - drag.start.heightCm);
      setSize(drag.start.widthCm, drag.start.heightCm, offsetYCm);
    } else {
      setSize(drag.start.widthCm + dx, drag.start.heightCm + dy, drag.start.offsetYCm);
    }
  }
  function handlePointerUp() {
    dragRef.current = null;
  }

  const previewW = REFERENCE_W * PREVIEW_SCALE;
  const previewH = REFERENCE_H * PREVIEW_SCALE;

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink/60">{label}</p>
      <div
        className="relative touch-none overflow-hidden rounded-lg border border-ink/15 bg-ink/5"
        style={{ width: previewW, height: previewH }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {backgroundImageUrl && (
          // Stretched to the full reference frame, same as the storefront canvas background — see SideCanvas.
          <img src={backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-fill" />
        )}
        {/* Torso guide -- reference only, not interactive */}
        <div
          className="pointer-events-none absolute rounded border border-dashed border-white/70"
          style={{
            left: torso.left * PREVIEW_SCALE,
            width: torso.width * PREVIEW_SCALE,
            top: 0,
            height: previewH,
          }}
        />
        {/* Print area box */}
        <div
          role="presentation"
          onPointerDown={handleBodyPointerDown}
          className="absolute cursor-move rounded border-2 border-dashed border-brand-500 bg-brand-500/10"
          style={{
            left: value.offsetXCm * PREVIEW_SCALE,
            top: value.offsetYCm * PREVIEW_SCALE,
            width: value.widthCm * PREVIEW_SCALE,
            height: value.heightCm * PREVIEW_SCALE,
          }}
        >
          <div
            role="presentation"
            onPointerDown={handleHandlePointerDown}
            className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-sm border-2 border-white bg-brand-500"
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-ink/60">
        <span>
          {value.widthCm.toFixed(1)} × {value.heightCm.toFixed(1)} cm
        </span>
        <span>·</span>
        <span>{value.offsetYCm.toFixed(1)} cm from top</span>
        <span className="text-ink/35">— drag to move, drag the corner to resize</span>
      </div>
    </div>
  );
}
