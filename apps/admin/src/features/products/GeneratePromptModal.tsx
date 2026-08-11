import { useState } from "react";
import type { GarmentType } from "@d-shirtak/shared";
import { Modal } from "../../components/Modal";
import { SecondaryButton } from "../../components/form";
import { buildMockupPrompt } from "./garment-prompt";

interface GeneratePromptModalProps {
  productName: string;
  garmentType: GarmentType;
  colorName: string;
  colorHex: string;
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

export function GeneratePromptModal({ productName, garmentType, colorName, colorHex, onClose }: GeneratePromptModalProps) {
  const frontPrompt = buildMockupPrompt({ garmentType, productName, colorName, colorHex, side: "front" });
  const backPrompt = buildMockupPrompt({ garmentType, productName, colorName, colorHex, side: "back" });

  return (
    <Modal title={`Mockup prompt — ${productName} / ${colorName}`} onClose={onClose}>
      <p className="mb-4 text-sm text-ink/60">
        Paste one of these into your image model, then upload the result below. The framing/lighting/background
        instructions are identical every time on purpose — reuse the same wording for every color so the whole set
        looks like one consistent photoshoot.
      </p>
      <div className="space-y-4">
        <PromptBlock label="Front" prompt={frontPrompt} />
        <PromptBlock label="Back" prompt={backPrompt} />
      </div>
    </Modal>
  );
}
