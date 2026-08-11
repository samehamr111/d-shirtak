import { useState } from "react";
import { useDesignAssets, useUserUploads } from "../design-library/api";
import { Modal } from "../../components/Modal";

interface DesignImagePickerProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

type Tab = "library" | "uploads";

export function DesignImagePicker({ onSelect, onClose }: DesignImagePickerProps) {
  const [tab, setTab] = useState<Tab>("library");
  const { data: assets, isLoading: assetsLoading } = useDesignAssets();
  const { data: uploads, isLoading: uploadsLoading } = useUserUploads();

  const items =
    tab === "library"
      ? (assets ?? []).map((a) => ({ id: a.id, imageUrl: a.imageUrl, label: a.name }))
      : (uploads ?? []).map((u) => ({ id: u.id, imageUrl: u.imageUrl, label: u.uploaderEmail }));
  const loading = tab === "library" ? assetsLoading : uploadsLoading;

  return (
    <Modal title="Choose a design to feature" onClose={onClose}>
      <div className="mb-4 flex gap-2 border-b border-ink/10 pb-2">
        <button
          type="button"
          onClick={() => setTab("library")}
          className={`rounded px-3 py-1.5 text-sm font-medium ${tab === "library" ? "bg-brand-500 text-white" : "text-ink/60 hover:bg-ink/5"}`}
        >
          Library
        </button>
        <button
          type="button"
          onClick={() => setTab("uploads")}
          className={`rounded px-3 py-1.5 text-sm font-medium ${tab === "uploads" ? "bg-brand-500 text-white" : "text-ink/60 hover:bg-ink/5"}`}
        >
          Customer uploads
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded border border-dashed border-ink/20 p-6 text-center text-sm text-ink/60">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.imageUrl)}
              className="rounded border border-ink/10 p-2 text-left hover:border-brand-500"
            >
              <img src={item.imageUrl} alt={item.label} className="mb-1 h-16 w-full rounded object-contain" />
              <p className="truncate text-xs text-ink/60">{item.label}</p>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
