import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("\\")
      ? rawNext
      : "/conta";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Auto-sincronizar initial_address caso exista em metadata e ainda não esteja na tabela addresses
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.user_metadata?.initial_address) {
          const addr = user.user_metadata.initial_address;
          if (addr.postal_code && addr.street && addr.number) {
            const { count } = await supabase
              .from("addresses")
              .select("*", { count: "exact", head: true })
              .eq("profile_id", user.id);

            if (!count || count === 0) {
              await supabase.from("addresses").insert({
                profile_id: user.id,
                recipient_name: user.user_metadata.full_name || "Principal",
                postal_code: String(addr.postal_code).replace(/\D/g, ""),
                street: addr.street,
                number: addr.number,
                complement: addr.complement || null,
                neighborhood: addr.neighborhood || "",
                city: addr.city || "",
                state: addr.state || "",
                is_default: true,
              });
            }
          }
        }
      } catch (syncErr) {
        console.warn("Aviso na sincronização de endereço no callback:", syncErr);
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
