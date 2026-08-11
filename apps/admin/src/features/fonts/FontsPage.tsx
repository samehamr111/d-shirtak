import { useState, type FormEvent } from "react";
import { FontLanguage } from "@d-shirtak/shared";
import { useDeleteFont, useFonts, useUploadFont } from "./api";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import { Field, Input, PrimaryButton, Select, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";

export function FontsPage() {
  const { data: fonts, isLoading } = useFonts();
  const uploadFont = useUploadFont();
  const deleteFont = useDeleteFont();

  const [name, setName] = useState("");
  const [language, setLanguage] = useState<string>(FontLanguage.EN);
  const [fontFamily, setFontFamily] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose a font file.");
      return;
    }
    const form = new FormData();
    form.set("name", name);
    form.set("language", language);
    form.set("fontFamily", fontFamily);
    form.set("file", file);
    try {
      await uploadFont.mutateAsync(form);
      setName("");
      setFontFamily("");
      setFile(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload font.");
    }
  };

  return (
    <div>
      <PageHeader title="Fonts" description="Fonts available to customers in the design customizer." />

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-ink/10 bg-white p-4">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-40" />
        </Field>
        <Field label="Language">
          <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value={FontLanguage.EN}>EN</option>
            <option value={FontLanguage.AR}>AR</option>
          </Select>
        </Field>
        <Field label="CSS font-family">
          <Input value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} required className="w-40" />
        </Field>
        <Field label="Font file">
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="text-sm"
          />
        </Field>
        <PrimaryButton type="submit" disabled={uploadFont.isPending}>
          Upload
        </PrimaryButton>
      </form>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : (
        <DataTable
          rowKey={(row) => row.id}
          rows={fonts ?? []}
          emptyMessage="No fonts uploaded yet."
          columns={[
            { header: "Name", render: (row) => row.name },
            {
              header: "Language",
              render: (row) => (
                <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium">{row.language}</span>
              ),
            },
            { header: "Font family", render: (row) => row.fontFamily },
            {
              header: "",
              render: (row) => (
                <DangerButton onClick={() => deleteFont.mutate(row.id)} disabled={deleteFont.isPending}>
                  Delete
                </DangerButton>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
