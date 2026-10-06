import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  PackageCheck,
  Filter,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  ShippingLabelManager,
  ShippingOrder,
} from "@/components/admin/shipping-label-manager";

interface AdminPedidosEtiquetasPageProps {
  searchParams: Promise<{ filtro?: string }>;
}

export default async function AdminPedidosEtiquetasPage({
  searchParams,
}: AdminPedidosEtiquetasPageProps) {
  const { filtro = "aguardando_envio" } = await searchParams;
  const supabase = await createClient();

  // 1. Busca pedidos reais do banco com itens, endereço e perfil
  let query = supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_cents,
      created_at,
      label_generated,
      label_generated_at,
      shipping_address,
      profiles (
        full_name,
        email,
        phone
      ),
      order_items (
        id,
        product_name,
        quantity
      )
    `)
    .order("created_at", { ascending: false });

  if (filtro === "aguardando_envio") {
    // Pedidos pagos que precisam ser enviados
    query = query.in("status", ["paid", "processing"]);
  } else if (filtro === "com_etiqueta") {
    query = query.eq("label_generated", true);
  } else if (filtro === "sem_etiqueta") {
    query = query.eq("label_generated", false);
  }
  // Se filtro === 'todos', não aplica filtro restritivo de status

  const { data: rawOrders } = await query;
  const orders = (rawOrders || []) as unknown as ShippingOrder[];

  // 2. Métricas rápidas reais
  const { count: countAguardandoEnvio } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("status", ["paid", "processing"]);

  const { count: countComEtiqueta } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("label_generated", true);

  const { count: countTotalPedidos } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  const FILTER_TABS = [
    {
      label: "Aguardando Envio (Pagos / Em Separação)",
      value: "aguardando_envio",
      count: countAguardandoEnvio ?? 0,
    },
    {
      label: "Etiquetas Geradas",
      value: "com_etiqueta",
      count: countComEtiqueta ?? 0,
    },
    {
      label: "Sem Etiqueta Gerada",
      value: "sem_etiqueta",
    },
    {
      label: "Todos os Pedidos",
      value: "todos",
      count: countTotalPedidos ?? 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/pedidos"
              className="hover:text-primaria transition-colors"
            >
              Pedidos
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Etiquetas</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Etiquetas de Envio & Despacho
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Gere e imprima etiquetas de embalagem para pedidos pagos. Os dados do destinatário são coletados automaticamente.
          </p>
        </div>

        <div>
          <Link
            href="/admin/pedidos"
            className={buttonVariants({
              variant: "white",
              size: "sm",
              className: "dark:bg-[#151012] dark:border-[#38262C] dark:text-[#F8EFF1]",
            })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Ver Todos os Pedidos</span>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/40">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Pagos Aguardando Envio</p>
            <p className="text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {countAguardandoEnvio ?? 0}{" "}
              <span className="text-xs font-normal text-texto-claro dark:text-[#988087]">pedidos</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Etiquetas Geradas</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {countComEtiqueta ?? 0}{" "}
              <span className="text-xs font-normal text-texto-claro dark:text-[#988087]">impressas</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primaria-soft dark:bg-primaria-soft/30 text-primaria flex items-center justify-center shrink-0 border border-primaria/20">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Padrão de Impressão</p>
            <p className="text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">Térmica ou A4</p>
            <p className="text-[11px] text-texto-claro dark:text-[#988087]">Declaração postal inclusa</p>
          </div>
        </div>
      </div>

      {/* Filtros em Abas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <Filter className="w-4 h-4 text-texto-claro dark:text-[#988087] shrink-0 ml-1 mr-1" />
        {FILTER_TABS.map((tab) => {
          const isActive = filtro === tab.value;

          return (
            <Link
              key={tab.value}
              href={`/admin/pedidos/etiquetas?filtro=${tab.value}`}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                isActive
                  ? "bg-primaria text-white border-primaria shadow-2xs"
                  : "bg-white dark:bg-[#1E1518] text-texto-medio dark:text-[#D4BFC5] border-borda dark:border-[#38262C] hover:border-primaria/40 dark:hover:border-primaria/60"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-fundo dark:bg-[#151012] text-texto-claro dark:text-[#988087] border border-borda dark:border-[#38262C]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Componente Interativo de Etiquetas e Impressão */}
      <ShippingLabelManager orders={orders} />
    </div>
  );
}
