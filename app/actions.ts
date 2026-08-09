"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

type SaveRecoveryNoteResult = { error: string } | { success: true };

export async function saveRecoveryNote(
  notes: string
): Promise<SaveRecoveryNoteResult> {
  const today = new Date().toISOString().slice(0, 10);
  const trimmed = notes.trim();

  const { data: existing, error: fetchError } = await supabase
    .from("recovery_notes")
    .select("id")
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    return {
      error: `Failed to check today's recovery note: ${fetchError.message} (code: ${fetchError.code})`,
    };
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("recovery_notes")
      .update({ notes: trimmed })
      .eq("id", existing.id);

    if (updateError) {
      return {
        error: `Failed to update recovery note: ${updateError.message} (code: ${updateError.code})`,
      };
    }
  } else {
    const { error: insertError } = await supabase
      .from("recovery_notes")
      .insert({ date: today, notes: trimmed });

    if (insertError) {
      return {
        error: `Failed to save recovery note: ${insertError.message} (code: ${insertError.code})`,
      };
    }
  }

  revalidatePath("/");
  return { success: true };
}
