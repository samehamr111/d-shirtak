import { useState, type FormEvent } from "react";
import { useCreateSize, useDeleteSize, useSizes } from "./api";
import { DataTable } from "../../components/DataTable";
import { Field, Input, PrimaryButton, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { useToast } from "../../components/Toast";

export function SizesPanel() {
  const { data: sizes, isLoading } = useSizes();
  const createSize = useCreateSize();
  const deleteSize = useDeleteSize();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createSize.mutateAsync({ name, sortOrder });
      showToast({ type: "success", message: `Size "${name}" added.` });
      setName("");
      setSortOrder(0);
    } catch (err) {
      showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to create size." });
    }
  };

  const handleDelete = (id: string) => {
    deleteSize.mutate(id, {
      onSuccess: () => showToast({ type: "success", message: "Size deleted." }),
      onError: (err) => showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to delete size." }),
    });
  };

  const sorted = [...(sizes ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">Sizes</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-2">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-24" />
        </Field>
        <Field label="Sort order">
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            required
            className="w-24"
          />
        </Field>
        <PrimaryButton type="submit" disabled={createSize.isPending}>
          Add
        </PrimaryButton>
      </form>
      {isLoading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (
        <DataTable
          rowKey={(row) => row.id}
          rows={sorted}
          emptyMessage="No sizes yet."
          columns={[
            { header: "Name", render: (row) => row.name },
            { header: "Sort order", render: (row) => row.sortOrder },
            {
              header: "",
              render: (row) => (
                <DangerButton onClick={() => handleDelete(row.id)} disabled={deleteSize.isPending}>
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
