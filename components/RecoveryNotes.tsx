"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRecoveryNote } from "@/app/actions";

export default function RecoveryNotes({
  initialNote,
}: {
  initialNote: string;
}) {
  const [notes, setNotes] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave() {
    setError(null);
    setSaving(true);
    const result = await saveRecoveryNote(notes);
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="card">
      <h2>Recovery Notes</h2>
      <textarea
        placeholder="How are you feeling today?"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <button type="button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save Notes"}
      </button>
    </section>
  );
}
