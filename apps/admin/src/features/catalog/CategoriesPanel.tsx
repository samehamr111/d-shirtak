import { useState, type FormEvent } from "react";
import { useCategories, useCreateCategory, useDeleteCategory } from "./api";
import { DataTable } from "../../components/DataTable";
import { Field, Input, PrimaryButton, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { useToast } from "../../components/Toast";

export function CategoriesPanel() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createCategory.mutateAsync({ name, slug });
      showToast({ type: "success", message: `Category "${name}" added.` });
      setName("");
      setSlug("");
    } catch (err) {
      showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to create category." });
    }
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id, {
      onSuccess: () => showToast({ type: "success", message: "Category deleted." }),
      onError: (err) =>
        showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to delete category." }),
    });
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">Categories</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-2">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Slug">
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </Field>
        <PrimaryButton type="submit" disabled={createCategory.isPending}>
          Add
        </PrimaryButton>
      </form>
      {isLoading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (
        <DataTable
          rowKey={(row) => row.id}
          rows={categories ?? []}
          emptyMessage="No categories yet."
          columns={[
            { header: "Name", render: (row) => row.name },
            { header: "Slug", render: (row) => row.slug },
            {
              header: "",
              render: (row) => (
                <DangerButton onClick={() => handleDelete(row.id)} disabled={deleteCategory.isPending}>
                  Delete
                </DangerButton>
              ),
            },
          ]}
        />
      )}
    </section>
  );
}
