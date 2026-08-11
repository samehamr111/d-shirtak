import { useState, type FormEvent } from "react";
import { useColors, useCreateColor, useDeleteColor } from "./api";
import { DataTable } from "../../components/DataTable";
import { Field, Input, PrimaryButton, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { useToast } from "../../components/Toast";

export function ColorsPanel() {
  const { data: colors, isLoading } = useColors();
  const createColor = useCreateColor();
  const deleteColor = useDeleteColor();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState("#000000");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createColor.mutateAsync({ name, hexCode });
      showToast({ type: "success", message: `Color "${name}" added.` });
      setName("");
      setHexCode("#000000");
    } catch (err) {
      showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to create color." });
    }
  };

  const handleDelete = (id: string) => {
    deleteColor.mutate(id, {
      onSuccess: () => showToast({ type: "success", message: "Color deleted." }),
      onError: (err) => showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to delete color." }),
    });
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">Colors</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-2">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Hex code">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value)}
              className="h-8 w-10 rounded border border-ink/20"
            />
            <Input
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value)}
              pattern="^#[0-9a-fA-F]{6}$"
              required
              className="w-28"
            />
          </div>
        </Field>
        <PrimaryButton type="submit" disabled={createColor.isPending}>
          Add
        </PrimaryButton>
      </form>
      {isLoading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (
        <DataTable
          rowKey={(row) => row.id}
          rows={colors ?? []}
          emptyMessage="No colors yet."
          columns={[
            {
              header: "Swatch",
              render: (row) => <span className="inline-block h-5 w-5 rounded border border-ink/20" style={{ backgroundColor: row.hexCode }} />,
            },
            { header: "Name", render: (row) => row.name },
            { header: "Hex", render: (row) => row.hexCode },
            {
              header: "",
              render: (row) => (
                <DangerButton onClick={() => handleDelete(row.id)} disabled={deleteColor.isPending}>
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
