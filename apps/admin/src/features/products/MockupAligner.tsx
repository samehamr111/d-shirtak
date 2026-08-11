import { useEffect, useRef, useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT, TORSO_FRAME, type GarmentType } from "@d-shirtak/shared";
import { Modal } from "../../components/Modal";
import { PrimaryButton, SecondaryButton } from "../../components/form";

const REFERENCE_W = 100;
const REFERENCE_H = 116;
const PREVIEW_PX_PER_UNIT = 3.6; // 360 x 417.6 preview canvas
const OUTER_GUIDE = { left: 6, top: 4, width: 88, height: 108 };
const PRINT_ZONE_TOP = 15;
const PRINT_ZONE_HEIGHT = 85;

interface AlignState {
  zoom: number;
  offsetX: number; // reference units, from frame center
  offsetY: number;
}

function draw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  pxPerUnit: number,
  state: AlignState,
  garmentType: GarmentType,
  showGuides: boolean,
) {
  const w = REFERENCE_W * pxPerUnit;
  const h = REFERENCE_H * pxPerUnit;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f4f4f5";
  ctx.fillRect(0, 0, w, h);

  const baseCoverScale = Math.max(w / img.width, h / img.height);
  const effectiveScale = baseCoverScale * state.zoom;
  const drawW = img.width * effectiveScale;
  const drawH = img.height * effectiveScale;
  const centerX = w / 2 + state.offsetX * pxPerUnit;
  const centerY = h / 2 + state.offsetY * pxPerUnit;
  ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);

  if (!showGuides) return;

  ctx.strokeStyle = "#ffffffaa";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(OUTER_GUIDE.left * pxPerUnit, OUTER_GUIDE.top * pxPerUnit, OUTER_GUIDE.width * pxPerUnit, OUTER_GUIDE.height * pxPerUnit);

  const torso = TORSO_FRAME[garmentType];
  ctx.strokeStyle = "#00c97a";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 5]);
  ctx.strokeRect(torso.left * pxPerUnit, PRINT_ZONE_TOP * pxPerUnit, torso.width * pxPerUnit, PRINT_ZONE_HEIGHT * pxPerUnit);
  ctx.setLineDash([]);
}

interface MockupAlignerProps {
  file: Blob;
  garmentType: GarmentType;
  side: "front" | "back";
  colorName: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export function MockupAligner({ file, garmentType, side, colorName, onConfirm, onCancel }: MockupAlignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [state, setState] = useState<AlignState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !ready) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    draw(ctx, img, PREVIEW_PX_PER_UNIT, state, garmentType, true);
  }, [state, ready, garmentType]);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  }
  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setState((s) => ({ ...s, offsetX: s.offsetX + dx / PREVIEW_PX_PER_UNIT, offsetY: s.offsetY + dy / PREVIEW_PX_PER_UNIT }));
  }
  function handlePointerUp() {
    dragRef.current = null;
  }
  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setState((s) => ({ ...s, zoom: Math.min(3, Math.max(0.5, s.zoom - e.deltaY * 0.001)) }));
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img) return;
    setExporting(true);
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = CANVAS_WIDTH;
    fullCanvas.height = CANVAS_HEIGHT;
    const ctx = fullCanvas.getContext("2d");
    if (!ctx) return;
    draw(ctx, img, CANVAS_WIDTH / REFERENCE_W, state, garmentType, false);
    fullCanvas.toBlob((blob) => {
      setExporting(false);
      if (blob) onConfirm(blob);
    }, "image/png");
  }

  const previewW = REFERENCE_W * PREVIEW_PX_PER_UNIT;
  const previewH = REFERENCE_H * PREVIEW_PX_PER_UNIT;

  return (
    <Modal title={`Align mockup — ${colorName} (${side})`} onClose={onCancel}>
      <p className="mb-3 text-sm text-ink/60">
        Drag to reposition, scroll/pinch to zoom. Line up the garment so it fills the white outer box and the chest
        sits inside the dashed green zone — that's what keeps the print-area guide on the chest instead of drifting
        onto a sleeve.
      </p>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={previewW}
          height={previewH}
          className="cursor-move touch-none rounded border border-ink/15"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs font-medium text-ink/60">Zoom</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={state.zoom}
          onChange={(e) => setState((s) => ({ ...s, zoom: Number(e.target.value) }))}
          className="w-full"
        />
        <SecondaryButton type="button" onClick={() => setState({ zoom: 1, offsetX: 0, offsetY: 0 })}>
          Reset
        </SecondaryButton>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="button" onClick={handleConfirm} disabled={!ready || exporting}>
          {exporting ? "Saving…" : "Use this image"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}
