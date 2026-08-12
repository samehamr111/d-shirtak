import { useState } from "react";
import type { GarmentType } from "@d-shirtak/shared";
import { Modal } from "../../components/Modal";
import { SecondaryButton } from "../../components/form";
import { buildModelShotPrompt } from "./model-shot-prompt";

interface ModelShotPromptModalProps {
  productName: string;
  garmentType: GarmentType;
  colorName: string;
  colorHex: string;
  designImageUrl: string;
  sizeName?: string;
  onClose: () => void;
}

function PromptBlock({ label, prompt }: { label: string; prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <SecondaryButton type="button" onClick={copy}>
          {copied ? "Copied!" : "Copy"}
        </SecondaryButton>
      </div>
      <pre className="whitespace-pre-wrap rounded border border-ink/15 bg-ink/[0.03] p-3 text-xs leading-relaxed text-ink/80">
        {prompt}
      </pre>
    </div>
  );
}

export function ModelShotPromptModal({
  productName,
  garmentType,
  colorName,
  colorHex,
  designImageUrl,
  sizeName,
  onClose,
}: ModelShotPromptModalProps) {
  const frontPrompt = buildModelShotPrompt({ garmentType, productName, colorName, colorHex, sizeName, side: "front" });
  const backPrompt = buildModelShotPrompt({ garmentType, productName, colorName, colorHex, sizeName, side: "back" });

  return (
    <Modal title={`Model-shot prompt — ${productName} / ${colorName}`} onClose={onClose}>
      <p className="mb-4 text-sm text-ink/60">
        Attach the design image below alongside one of these prompts in your image model, then close this and use the
        upload button on that card to save the result.
      </p>
      <div className="mb-4 flex items-center gap-3 rounded border border-ink/15 bg-ink/[0.03] p-3">
        <img src={designImageUrl} alt="Design to feature" className="h-16 w-16 rounded border border-ink/10 object-contain bg-white" />
        <div className="flex-1 text-sm text-ink/70">This is the design to reproduce on the garment.</div>
        <a
          href={designImageUrl}
          download
          className="rounded border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
        >
          Download
        </a>
      </div>
      <div className="space-y-4">
        <PromptBlock label="Front" prompt={frontPrompt} />
        <PromptBlock label="Back" prompt={backPrompt} />
      </div>
    </Modal>
  );
}
