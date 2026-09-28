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
  create_product: { label: "Criou Produto", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  update_stock: { label: "Ajustou Estoque", color: "bg-blue-100 text-blue-800 border-blue-200" },
  update_status: { label: "Alterou Status Produto", color: "bg-purple-100 text-purple-800 border-purple-200" },
  archive_product: { label: "Arquivou Produto", color: "bg-rose-100 text-rose-800 border-rose-200" },
  create_category: { label: "Criou Categoria", color: "bg-amber-100 text-amber-800 border-amber-200" },
  delete_category: { label: "Excluiu Categoria", color: "bg-rose-100 text-rose-800 border-rose-200" },
  update_order_status: { label: "Mudou Status Pedido", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  update_user_role: { label: "Alterou Papel de Usuário", color: "bg-orange-100 text-orange-800 border-orange-200" },
  webhook_mercadopago_approved: { label: "Webhook MP (Aprovado)", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  webhook_mercadopago_cancelled: { label: "Webhook MP (Cancelado)", color: "bg-rose-100 text-rose-800 border-rose-200" },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro font-medium">Auditoria</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro">
            Trilha de Auditoria Administrativa
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
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
      <div className="bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 border-b border-borda text-texto-claro uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Data / Hora</th>
                <th className="px-5 py-3.5">Administrador (Ator)</th>
                <th className="px-5 py-3.5">Ação Realizada</th>
                <th className="px-5 py-3.5">Entidade / ID</th>
                <th className="px-5 py-3.5">Detalhes / Metadados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 text-texto-escuro">
              {logs && logs.length > 0 ? (
                (logs as unknown as AuditLogEntry[]).map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] || {
                    label: log.action,
                    color: "bg-neutral-100 text-neutral-800 border-neutral-200",
                  };

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-fundo/30 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-[11px] text-texto-claro whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-texto-escuro">
                          {log.profiles?.full_name || "Sistema / Gateway"}
                        </p>
                        <p className="text-[11px] text-texto-claro">
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
                        <span className="font-semibold uppercase text-texto-escuro">
                          {log.entity}
                        </span>
                        <p className="font-mono text-[10px] text-texto-claro truncate max-w-[120px]">
                          {log.entity_id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <pre className="text-[10px] bg-fundo/60 p-2 rounded-lg font-mono text-texto-medio max-w-sm overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-texto-claro">
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
