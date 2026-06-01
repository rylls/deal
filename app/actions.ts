"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCompteAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Le nom du compte est requis" };

  const supabase = await createClient();
  const { error } = await supabase.from("comptes").insert([{ name }]);

  if (error) return { error: error.message };

  revalidatePath("/comptes");
  return { success: true };
}

export async function createDealAction(formData: FormData) {
  const compteId = formData.get("compte_id") as string;
  const subject = formData.get("subject") as string;
  const city = formData.get("city") as string;
  const nextAction = formData.get("next_action") as string;
  const status = formData.get("status") as string || "todo";

  if (!compteId || !subject) {
    return { error: "Le compte et le sujet sont obligatoires" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("deals").insert([
    {
      compte_id: parseInt(compteId, 10),
      subject,
      city,
      next_action: nextAction,
      status
    }
  ]);

  if (error) return { error: error.message };

  revalidatePath("/comptes");
  revalidatePath(`/comptes/${compteId}`);
  return { success: true };
}