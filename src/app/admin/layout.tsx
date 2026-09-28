import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Painel Administrativo — Isis Store",
  description: "Gestão centralizada de produtos, pedidos, clientes, faturamento e auditoria.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  // Dupla checagem server-side de segurança (Gate 04 & Gate 13)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/conta?error=unauthorized_admin");
  }

  return (
    <AdminShell
      adminName={profile.full_name}
      adminEmail={user.email}
    >
      {children}
    </AdminShell>
  );
}
