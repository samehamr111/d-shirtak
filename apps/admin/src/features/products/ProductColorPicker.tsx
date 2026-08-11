import { useState } from "react";
import type { GarmentType } from "@d-shirtak/shared";
import { useProducts } from "./api";
import { PrimaryButton, Select } from "../../components/form";

export interface ProductColorTarget {
  productName: string;
  garmentType: GarmentType;
  colorName: string;
  colorHex: string;
  sizeName?: string;
}

interface ProductColorPickerProps {
  onConfirm: (target: ProductColorTarget) => void;
  onCancel: () => void;
}

/** Pick a real product, then one of that product's own colors (and optionally one of its own
 *  sizes) -- so it's never possible to generate a prompt for a color/size a product doesn't
 *  actually offer. */
export function ProductColorPicker({ onConfirm, onCancel }: ProductColorPickerProps) {
  const { data: products } = useProducts();

  const [productId, setProductId] = useState("");
  const [colorId, setColorId] = useState("");
  const [sizeId, setSizeId] = useState("");

  const product = products?.find((p) => p.id === productId);
  const color = product?.colors.find((c) => c.colorId === colorId);
  const size = product?.sizes.find((s) => s.sizeId === sizeId);

  const handleProductChange = (id: string) => {
    setProductId(id);
    setColorId("");
    setSizeId("");
  };

  const confirm = () => {
    if (!product || !color) return;
    onConfirm({
      productName: product.name,
      garmentType: product.garmentType,
      colorName: color.color.name,
      colorHex: color.color.hexCode,
      sizeName: size?.size.name,
    });
  };

  return (
    <div className="space-y-2">
      <Select value={productId} onChange={(e) => handleProductChange(e.target.value)} className="w-full text-xs">
        <option value="" disabled>
          Product…
        </option>
        {products?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Select
        value={colorId}
        onChange={(e) => setColorId(e.target.value)}
        className="w-full text-xs"
        disabled={!product}
      >
        <option value="" disabled>
          Color…
        </option>
        {product?.colors.map((c) => (
          <option key={c.colorId} value={c.colorId}>
            {c.color.name}
          </option>
        ))}
      </Select>
      <Select
        value={sizeId}
        onChange={(e) => setSizeId(e.target.value)}
        className="w-full text-xs"
        disabled={!product}
      >
        <option value="">Size (optional)…</option>
        {product?.sizes.map((s) => (
          <option key={s.sizeId} value={s.sizeId}>
            {s.size.name}
          </option>
        ))}
      </Select>
      <div className="flex gap-2">
        <PrimaryButton type="button" onClick={confirm} disabled={!product || !color} className="text-xs">
          Generate
        </PrimaryButton>
        <button type="button" onClick={onCancel} className="text-xs text-ink/50 hover:text-ink">
          Cancel
        </button>
      </div>
    </div>
  );
}
