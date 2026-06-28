"use server"

import { requireAuth } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import { deleteInstallation } from "../server/installation";
import { revalidatePath } from "next/cache";

export async function disconnectGithubApp() {
  const session = await requireAuth();

  if (!session) {
    redirect("/sign-in");
  }
  await deleteInstallation(session.user.id);
  revalidatePath("/dashboard/github");
}
