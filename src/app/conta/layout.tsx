import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/account-shell";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/conta");
  }

  // Buscar perfil e contagens em paralelo
  const [
    { data: profile },
    { count: ordersCount },
    { count: addressesCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", user.id),
    supabase
      .from("addresses")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id),
  ]);

  const isAdmin = profile?.role === "admin";
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Cliente";

  return (
    <AccountShell
      displayName={displayName}
      email={user.email}
      isAdmin={isAdmin}
      counts={{
        orders: ordersCount ?? 0,
        addresses: addressesCount ?? 0,
        favorites: 0,
        coupons: 3,
      }}
    >
      {children}
    </AccountShell>
  );
}
