import { useEffect, useRef, useState } from "react";
import type { GarmentType } from "@d-shirtak/shared";
import { SecondaryButton } from "../../components/form";
import { MockupAligner } from "./MockupAligner";

interface MockupUploadSlotProps {
  label: string;
  side: "front" | "back";
  garmentType: GarmentType;
  colorName: string;
  value: Blob | null;
  onChange: (blob: Blob) => void;
}

export function MockupUploadSlot({ label, side, garmentType, colorName, value, onChange }: MockupUploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-ink/80">{label}</p>
      {previewUrl ? (
        <div className="flex items-center gap-2">
          <img src={previewUrl} alt={label} className="h-20 w-20 rounded border border-ink/15 object-cover" />
          <div className="flex flex-col gap-1">
            <SecondaryButton type="button" onClick={() => value && setPendingFile(value)}>
              Re-align
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => inputRef.current?.click()}>
              Replace
            </SecondaryButton>
          </div>
        </div>
      ) : (
        <SecondaryButton type="button" onClick={() => inputRef.current?.click()}>
          Choose file…
        </SecondaryButton>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFilePicked}
        className="hidden"
      />

      {pendingFile && (
        <MockupAligner
          file={pendingFile}
          garmentType={garmentType}
          side={side}
          colorName={colorName}
          onCancel={() => setPendingFile(null)}
          onConfirm={(blob) => {
            onChange(blob);
            setPendingFile(null);
          }}
        />
      )}
    </div>
  );
}
