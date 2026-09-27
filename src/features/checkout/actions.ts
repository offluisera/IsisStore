"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema, type CheckoutInput } from "@/schemas/checkout";

export type CheckoutActionResult = {
  success: boolean;
  message?: string;
  orderId?: string;
  orderNumber?: string;
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
      });
    }

    // 5. Cálculo do Frete
    let shippingCents = 0;
    if (shippingMethod === "sedex") {
      shippingCents = 2990; // R$ 29,90
    } else {
      // PAC: grátis para compras >= R$ 199,00
      shippingCents = subtotalCents >= 19900 ? 0 : 1890; // R$ 18,90
    }

    // 6. Cálculo de Descontos (Cupom ISIS10 e Desconto Pix 5%)
    let discountCents = 0;
    if (couponCode && couponCode.trim().toUpperCase() === "ISIS10") {
      discountCents += Math.round(subtotalCents * 0.1); // 10% de desconto no subtotal
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

    // 10. Inserir Itens do Pedido na tabela 'order_items' (Snapshot Imutável)
    const orderItemsRows = validatedItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      subtotal_cents: item.subtotalCents,
    }));

    const { error: itemsInsertError } = await supabase
      .from("order_items")
      .insert(orderItemsRows);

    if (itemsInsertError) {
      console.error("Erro ao salvar itens do pedido:", itemsInsertError);
    }

    // 11. Baixa Concorrente no Estoque dos Produtos
    for (const item of validatedItems) {
      const prod = productMap.get(item.productId)!;
      const newStock = Math.max(0, prod.stock - item.quantity);

      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.productId);
    }

    // 12. Limpar carrinho remoto do usuário no Supabase se existir
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
      message: "Pedido realizado com sucesso!",
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
    };
  } catch (err) {
    console.error("Erro inesperado em createOrderAction:", err);
    return {
      success: false,
      message: "Ocorreu uma falha no processamento do checkout. Tente novamente.",
    };
  }
}
