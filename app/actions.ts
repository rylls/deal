"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCompteAction(formData: FormData) {
  const name = formData.get("name") as string;
  const revenue = formData.get("revenue") as string;
  const sector = formData.get("sector") as string;
  const primaryContact = formData.get("primary_contact") as string;

  if (!name) return { success: false, error: "Le nom du compte est requis" };

  const supabase = await createClient();
  const { error } = await supabase.from("comptes").insert([
    { name, revenue, sector, primary_contact: primaryContact }
  ]);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/comptes");
  return { success: true, error: null };
}

export async function deleteCompteAction(compteId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("comptes").delete().eq("id", compteId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/comptes");
  return { success: true, error: null };
}

export async function createDealAction(formData: FormData) {
  const compteId = formData.get("compte_id") as string;
  const subject = formData.get("subject") as string;
  const city = formData.get("city") as string;
  const nextAction = formData.get("next_action") as string;
  const status = formData.get("status") as string || "todo";
  const priority = formData.get("priority") as string || "Medium";

  if (!compteId || !subject) {
    return { success: false, error: "Le compte et le sujet sont obligatoires" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("deals").insert([
    {
      compte_id: parseInt(compteId, 10),
      subject,
      city,
      next_action: nextAction,
      status,
      priority
    }
  ]);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/comptes");
  revalidatePath(`/comptes/${compteId}`);
  return { success: true, error: null };
}

export async function deleteDealAction(dealId: number, compteId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("deals").delete().eq("id", dealId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/comptes");
  revalidatePath(`/comptes/${compteId}`);
  return { success: true, error: null };
}

export async function updateDealPropertiesAction(dealId: number, formData: FormData) {
  const subject = formData.get("subject") as string;
  const priority = formData.get("priority") as string;
  const deadline = formData.get("deadline") as string;
  const city = formData.get("city") as string;
  const nextAction = formData.get("next_action") as string;
  const status = formData.get("status") as string;

  if (!subject) return { success: false, error: "Le sujet du deal ne peut pas être vide." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("deals")
    .update({
      subject,
      priority,
      deadline: deadline || null,
      city: city || null,
      next_action: nextAction || null,
      status
    })
    .eq("id", dealId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath(`/comptes/deals/${dealId}`);
  return { success: true, error: null };
}

export async function addTimelineEventAction(dealId: number, action: string, eventDate: string, position: number, taskPriority: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("deal_timeline").insert([
    { deal_id: dealId, action, event_date: eventDate, position, task_priority: taskPriority, completed: false, comment: "" }
  ]);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/comptes/deals/${dealId}`);
  return { success: true, error: null };
}

export async function toggleTimelineEventCompletionAction(dealId: number, eventId: number, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deal_timeline")
    .update({ completed: !currentStatus })
    .eq("id", eventId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath(`/comptes/deals/${dealId}`);
  return { success: true, error: null };
}

export async function deleteTimelineEventAction(dealId: number, eventId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("deal_timeline").delete().eq("id", eventId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/comptes/deals/${dealId}`);
  return { success: true, error: null };
}

export async function saveTimelineOrderAction(
  dealId: number, 
  events: { id: number; action: string; event_date: string; position: number; task_priority: string; comment: string }[]
) {
  const supabase = await createClient();
  
  try {
    for (const event of events) {
      const { error } = await supabase
        .from("deal_timeline")
        .update({ 
          position: event.position, 
          action: event.action, 
          event_date: event.event_date,
          task_priority: event.task_priority,
          comment: event.comment || ""
        })
        .eq("id", event.id);
      
      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath(`/comptes/deals/${dealId}`);
    return { success: true, error: null };
  } catch (e: any) {
    return { success: false, error: e.message || "Une erreur est survenue lors de la synchronisation" };
  }
}