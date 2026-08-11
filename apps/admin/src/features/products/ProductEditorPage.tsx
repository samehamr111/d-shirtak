import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GarmentType, ProductType, type ProductInput } from "@d-shirtak/shared";
import { useCategories } from "../catalog/api";
import { useCreateProduct, useProduct, useUpdateProduct } from "./api";
import { PageHeader } from "../../components/PageHeader";
import { Checkbox, Field, Input, PrimaryButton, Select, Textarea } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { useToast } from "../../components/Toast";
import { ProductColorsSection } from "./ProductColorsSection";
import { ProductSizesSection } from "./ProductSizesSection";
import { ProductVariantsSection } from "./ProductVariantsSection";

const EMPTY_FORM: ProductInput = {
  categoryId: "",
  code: "",
  garmentType: GarmentType.TEE,
  name: "",
  slug: "",
  description: "",
  basePrice: 0,
  costPrice: undefined,
  productType: ProductType.CUSTOMIZABLE,
  isActive: true,
};

export function ProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: product } = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(id ?? "");
  const { showToast } = useToast();

  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);

  useEffect(() => {
    if (product) {
      setForm({
        categoryId: product.categoryId,
        code: product.code,
        garmentType: product.garmentType,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        costPrice: product.costPrice,
        productType: product.productType,
        isActive: product.isActive,
      });
    }
  }, [product]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (isEdit && id) {
        await updateProduct.mutateAsync(form);
        showToast({ type: "success", message: "Product saved." });
      } else {
        const created = await createProduct.mutateAsync(form);
        showToast({ type: "success", message: "Product created." });
        navigate(`/products/${created.id}`, { replace: true });
      }
    } catch (err) {
      showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to save product." });
    }
  };

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit product${product ? `: ${product.name}` : ""}` : "New product"}
        description={isEdit ? undefined : "Create the base product first, then add colors, sizes, and variants."}
      />

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border border-ink/10 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </Field>
          <Field label="Style code (unique — for telling similar products apart, e.g. cotton vs. poly)">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </Field>
          <Field label="Garment shape (drives print-area alignment + AI mockup prompts)">
            <Select
              value={form.garmentType}
              onChange={(e) => setForm({ ...form, garmentType: e.target.value as ProductInput["garmentType"] })}
              required
            >
              <option value={GarmentType.TEE}>T-Shirt</option>
              <option value={GarmentType.HOODIE}>Hoodie</option>
            </Select>
          </Field>
          <Field label="Category">
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="" disabled>
                Select a category…
              </option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Base price (EGP) — what you sell it for">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
              required
            />
          </Field>
          <Field label="Cost price (EGP) — what you paid for it">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="optional"
              value={form.costPrice ?? ""}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </Field>
          <Field label="Product type">
            <Select
              value={form.productType}
              onChange={(e) => setForm({ ...form, productType: e.target.value as ProductInput["productType"] })}
              required
            >
              <option value={ProductType.CUSTOMIZABLE}>Customizable (blank canvas)</option>
              <option value={ProductType.READY_PRINTED}>Ready-Printed (fixed design)</option>
            </Select>
          </Field>
        </div>
        <Field label="Description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap gap-4">
          <Checkbox
            label="Active (visible in the storefront)"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
        </div>

        <PrimaryButton type="submit" disabled={saving}>
          {isEdit ? "Save changes" : "Create product"}
        </PrimaryButton>
      </form>

      {isEdit && id && product && (
        <div className="space-y-6">
          <ProductColorsSection productId={id} product={product} />
          <ProductSizesSection productId={id} product={product} />
          <ProductVariantsSection productId={id} product={product} />
        </div>
      )}
    </div>
  );
}
