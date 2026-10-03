import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // A InfinitePay envia order_nsu e status da transação
    const orderNsu =
      rawBody.order_nsu ||
      rawBody.order_id ||
      rawBody.metadata?.order_nsu ||
      rawBody.data?.order_nsu;

    const status = String(
      rawBody.status ||
      rawBody.event ||
      rawBody.transaction_status ||
      rawBody.data?.status ||
      ""
    ).toLowerCase();

    const transactionId = String(
      rawBody.transaction_id ||
      rawBody.id ||
      rawBody.nsu ||
      rawBody.data?.id ||
      ""
    );

    if (!orderNsu) {
      console.warn("Webhook InfinitePay recebido sem order_nsu:", rawBody);
      // Retornar 200 para evitar retentativas infinitas se for ping de verificação
      return NextResponse.json({ received: true, ignored: "missing_order_nsu" });
    }

    const supabaseAdmin = getAdminClient();

    // Buscar pedido pelo order_number ou id
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, status, total_cents, customer_id")
      .or(`order_number.eq.${orderNsu},id.eq.${orderNsu}`)
      .maybeSingle();

    if (orderErr || !order) {
      console.error("Pedido não encontrado para webhook InfinitePay:", orderNsu);
      return NextResponse.json({ received: true, not_found: true });
    }

    // Idempotência: se já estiver pago, confirma recebimento imediatamente
    if (order.status === "paid") {
      return NextResponse.json({ received: true, already_paid: true });
    }

    // Status de pagamento aprovado na InfinitePay
    const isApproved =
      status === "paid" ||
      status === "approved" ||
      status === "completed" ||
      status === "succeeded" ||
      status === "transaction_approved";

    if (isApproved) {
      // 1. Atualizar status do pedido para paid
      await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // 2. Registrar pagamento na tabela payments
      await supabaseAdmin.from("payments").insert({
        order_id: order.id,
        gateway: "infinitepay",
        gateway_payment_id: transactionId || `ifp_${Date.now()}`,
        amount_cents: order.total_cents,
        status: "approved",
        payment_method: "infinitepay_checkout",
        metadata: rawBody,
      });

      // 3. Registrar evento de pagamento para auditoria
      await supabaseAdmin.from("payment_events").insert({
        gateway: "infinitepay",
        event_type: "payment_approved",
        event_id: transactionId || `evt_${Date.now()}`,
        payload: rawBody,
      });

      console.log(`[InfinitePay] Pedido ${order.order_number} aprovado via webhook!`);
    }

    return NextResponse.json({ received: true, status: "processed" });
  } catch (err: unknown) {
    console.error("Erro interno no webhook InfinitePay:", err);
    // Sempre responder 200 para webhooks com erro de parsing para evitar congestionamento
    return NextResponse.json({ received: true, error: "internal_error" }, { status: 200 });
  }
}
