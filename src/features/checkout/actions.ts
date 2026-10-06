"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema, type CheckoutInput } from "@/schemas/checkout";
import {
  createPixPayment,
  createPreference,
} from "@/lib/payments/mercadopago";
import { createInfinitePayCheckoutLink, type InfinitePaySettings } from "@/lib/payments/infinitepay";
import { getStoreSettings } from "@/lib/settings/store-settings";
import { validateCouponDiscount } from "@/lib/coupons/coupon-engine";
import type { Coupon } from "@/lib/coupons/types";

export type CheckoutActionResult = {
  success: boolean;
  message?: string;
  orderId?: string;
  orderNumber?: string;
  paymentRedirectUrl?: string;
  whatsappUrl?: string;
  errors?: Record<string, string[]>;
};

export async function createOrderAction(
  input: CheckoutInput
): Promise<CheckoutActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Sessão expirada. Faça login para concluir sua compra.",
      };
    }

    // 1. Validar payload de entrada com Zod
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Dados de checkout inválidos. Verifique as informações fornecidas.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const {
      addressId,
      shippingMethod,
      paymentMethod,
      couponCode,
      notes,
      items: cartItems,
    } = parsed.data;

    // 2. Buscar endereço de entrega garantindo posse pelo usuário (RLS)
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("profile_id", user.id)
      .single();

    if (addressError || !address) {
      return {
        success: false,
        message: "Endereço de entrega selecionado não encontrado ou inválido.",
      };
    }

    // 3. Buscar produtos no banco de dados para cálculo 100% server-side e validação de estoque
    const productIds = cartItems.map((i) => i.productId);
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, slug, sku, price_cents, sale_price_cents, stock, status")
      .in("id", productIds);

    if (productsError || !dbProducts || dbProducts.length === 0) {
      return {
        success: false,
        message: "Erro ao consultar itens no catálogo. Tente novamente.",
      };
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 4. Validar estoque e calcular subtotal oficial no servidor
    let subtotalCents = 0;
    const validatedItems: Array<{
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPriceCents: number;
      subtotalCents: number;
      customization?: Record<string, unknown> | null;
    }> = [];

    for (const item of cartItems) {
      const prod = productMap.get(item.productId);

      if (!prod || prod.status !== "published") {
        return {
          success: false,
          message: `O produto "${prod?.name || "solicitado"}" não está mais disponível para venda.`,
        };
      }

      if (prod.stock < item.quantity) {
        return {
          success: false,
          message: `Estoque insuficiente para "${prod.name}". Apenas ${prod.stock} unidades disponíveis no momento.`,
        };
      }

      const unitPriceCents = prod.sale_price_cents || prod.price_cents;
      const itemSubtotalCents = unitPriceCents * item.quantity;
      subtotalCents += itemSubtotalCents;

      validatedItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: item.quantity,
        unitPriceCents,
        subtotalCents: itemSubtotalCents,
        customization: item.customization as Record<string, unknown> | null | undefined,
      });
    }

    // 5. Cálculo do Frete
    const storeSettings = await getStoreSettings();
    const freeShippingThreshold = storeSettings?.free_shipping_threshold_cents ?? 19900;

    let shippingCents = 0;
    if (shippingMethod === "sedex") {
      shippingCents = 2990; // R$ 29,90
    } else {
      // PAC: grátis para compras >= limite configurado
      shippingCents = subtotalCents >= freeShippingThreshold ? 0 : 1890; // R$ 18,90
    }

    // 6. Cálculo de Descontos (Validação Server-Side de Cupons e Desconto Pix 5%)
    let discountCents = 0;
    let verifiedCouponCode: string | null = null;
    let couponToIncrementId: string | null = null;
    let currentCouponUsedCount = 0;

    if (couponCode && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const { data: dbCoupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", cleanCode)
        .maybeSingle();

      if (dbCoupon) {
        const validation = validateCouponDiscount(
          dbCoupon as unknown as Coupon,
          subtotalCents
        );
        if (validation.valid && validation.coupon) {
          discountCents += validation.coupon.discount_cents;
          verifiedCouponCode = dbCoupon.code;
          couponToIncrementId = dbCoupon.id;
          currentCouponUsedCount = dbCoupon.used_count || 0;
        }
      } else if (cleanCode === "ISIS10") {
        // Fallback de retrocompatibilidade para ISIS10
        discountCents += Math.round(subtotalCents * 0.1);
        verifiedCouponCode = "ISIS10";
      }
    }

    if (paymentMethod === "pix") {
      // 5% de desconto exclusivo para pagamento via Pix
      const pixDiscount = Math.round((subtotalCents - discountCents) * 0.05);
      discountCents += pixDiscount;
    }

    const totalCents = Math.max(0, subtotalCents + shippingCents - discountCents);

    // 7. Snapshot imutável do endereço de entrega
    const shippingAddressSnapshot = {
      recipient_name: address.recipient_name,
      postal_code: address.postal_code,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
    };

    // 8. Gerar número de pedido único e legível
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ISIS-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // 9. Inserir Pedido na tabela 'orders' com status pending_payment
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        order_number: orderNumber,
        status: "pending_payment",
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        discount_cents: discountCents,
        total_cents: totalCents,
        coupon_code: verifiedCouponCode || null,
        shipping_address: shippingAddressSnapshot,
        notes: notes || null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !newOrder) {
      console.error("Erro ao registrar pedido:", orderError);
      return {
        success: false,
        message: "Não foi possível registrar seu pedido. Tente novamente.",
      };
    }

    // Incrementar contador de utilizações do cupom se aplicável
    if (couponToIncrementId) {
      await supabase
        .from("coupons")
        .update({
          used_count: currentCouponUsedCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", couponToIncrementId);
    }

    // 10. Inserir Itens do Pedido na tabela 'order_items' (Snapshot Imutável)
    const orderItemsRows = validatedItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      subtotal_cents: item.subtotalCents,
      customization: (item.customization as import("@/types/database").Json) || null,
    }));

    const { error: itemsInsertError } = await supabase
      .from("order_items")
      .insert(orderItemsRows);

    if (itemsInsertError) {
      console.error("Erro ao salvar itens do pedido:", itemsInsertError);
    }

    // 11. Integrar com Gateway (WhatsApp ou Mercado Pago)
    let paymentRedirectUrl: string | undefined;
    let whatsappUrl: string | undefined;

    if (paymentMethod === "whatsapp") {
      // Buscar configurações ativas do gateway WhatsApp
      const { data: waGateway } = await supabase
        .from("payment_gateways")
        .select("settings, is_active")
        .eq("name", "whatsapp")
        .maybeSingle();

      if (waGateway && !waGateway.is_active) {
        return {
          success: false,
          message: "O atendimento de pedidos via WhatsApp está desativado no momento.",
        };
      }

      const waSettings = (waGateway?.settings as {
        phone?: string;
        message_template?: string;
      } | null) || {};

      const waPhone = waSettings.phone || "5511999998888";
      const cleanPhone = waPhone.replace(/\D/g, "");

      const productNames = validatedItems.map((i) => i.productName).join(", ");
      const formattedTotal = (totalCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      // Mensagem oficial: "Olá tive interesse no produto XXXXX meu pedido é numero XXXXX no valor xxxx gostaria de mais informação"
      const defaultTemplate =
        "Olá tive interesse no produto {produto} meu pedido é numero {pedido} no valor {valor} gostaria de mais informação";
      const template = waSettings.message_template || defaultTemplate;

      const rawMessage = template
        .replace(/\{produto\}/gi, productNames)
        .replace(/\{pedido\}/gi, newOrder.order_number)
        .replace(/\{valor\}/gi, formattedTotal);

      whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;

      await supabase.from("payments").insert({
        order_id: newOrder.id,
        gateway: "whatsapp",
        gateway_payment_id: `wa_${newOrder.order_number}`,
        amount_cents: totalCents,
        payment_method: "whatsapp",
        status: "pending",
        ticket_url: whatsappUrl,
      });
    } else if (paymentMethod === "infinitepay") {
      // 11.B Integrar com Gateway InfinitePay
      const { data: ifpGateway } = await supabase
        .from("payment_gateways")
        .select("settings, is_active")
        .eq("name", "infinitepay")
        .maybeSingle();

      if (ifpGateway && !ifpGateway.is_active) {
        return {
          success: false,
          message:
            "O gateway InfinitePay está temporariamente desativado. Por favor, conclua seu pedido pelo WhatsApp ou outro método.",
        };
      }

      const ifpSettings =
        (ifpGateway?.settings as unknown as InfinitePaySettings) || {};
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const linkResult = await createInfinitePayCheckoutLink(
        {
          id: newOrder.id,
          order_number: newOrder.order_number,
          total_cents: totalCents,
          items: validatedItems.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            price_cents: i.unitPriceCents,
          })),
          customer: {
            name: address.recipient_name,
            email: user.email!,
            phone: address.complement || "",
          },
        },
        ifpSettings,
        appUrl
      );

      if (!linkResult.success || !linkResult.checkoutUrl) {
        return {
          success: false,
          message:
            linkResult.message ||
            "Não foi possível gerar o link de pagamento da InfinitePay.",
        };
      }

      await supabase.from("payments").insert({
        order_id: newOrder.id,
        gateway: "infinitepay",
        gateway_payment_id: `ifp_${newOrder.order_number}`,
        amount_cents: totalCents,
        payment_method: "infinitepay_checkout",
        status: "pending",
        ticket_url: linkResult.checkoutUrl,
      });

      paymentRedirectUrl = linkResult.checkoutUrl;
    } else {
      // Verificar se o gateway Mercado Pago está ativo
      const { data: mpGateway } = await supabase
        .from("payment_gateways")
        .select("is_active")
        .eq("name", "mercadopago")
        .maybeSingle();

      if (mpGateway && !mpGateway.is_active) {
        return {
          success: false,
          message:
            "O gateway Mercado Pago está temporariamente desativado. Por favor, conclua seu pedido pelo WhatsApp.",
        };
      }

      if (paymentMethod === "pix") {
        const pixPayment = await createPixPayment({
          orderId: newOrder.id,
          orderNumber: newOrder.order_number,
          amountCents: totalCents,
          payer: {
            email: user.email!,
            name: address.recipient_name,
          },
        });

        // Se Pix transparente gerou ticket_url, define como redirecionamento
        // Se a chamada de Pix transparente falhou ou caiu em mock local,
        // recorre à preferência Checkout Pro para redirecionar ao gateway Mercado Pago
        if (pixPayment.paymentId.startsWith("mp_sandbox_") || !pixPayment.ticketUrl) {
          const pref = await createPreference({
            orderId: newOrder.id,
            orderNumber: newOrder.order_number,
            items: validatedItems.map((i) => ({
              id: i.productId,
              title: i.productName,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents,
            })),
            payer: {
              email: user.email!,
              name: address.recipient_name,
            },
            shippingCents,
            discountCents,
          });

          if (pref.initPoint && !pref.initPoint.includes("/checkout/sucesso")) {
            paymentRedirectUrl = pref.initPoint;
          }
        } else {
          paymentRedirectUrl = pixPayment.ticketUrl || undefined;
        }

        await supabase.from("payments").insert({
          order_id: newOrder.id,
          gateway: "mercadopago",
          gateway_payment_id: pixPayment.paymentId,
          amount_cents: totalCents,
          payment_method: "pix",
          status: "pending",
          qr_code: pixPayment.qrCode,
          qr_code_base64: pixPayment.qrCodeBase64,
          ticket_url: paymentRedirectUrl || pixPayment.ticketUrl,
        });
      } else {
        const pref = await createPreference({
          orderId: newOrder.id,
          orderNumber: newOrder.order_number,
          items: validatedItems.map((i) => ({
            id: i.productId,
            title: i.productName,
            quantity: i.quantity,
            unitPriceCents: i.unitPriceCents,
          })),
          payer: {
            email: user.email!,
            name: address.recipient_name,
          },
          shippingCents,
          discountCents,
        });

        paymentRedirectUrl = pref.initPoint;

        await supabase.from("payments").insert({
          order_id: newOrder.id,
          gateway: "mercadopago",
          gateway_payment_id: pref.preferenceId,
          amount_cents: totalCents,
          payment_method: "credit_card",
          status: "pending",
          ticket_url: pref.initPoint,
        });
      }
    }

    // 12. Gestão de Estoque
    // No caso do WhatsApp, a baixa de pagamento e estoque será manual pelo administrador no painel
    if (paymentMethod !== "whatsapp") {
      for (const item of validatedItems) {
        const prod = productMap.get(item.productId)!;
        const newStock = Math.max(0, prod.stock - item.quantity);

        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.productId);
      }
    }

    // 13. Limpar carrinho remoto do usuário no Supabase se existir
    const { data: userCart } = await supabase
      .from("carts")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (userCart) {
      await supabase.from("cart_items").delete().eq("cart_id", userCart.id);
    }

    revalidatePath("/conta");
    revalidatePath("/conta/pedidos");
    revalidatePath("/produtos");

    return {
      success: true,
      message:
        paymentMethod === "whatsapp"
          ? "Pedido registrado com sucesso! Conclua o atendimento via WhatsApp."
          : "Pedido realizado com sucesso!",
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
      paymentRedirectUrl,
      whatsappUrl,
    };
  } catch (err) {
    console.error("Erro inesperado em createOrderAction:", err);
    return {
      success: false,
      message: "Ocorreu uma falha no processamento do checkout. Tente novamente.",
    };
  }
}

