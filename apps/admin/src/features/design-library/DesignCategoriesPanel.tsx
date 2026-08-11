import { useState, type FormEvent } from "react";
import { useCreateDesignCategory, useDeleteDesignCategory, useDesignCategories } from "./api";
import { DataTable } from "../../components/DataTable";
import { Field, Input, PrimaryButton, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";

export function DesignCategoriesPanel() {
  const { data: categories, isLoading } = useDesignCategories();
  const createCategory = useCreateDesignCategory();
  const deleteCategory = useDeleteDesignCategory();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createCategory.mutateAsync({ name });
      setName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create design category.");
    }
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">Design categories</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-2">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <PrimaryButton type="submit" disabled={createCategory.isPending}>
          Add
        </PrimaryButton>
      </form>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {isLoading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (
        <DataTable
          rowKey={(row) => row.id}
          rows={categories ?? []}
          emptyMessage="No design categories yet."
          columns={[
            { header: "Name", render: (row) => row.name },
            {
              header: "",
              render: (row) => (
                <DangerButton onClick={() => deleteCategory.mutate(row.id)} disabled={deleteCategory.isPending}>
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
