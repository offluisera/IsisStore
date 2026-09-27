import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPaymentDetails,
  verifyWebhookSignature,
} from "@/lib/payments/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Cabeçalhos de segurança do Mercado Pago
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Extrair ID do pagamento e tipo do evento
    const paymentId =
      body?.data?.id ||
      searchParams.get("data.id") ||
      searchParams.get("id");

    const eventType = body?.type || searchParams.get("type") || searchParams.get("topic") || "payment";

    if (!paymentId) {
      return NextResponse.json(
        { error: "Nenhum payment_id identificado no webhook" },
        { status: 400 }
      );
    }

    // 1. Validar Assinatura do Webhook
    const isSignatureValid = verifyWebhookSignature({
      xSignature,
      xRequestId,
      dataId: String(paymentId),
    });

    if (!isSignatureValid) {
      console.warn("Assinatura do webhook Mercado Pago inválida:", { paymentId });
      return NextResponse.json(
        { error: "Assinatura HMAC inválida" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const eventUniqueId = `mp_${eventType}_${paymentId}_${xRequestId || Date.now()}`;

    // 2. IDEMPOTÊNCIA FINANCEIRA: Registrar na tabela 'payment_events'
    // A constraint UNIQUE(event_id) garante que re-tentativas do gateway sejam ignoradas
    const { error: idempotencyError } = await supabase
      .from("payment_events")
      .insert({
        event_id: eventUniqueId,
        gateway: "mercadopago",
        event_type: eventType,
        payload: { body, searchParams: Object.fromEntries(searchParams.entries()) },
      });

    if (idempotencyError && idempotencyError.code === "23505") {
      // Evento duplicado / já processado
      return NextResponse.json(
        { status: "ok", message: "Evento já processado anteriormente (Idempotente)" },
        { status: 200 }
      );
    }

    // Processar apenas eventos de pagamento
    if (eventType !== "payment" && eventType !== "payment.created" && eventType !== "payment.updated") {
      return NextResponse.json({ status: "ok", ignored: true }, { status: 200 });
    }

    // 3. Consultar dados oficiais do pagamento no Mercado Pago
    const mpPayment = await getPaymentDetails(String(paymentId));
    if (!mpPayment) {
      return NextResponse.json(
        { error: "Pagamento não encontrado na API do Mercado Pago" },
        { status: 404 }
      );
    }

    const orderId = mpPayment.external_reference;
    const mpStatus = mpPayment.status; // approved, pending, in_process, rejected, cancelled

    // 4. Mapear status do Mercado Pago para nossos modelos
    let paymentStatus: "pending" | "approved" | "rejected" | "cancelled" | "in_process" = "pending";
    let orderStatus: "pending_payment" | "paid" | "processing" | "cancelled" = "pending_payment";

    if (mpStatus === "approved") {
      paymentStatus = "approved";
      orderStatus = "paid";
    } else if (mpStatus === "in_process" || mpStatus === "authorized") {
      paymentStatus = "in_process";
      orderStatus = "processing";
    } else if (mpStatus === "rejected" || mpStatus === "cancelled" || mpStatus === "refunded") {
      paymentStatus = "cancelled";
      orderStatus = "cancelled";
    }

    // 5. Atualizar ou Inserir Registro em 'payments'
    if (orderId) {
      // Atualizar status do pedido correspondente
      await supabase
        .from("orders")
        .update({
          status: orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Atualizar ou inserir registro de pagamento
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle();

      if (existingPayment) {
        await supabase
          .from("payments")
          .update({
            status: paymentStatus,
            gateway_payment_id: String(paymentId),
            updated_at: new Date().toISOString(),
            metadata: mpPayment,
          })
          .eq("id", existingPayment.id);
      } else {
        await supabase.from("payments").insert({
          order_id: orderId,
          gateway: "mercadopago",
          gateway_payment_id: String(paymentId),
          amount_cents: Math.round(Number(mpPayment.transaction_amount || 0) * 100),
          payment_method: mpPayment.payment_method_id || "mercadopago",
          status: paymentStatus,
          metadata: mpPayment,
        });
      }

      // Se o pedido for cancelado, reverter estoque dos produtos
      if (orderStatus === "cancelled") {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", orderId);

        if (orderItems) {
          for (const item of orderItems) {
            if (item.product_id) {
              const { data: prod } = await supabase
                .from("products")
                .select("stock")
                .eq("id", item.product_id)
                .single();

              if (prod) {
                await supabase
                  .from("products")
                  .update({ stock: prod.stock + item.quantity })
                  .eq("id", item.product_id);
              }
            }
          }
        }
      }

      // Registrar auditoria
      await supabase.from("admin_audit_logs").insert({
        action: `webhook_mercadopago_${paymentStatus}`,
        entity: "orders",
        entity_id: orderId,
        metadata: {
          gateway_payment_id: paymentId,
          mp_status: mpStatus,
          order_status: orderStatus,
        },
      });
    }

    return NextResponse.json(
      {
        status: "ok",
        processed: true,
        orderId,
        paymentStatus,
        orderStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro interno no Webhook do Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro interno no processamento do webhook" },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificação de liveness pelo Mercado Pago
export async function GET() {
  return NextResponse.json({ status: "alive", gateway: "mercadopago" });
}
