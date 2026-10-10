import { NextResponse } from "next/server";
import { calculateRegionalShippingQuote } from "@/lib/shipping/regional-shipping";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cep, state, subtotalCents } = body;

    if (!cep && !state) {
      return NextResponse.json(
        { success: false, message: "Informe ao menos o CEP ou Estado (UF)." },
        { status: 400 }
      );
    }

    const quote = await calculateRegionalShippingQuote({
      cep: typeof cep === "string" ? cep : undefined,
      state: typeof state === "string" ? state : undefined,
      subtotalCents: typeof subtotalCents === "number" ? subtotalCents : 0,
    });

    return NextResponse.json(quote);
  } catch (err: unknown) {
    console.error("Erro na API de frete:", err);
    return NextResponse.json(
      { success: false, message: "Erro interno ao calcular frete." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get("cep") || undefined;
  const state = searchParams.get("state") || undefined;
  const subtotalParam = searchParams.get("subtotalCents") || searchParams.get("subtotal") || "0";
  const subtotalCents = parseInt(subtotalParam, 10) || 0;

  if (!cep && !state) {
    return NextResponse.json(
      { success: false, message: "Informe o parâmetro ?cep= ou ?state=" },
      { status: 400 }
    );
  }

  const quote = await calculateRegionalShippingQuote({
    cep,
    state,
    subtotalCents,
  });

  return NextResponse.json(quote);
}
