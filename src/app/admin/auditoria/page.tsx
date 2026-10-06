import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create_product: { label: "Criou Produto", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40" },
  update_stock: { label: "Ajustou Estoque", color: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40" },
  update_status: { label: "Alterou Status Produto", color: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40" },
  archive_product: { label: "Arquivou Produto", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40" },
  create_category: { label: "Criou Categoria", color: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40" },
  delete_category: { label: "Excluiu Categoria", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40" },
  update_order_status: { label: "Mudou Status Pedido", color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40" },
  update_user_role: { label: "Alterou Papel de Usuário", color: "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/40" },
  access_dashboard: { label: "Acessou Painel", color: "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/50" },
  webhook_mercadopago_approved: { label: "Webhook MP (Aprovado)", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40" },
  webhook_mercadopago_cancelled: { label: "Webhook MP (Cancelado)", color: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40" },
};

export default async function AdminAuditoriaPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("admin_audit_logs")
    .select(`
      id,
      action,
      entity,
      entity_id,
      metadata,
      created_at,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

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
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Auditoria</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Trilha de Auditoria Administrativa
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Registro imutável de todas as modificações críticas realizadas no sistema.
          </p>
        </div>

        <div>
          <Link
            href="/admin"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar ao Painel</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 dark:bg-[#151012] border-b border-borda dark:border-[#38262C] text-texto-claro dark:text-[#988087] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Data / Hora</th>
                <th className="px-5 py-3.5">Administrador (Ator)</th>
                <th className="px-5 py-3.5">Ação Realizada</th>
                <th className="px-5 py-3.5">Entidade / ID</th>
                <th className="px-5 py-3.5">Detalhes / Metadados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 dark:divide-[#38262C]/60 text-texto-escuro dark:text-[#F8EFF1]">
              {logs && logs.length > 0 ? (
                (logs as unknown as AuditLogEntry[]).map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] || {
                    label: log.action,
                    color: "bg-neutral-100 dark:bg-[#251A1E] text-neutral-800 dark:text-[#D4BFC5] border-neutral-200 dark:border-[#38262C]",
                  };

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-fundo/30 dark:hover:bg-[#251A1E]/30 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-[11px] text-texto-claro dark:text-[#988087] whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                          {log.profiles?.full_name || "Sistema / Gateway"}
                        </p>
                        <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                          {log.profiles?.email || "Automático"}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${actionInfo.color}`}
                        >
                          {actionInfo.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold uppercase text-texto-escuro dark:text-[#F8EFF1]">
                          {log.entity}
                        </span>
                        <p className="font-mono text-[10px] text-texto-claro dark:text-[#988087] truncate max-w-[120px]">
                          {log.entity_id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <pre className="text-[10px] bg-fundo/60 dark:bg-[#151012] p-2.5 rounded-xl border border-transparent dark:border-[#38262C] font-mono text-texto-medio dark:text-[#D4BFC5] max-w-sm overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-texto-claro dark:text-[#988087]">
                    Nenhum registro de auditoria gravado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
