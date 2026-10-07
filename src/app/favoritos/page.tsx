import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meus Favoritos | Isis Store",
  description:
    "Acesse seus produtos favoritos e lista de desejos na Isis Store.",
};

export default async function FavoritosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se não estiver logado / sem registro, envia para login com retorno para favoritos
  if (!user) {
    redirect("/login?next=/conta/favoritos");
  }

  // Se estiver logado, redireciona para a página de favoritos do cliente
  redirect("/conta/favoritos");
}