// 14. Pedido Rápido Expresso via WhatsApp direto da Página de Produto
export async function createQuickWhatsAppOrderAction(input: {
  productId: string;
  quantity: number;
  customerName?: string;
  customerPhone?: string;
  customization?: {
    text?: string;
    imageUrl?: string;
    notes?: string;
  };
}): Promise<{
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
  whatsappUrl?: string;
}> {
  try {
    const supabase = await createClient();

    // Invocar RPC segura (SECURITY DEFINER) - funciona para clientes autenticados e visitantes anônimos
    const { data, error } = await supabase.rpc("create_quick_whatsapp_order", {
      p_product_id: input.productId,
      p_quantity: Math.max(1, input.quantity),
      p_customer_name: input.customerName || null,
      p_customer_phone: input.customerPhone || null,
      p_customization: (input.customization as unknown as import("@/types/database").Json) || null,
    });

    if (error || !data) {
      console.error("Erro na RPC create_quick_whatsapp_order:", error);
      return {
        success: false,
        message: error?.message || "Erro ao registrar pedido via WhatsApp.",
      };
    }

    const rpcResult = data as {
      success: boolean;
      message?: string;
      order_id?: string;
      order_number?: string;
      product_name?: string;
      total_cents?: number;
      phone?: string;
      message_template?: string;
    };

    if (!rpcResult.success || !rpcResult.order_id || !rpcResult.order_number) {
      return {
        success: false,
        message: rpcResult.message || "Não foi possível registrar o pedido.",
      };
    }

    const cleanPhone = (rpcResult.phone || "5511999998888").replace(/\D/g, "");
    const formattedPrice = ((rpcResult.total_cents || 0) / 100).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );

    // Mensagem requerida: "Olá tive interesse no produto XXXXX meu pedido é numero XXXXX no valor xxxx gostaria de mais informação"
    const template =
      rpcResult.message_template ||
      "Olá tive interesse no produto {produto} meu pedido é numero {pedido} no valor {valor} gostaria de mais informação";

    const finalMessage = template
      .replace(/\{produto\}/gi, rpcResult.product_name || "Produto")
      .replace(/\{pedido\}/gi, rpcResult.order_number)
      .replace(/\{valor\}/gi, formattedPrice);

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;

    revalidatePath("/admin/pedidos");
    revalidatePath("/conta/pedidos");

    return {
      success: true,
      message: "Pedido registrado com sucesso!",
      orderId: rpcResult.order_id,
      orderNumber: rpcResult.order_number,
      whatsappUrl,
    };
  } catch (err) {
    console.error("Falha em createQuickWhatsAppOrderAction:", err);
    return {
      success: false,
      message: "Erro inesperado ao gerar pedido via WhatsApp.",
    };
  }
}

