"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Info,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Zap,
  Copy,
  Check,
  Sliders,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePaymentGatewayAction } from "@/features/admin/actions";

export interface GatewayRecord {
  id: string;
  name: string;
  is_active: boolean;
  is_default: boolean;
  settings: Record<string, unknown> | null;
  updated_at?: string;
}

interface GatewayManagerViewProps {
  gateways: GatewayRecord[];
}

export function GatewayManagerView({ gateways }: GatewayManagerViewProps) {
  const [selectedTab, setSelectedTab] = React.useState<
    "whatsapp" | "mercadopago" | "infinitepay"
  >("infinitepay");

  const whatsappGateway = gateways.find((g) => g.name === "whatsapp");
  const mercadopagoGateway = gateways.find((g) => g.name === "mercadopago");
  const infinitepayGateway = gateways.find((g) => g.name === "infinitepay");

  // ==========================================
  // Estados do WhatsApp Gateway
  // ==========================================
  const waSettings = (whatsappGateway?.settings as {
    name?: string;
    phone?: string;
    message_template?: string;
    instructions?: string;
    auto_redirect?: boolean;
  } | null) || {};

  const [waActive, setWaActive] = React.useState(
    whatsappGateway?.is_active ?? true
  );
  const [waPhone, setWaPhone] = React.useState(
    waSettings.phone || "5511999998888"
  );
  const [waTemplate, setWaTemplate] = React.useState(
    waSettings.message_template ||
      "Olá tive interesse no produto {produto} meu pedido é numero {pedido} no valor {valor} gostaria de mais informação"
  );
  const [waInstructions, setWaInstructions] = React.useState(
    waSettings.instructions ||
      "O cliente será redirecionado para o WhatsApp com os dados do pedido. A confirmação de pagamento e baixa do estoque serão manuais no painel."
  );
  const [isSubmittingWa, setIsSubmittingWa] = React.useState(false);
  const [waFeedback, setWaFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ==========================================
  // Estados do Mercado Pago Gateway
  // ==========================================
  const mpSettings = (mercadopagoGateway?.settings as {
    mode?: "sandbox" | "production";
    name?: string;
    public_key?: string;
    masked_access_token?: string;
    has_saved_credentials?: boolean;
    has_webhook_secret?: boolean;
    has_env_fallback?: boolean;
    is_master_configured?: boolean;
    updated_at_master?: string | null;
  } | null) || {};

  const [mpActive, setMpActive] = React.useState(
    mercadopagoGateway?.is_active ?? true
  );
  const [mpDefault, setMpDefault] = React.useState(
    mercadopagoGateway?.is_default ?? true
  );
  const [mpMode, setMpMode] = React.useState<"sandbox" | "production">(
    mpSettings.mode || "sandbox"
  );
  const [mpPublicKey, setMpPublicKey] = React.useState(
    mpSettings.public_key || ""
  );
  const [mpAccessToken, setMpAccessToken] = React.useState("");
  const [mpWebhookSecret, setMpWebhookSecret] = React.useState("");
  const [mpMasterPassword, setMpMasterPassword] = React.useState("");

  const [showAccessToken, setShowAccessToken] = React.useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = React.useState(false);
  const [showMasterPassword, setShowMasterPassword] = React.useState(false);

  const [isSubmittingMp, setIsSubmittingMp] = React.useState(false);
  const [mpFeedback, setMpFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ==========================================
  // Estados do InfinitePay Gateway
  // ==========================================
  const ifpSettings = (infinitepayGateway?.settings as {
    name?: string;
    handle?: string;
    client_id?: string;
    masked_client_secret?: string;
    mode?: "sandbox" | "production";
    max_installments?: number;
    has_saved_credentials?: boolean;
    has_secret_configured?: boolean;
    is_master_configured?: boolean;
    updated_at_master?: string | null;
  } | null) || {};

  const [ifpActive, setIfpActive] = React.useState(
    infinitepayGateway?.is_active ?? false
  );
  const [ifpDefault, setIfpDefault] = React.useState(
    infinitepayGateway?.is_default ?? false
  );
  const [ifpHandle, setIfpHandle] = React.useState(
    ifpSettings.handle || "isisstore"
  );
  const [ifpClientId, setIfpClientId] = React.useState(
    ifpSettings.client_id || ""
  );
  const [ifpClientSecret, setIfpClientSecret] = React.useState("");
  const [ifpMasterPassword, setIfpMasterPassword] = React.useState("");
  const [ifpMode, setIfpMode] = React.useState<"sandbox" | "production">(
    ifpSettings.mode || "production"
  );
  const [ifpMaxInstallments, setIfpMaxInstallments] = React.useState<number>(
    ifpSettings.max_installments || 12
  );

  const [showIfpSecret, setShowIfpSecret] = React.useState(false);
  const [showIfpMaster, setShowIfpMaster] = React.useState(false);
  const [isSubmittingIfp, setIsSubmittingIfp] = React.useState(false);
  const [ifpFeedback, setIfpFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);

  // App Origin para exibir Webhook exato
  const [appUrl, setAppUrl] = React.useState("https://sua-loja.com");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin);
    }
  }, []);

  // Preview simulado da mensagem do WhatsApp
  const sampleProduct = "Vestido Isis Silk Premium";
  const sampleOrderNumber = "ISIS-49201";
  const samplePrice = "R$ 389,90";

  const previewMessage = waTemplate
    .replace(/\{produto\}/gi, sampleProduct)
    .replace(/\{pedido\}/gi, sampleOrderNumber)
    .replace(/\{valor\}/gi, samplePrice);

  const cleanPhone = waPhone.replace(/\D/g, "");
  const testWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(previewMessage)}`;

  // Salvar WhatsApp
  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappGateway) return;

    setIsSubmittingWa(true);
    setWaFeedback(null);

    const formData = new FormData();
    formData.append("id", whatsappGateway.id);
    formData.append("is_active", String(waActive));
    formData.append("is_default", "false");
    formData.append(
      "settings",
      JSON.stringify({
        name: "Pedido & Pagamento via WhatsApp",
        phone: cleanPhone,
        message_template: waTemplate.trim(),
        instructions: waInstructions.trim(),
        auto_redirect: true,
      })
    );

    try {
      const res = await updatePaymentGatewayAction(formData);
      if (res.success) {
        setWaFeedback({
          type: "success",
          message: "Configurações do WhatsApp atualizadas com sucesso!",
        });
        setTimeout(() => setWaFeedback(null), 4000);
      } else {
        setWaFeedback({ type: "error", message: res.message });
      }
    } catch {
      setWaFeedback({
        type: "error",
        message: "Falha de conexão ao salvar gateway.",
      });
    } finally {
      setIsSubmittingWa(false);
    }
  };

  // Salvar Mercado Pago
  const handleSaveMercadoPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mercadopagoGateway) return;

    if (!mpMasterPassword.trim()) {
      setMpFeedback({
        type: "error",
        message:
          "Informe a Senha Master configurada em ADMIN_MASTER_PASSWORD no .env para autorizar e salvar as alterações.",
      });
      return;
    }

    setIsSubmittingMp(true);
    setMpFeedback(null);

    const formData = new FormData();
    formData.append("id", mercadopagoGateway.id);
    formData.append("is_active", String(mpActive));
    formData.append("is_default", String(mpDefault));
    formData.append("master_password", mpMasterPassword.trim());

    if (mpPublicKey.trim()) {
      formData.append("public_key", mpPublicKey.trim());
    }
    if (mpAccessToken.trim()) {
      formData.append("access_token", mpAccessToken.trim());
    }
    if (mpWebhookSecret.trim()) {
      formData.append("webhook_secret", mpWebhookSecret.trim());
    }

    formData.append(
      "settings",
      JSON.stringify({
        name: "Mercado Pago Checkout Pro",
        mode: mpMode,
      })
    );

    try {
      const res = await updatePaymentGatewayAction(formData);
      if (res.success) {
        setMpFeedback({
          type: "success",
          message:
            res.message || "Configurações e credenciais do Mercado Pago salvas com sucesso!",
        });
        setMpMasterPassword("");
        setMpAccessToken("");
        setMpWebhookSecret("");
        setTimeout(() => setMpFeedback(null), 5000);
      } else {
        setMpFeedback({ type: "error", message: res.message });
      }
    } catch {
      setMpFeedback({
        type: "error",
        message: "Falha de conexão ao salvar gateway.",
      });
    } finally {
      setIsSubmittingMp(false);
    }
  };

  // Salvar InfinitePay
  const handleSaveInfinitePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infinitepayGateway) return;

    if (ifpClientSecret.trim() && !ifpMasterPassword.trim()) {
      setIfpFeedback({
        type: "error",
        message:
          "Informe a Senha Master configurada em ADMIN_MASTER_PASSWORD no .env para criptografar e salvar o Client Secret da InfinitePay.",
      });
      return;
    }

    setIsSubmittingIfp(true);
    setIfpFeedback(null);

    const formData = new FormData();
    formData.append("id", infinitepayGateway.id);
    formData.append("is_active", String(ifpActive));
    formData.append("is_default", String(ifpDefault));
    formData.append("handle", ifpHandle.replace(/^@/, "").trim());
    formData.append("client_id", ifpClientId.trim());
    if (ifpClientSecret.trim()) {
      formData.append("client_secret", ifpClientSecret.trim());
    }
    if (ifpMasterPassword.trim()) {
      formData.append("master_password", ifpMasterPassword.trim());
    }
    formData.append("mode", ifpMode);
    formData.append("max_installments", String(ifpMaxInstallments));

    try {
      const res = await updatePaymentGatewayAction(formData);
      if (res.success) {
        setIfpFeedback({
          type: "success",
          message:
            res.message || "Configurações e credenciais da InfinitePay salvas com sucesso!",
        });
        setIfpClientSecret("");
        setIfpMasterPassword("");
        setTimeout(() => setIfpFeedback(null), 5000);
      } else {
        setIfpFeedback({ type: "error", message: res.message });
      }
    } catch {
      setIfpFeedback({
        type: "error",
        message: "Falha de conexão ao salvar gateway InfinitePay.",
      });
    } finally {
      setIsSubmittingIfp(false);
    }
  };

  const handleCopyWebhook = () => {
    const webhookUrl = `${appUrl}/api/webhooks/infinitepay`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  const insertTag = (tag: string) => {
    setWaTemplate((prev) => `${prev} ${tag}`.trim());
  };

  const infinitePayCleanHandle = (ifpHandle || "isisstore").replace(/^@/, "").trim();
  const simulatedInfinitePayUrl = `https://checkout.infinitepay.io/${infinitePayCleanHandle}/ISIS-49201`;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header com Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#332228] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#A89299] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Gateways de Pagamento</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Configuração de Gateways de Pagamento
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#A89299] mt-0.5">
            Gerencie InfinitePay, Mercado Pago e atendimento comercial via WhatsApp com segurança criptográfica AES-256-GCM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Cofre Criptográfico Ativo
          </span>
        </div>
      </div>

      {/* Overview 4 KPIs Interativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* InfinitePay */}
        <button
          type="button"
          onClick={() => setSelectedTab("infinitepay")}
          className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
            selectedTab === "infinitepay"
              ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs ring-2 ring-amber-500/30"
              : "border-borda dark:border-[#332228] bg-white dark:bg-[#1E1518] hover:border-borda-hover"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] truncate">
                InfinitePay
              </span>
              {ifpDefault && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold uppercase tracking-wider">
                  Padrão
                </span>
              )}
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block mt-0.5">
              {ifpActive ? `Ativo (${ifpMode.toUpperCase()})` : "Inativo"}
            </span>
            <span className="text-[10px] text-texto-claro dark:text-[#A89299] block truncate">
              {ifpHandle ? `@${ifpHandle}` : "Sem handle"} • até {ifpMaxInstallments}x
            </span>
          </div>
        </button>

        {/* Mercado Pago */}
        <button
          type="button"
          onClick={() => setSelectedTab("mercadopago")}
          className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
            selectedTab === "mercadopago"
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs ring-2 ring-blue-500/30"
              : "border-borda dark:border-[#332228] bg-white dark:bg-[#1E1518] hover:border-borda-hover"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/40">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] truncate">
                Mercado Pago
              </span>
              {mpDefault && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold uppercase tracking-wider">
                  Padrão
                </span>
              )}
            </div>
            <span className="text-xs text-blue-700 dark:text-blue-400 font-bold block mt-0.5">
              {mpActive ? `Ativo (${mpMode.toUpperCase()})` : "Inativo"}
            </span>
            <span className="text-[10px] text-texto-claro dark:text-[#A89299] block truncate">
              Checkout Pro & Pix
            </span>
          </div>
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={() => setSelectedTab("whatsapp")}
          className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
            selectedTab === "whatsapp"
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs ring-2 ring-emerald-500/30"
              : "border-borda dark:border-[#332228] bg-white dark:bg-[#1E1518] hover:border-borda-hover"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/40">
            <MessageCircle className="w-6 h-6 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block truncate">
              WhatsApp
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
              {waActive ? "Ativo (Manual)" : "Inativo"}
            </span>
            <span className="text-[10px] text-texto-claro dark:text-[#A89299] block truncate">
              {waPhone || "Não configurado"}
            </span>
          </div>
        </button>

        {/* Resumo de Segurança */}
        <div className="p-5 rounded-2xl border border-borda dark:border-[#332228] bg-white dark:bg-[#1E1518] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/40">
            <Lock className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs text-texto-claro dark:text-[#A89299] block">
              Proteção de Chaves
            </span>
            <span className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1] block truncate">
              Senha Master
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
              AES-256-GCM Ativado
            </span>
          </div>
        </div>
      </div>

      {/* Tabs de Seleção de Gateway */}
      <div className="flex items-center gap-2 border-b border-borda dark:border-[#332228] pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedTab("infinitepay")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            selectedTab === "infinitepay"
              ? "bg-amber-500 text-white shadow-xs font-bold"
              : "text-texto-claro dark:text-[#A89299] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-neutral-100 dark:hover:bg-[#251A1E]"
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>InfinitePay (Checkout & Links)</span>
          {ifpActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white/50" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab("mercadopago")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            selectedTab === "mercadopago"
              ? "bg-blue-600 text-white shadow-xs font-bold"
              : "text-texto-claro dark:text-[#A89299] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-neutral-100 dark:hover:bg-[#251A1E]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Mercado Pago Pro</span>
          {mpActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white/50" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab("whatsapp")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            selectedTab === "whatsapp"
              ? "bg-emerald-600 text-white shadow-xs font-bold"
              : "text-texto-claro dark:text-[#A89299] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-neutral-100 dark:hover:bg-[#251A1E]"
          }`}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>WhatsApp Comercial</span>
          {waActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white/50" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* ABA 1: INFINITEPAY (DESTAQUE INTEGRADO)                   */}
      {/* ========================================================= */}
      {selectedTab === "infinitepay" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#332228] shadow-xs overflow-hidden transition-colors">
            {/* Header do Card InfinitePay */}
            <div className="p-6 border-b border-borda/60 dark:border-[#2C1D23] bg-gradient-to-r from-amber-50/70 dark:from-amber-950/30 to-white dark:to-[#1E1518] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      InfinitePay Checkout
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      Link Inteligente + Cartão até 12x
                    </span>
                  </div>
                  <p className="text-xs text-texto-claro dark:text-[#A89299]">
                    Processamento direto e links de checkout da InfinitePay com taxas competitivas e confirmação instantânea.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ifpActive}
                  onChange={(e) => setIfpActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 dark:after:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <form onSubmit={handleSaveInfinitePay} className="p-6 space-y-6 text-xs">
              {ifpFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                    ifpFeedback.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
                  }`}
                >
                  {ifpFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>{ifpFeedback.message}</span>
                </div>
              )}

              {/* Ambiente & Gateway Padrão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    Ambiente de Execução
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIfpMode("production")}
                      className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                        ifpMode === "production"
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-2xs font-bold"
                          : "border-borda dark:border-[#332228] text-texto-claro dark:text-[#A89299] hover:border-borda-hover bg-white dark:bg-[#151012]"
                      }`}
                    >
                      Produção Oficial
                    </button>
                    <button
                      type="button"
                      onClick={() => setIfpMode("sandbox")}
                      className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                        ifpMode === "sandbox"
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-2xs font-bold"
                          : "border-borda dark:border-[#332228] text-texto-claro dark:text-[#A89299] hover:border-borda-hover bg-white dark:bg-[#151012]"
                      }`}
                    >
                      Sandbox (Testes)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-borda dark:border-[#332228] bg-fundo/40 dark:bg-[#151012]/60">
                  <div>
                    <span className="font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      Gateway Padrão
                    </span>
                    <span className="text-[11px] text-texto-claro dark:text-[#A89299] block">
                      Priorizar InfinitePay no checkout
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ifpDefault}
                    onChange={(e) => setIfpDefault(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-borda dark:border-[#332228] bg-white dark:bg-[#151012] focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Handle da Loja */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                    <span>Handle / Usuário da Loja na InfinitePay</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-texto-claro dark:text-[#A89299]">
                    Ex: isisstore (sem @)
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#6E555C] font-mono text-xs">
                    @
                  </span>
                  <Input
                    type="text"
                    value={ifpHandle}
                    onChange={(e) => setIfpHandle(e.target.value.replace(/^@/, ""))}
                    placeholder="isisstore"
                    className="pl-8 font-mono text-xs bg-white dark:bg-[#151012] border-borda dark:border-[#332228] text-texto-escuro dark:text-[#F8EFF1] h-10"
                    required
                  />
                </div>
                <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                  Utilizado para compor o link de pagamento exclusivo da sua loja na InfinitePay.
                </p>
              </div>

              {/* Parcelamento Máximo */}
              <div className="space-y-1.5">
                <label className="font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Parcelamento Máximo no Cartão
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[1, 2, 3, 6, 10, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setIfpMaxInstallments(num)}
                      className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                        ifpMaxInstallments === num
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold shadow-2xs"
                          : "border-borda dark:border-[#332228] text-texto-claro dark:text-[#A89299] hover:border-borda-hover bg-white dark:bg-[#151012]"
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Credenciais de API (Client ID e Secret) */}
              <div className="space-y-3 pt-3 border-t border-borda dark:border-[#2C1D23]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Credenciais de Integração API</span>
                  </label>
                  {ifpSettings.has_saved_credentials ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Configurado no Banco
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                      Modo Básico (Handle Link)
                    </span>
                  )}
                </div>

                {/* Client ID */}
                <div className="space-y-1">
                  <span className="text-[11px] text-texto-medio dark:text-[#D1BFC4] font-medium block">
                    Client ID (Chave Pública da Aplicação)
                  </span>
                  <Input
                    type="text"
                    value={ifpClientId}
                    onChange={(e) => setIfpClientId(e.target.value)}
                    placeholder="app_xxxxxxxxxxxxxxxxx"
                    className="font-mono text-[11px] bg-white dark:bg-[#151012] border-borda dark:border-[#332228] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#6E555C] h-9"
                  />
                </div>

                {/* Client Secret */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-texto-medio dark:text-[#D1BFC4] font-medium block">
                      Client Secret (Token de Autenticação / Bearer)
                    </span>
                    {ifpSettings.masked_client_secret && (
                      <span className="text-[10px] font-mono text-texto-claro dark:text-[#A89299]">
                        Atual: {ifpSettings.masked_client_secret}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showIfpSecret ? "text" : "password"}
                      value={ifpClientSecret}
                      onChange={(e) => setIfpClientSecret(e.target.value)}
                      placeholder={
                        ifpSettings.has_secret_configured
                          ? "•••••••••••••••• (Preencha apenas para substituir)"
                          : "sec_xxxxxxxxxxxxxxxxxxxx"
                      }
                      className="font-mono text-[11px] bg-white dark:bg-[#151012] border-borda dark:border-[#332228] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#6E555C] pr-9 h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowIfpSecret(!showIfpSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#A89299] hover:text-texto-escuro dark:hover:text-[#F8EFF1]"
                      title={showIfpSecret ? "Ocultar segredo" : "Exibir segredo"}
                    >
                      {showIfpSecret ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Caixa de Autorização: Senha Master */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-[11px] space-y-2.5 text-amber-950 dark:text-amber-200 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-amber-900 dark:text-amber-200">
                        Autorização com Senha Master
                      </span>
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold border border-amber-300/60 dark:border-amber-700/60">
                        ADMIN_MASTER_PASSWORD
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed mt-0.5">
                      Para salvar ou atualizar o Client Secret criptografado com AES-256-GCM, confirme com sua Senha Master do servidor.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    type={showIfpMaster ? "text" : "password"}
                    value={ifpMasterPassword}
                    onChange={(e) => setIfpMasterPassword(e.target.value)}
                    placeholder="Digite a Senha Master (necessária ao alterar credenciais)"
                    className="font-mono text-xs bg-white dark:bg-[#151012] pr-9 border-amber-300 dark:border-amber-700/70 text-texto-escuro dark:text-[#F8EFF1] placeholder:text-amber-700/50 dark:placeholder:text-amber-400/40 focus:border-amber-500 focus:ring-amber-500/20 h-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowIfpMaster(!showIfpMaster)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                    title={showIfpMaster ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showIfpMaster ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de Salvar InfinitePay */}
              <Button
                type="submit"
                isLoading={isSubmittingIfp}
                className="w-full text-xs font-semibold gap-1.5 shadow-xs py-2.5 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Salvar Configurações da InfinitePay</span>
              </Button>
            </form>
          </div>

          {/* Coluna Direita: Webhook e Guia Prático InfinitePay */}
          <div className="lg:col-span-5 space-y-6">
            {/* Box de Webhook Oficial */}
            <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#332228] shadow-xs space-y-3 text-xs transition-colors">
              <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#2C1D23]">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  URL de Notificação Webhook
                </h3>
              </div>

              <p className="text-texto-claro dark:text-[#A89299] text-[11px] leading-relaxed">
                Cadastre a URL abaixo no painel de desenvolvedor da InfinitePay para confirmação automática de pagamentos aprovados via Pix e Cartão:
              </p>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-fundo/70 dark:bg-[#151012] border border-borda dark:border-[#332228]">
                <code className="text-[11px] font-mono text-texto-escuro dark:text-[#F8EFF1] break-all flex-1">
                  {appUrl}/api/webhooks/infinitepay
                </code>
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#20171A] border border-borda dark:border-[#332228] hover:text-primaria text-texto-medio transition-colors shrink-0"
                  title="Copiar URL do Webhook"
                >
                  {copiedWebhook ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {copiedWebhook && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  ✓ URL copiada com sucesso para a área de transferência!
                </span>
              )}
            </div>

            {/* Preview do Link Gerado */}
            <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#332228] shadow-xs space-y-3 text-xs transition-colors">
              <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#2C1D23]">
                <ExternalLink className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Simulação do Link de Checkout
                </h3>
              </div>

              <p className="text-texto-claro dark:text-[#A89299] text-[11px] leading-relaxed">
                Quando o cliente finaliza o pedido pelo InfinitePay Checkout, o sistema gera dinamicamente a URL segura:
              </p>

              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 font-mono text-[11px] text-amber-950 dark:text-amber-200 break-all">
                {simulatedInfinitePayUrl}
              </div>

              <a
                href={simulatedInfinitePayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                <span>Testar abertura de link da InfinitePay</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Dossiê Explicativo InfinitePay */}
            <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#332228] shadow-xs space-y-3 text-xs transition-colors">
              <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#2C1D23]">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Vantagens da InfinitePay na Isis Store
                </h3>
              </div>

              <ul className="space-y-2 text-texto-medio dark:text-[#D1BFC4] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Menores Taxas:</strong> Economia considerável em parcelamentos no cartão de crédito em até 12x.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Pix Instantâneo:</strong> Baixa automática em segundos via Webhook oficial.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Modo Híbrido:</strong> Funciona mesmo apenas com o Handle da loja através do Link Inteligente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Proteção de Senha Master:</strong> Credenciais nunca são expostas em texto puro.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 2: MERCADO PAGO                                       */}
      {/* ========================================================= */}
      {selectedTab === "mercadopago" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#332228] shadow-xs overflow-hidden transition-colors">
            <div className="p-6 border-b border-borda/60 dark:border-[#2C1D23] bg-gradient-to-r from-blue-50/50 dark:from-blue-950/30 to-white dark:to-[#1E1518] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Mercado Pago Checkout Pro
                  </h2>
                  <p className="text-xs text-texto-claro dark:text-[#A89299]">
                    Processamento com Pix Instantâneo e Cartão de Crédito via Checkout Pro.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mpActive}
                  onChange={(e) => setMpActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 dark:after:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <form onSubmit={handleSaveMercadoPago} className="p-6 space-y-5 text-xs">
              {mpFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    mpFeedback.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{mpFeedback.message}</span>
                </div>
              )}

              {/* Ambiente de Execução */}
              <div className="space-y-1.5">
                <label className="font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Ambiente de Execução
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMpMode("sandbox")}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                      mpMode === "sandbox"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-2xs font-bold"
                        : "border-borda dark:border-[#332228] text-texto-claro dark:text-[#A89299] hover:border-borda-hover bg-white dark:bg-[#151012]"
                    }`}
                  >
                    Sandbox (Testes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMpMode("production")}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                      mpMode === "production"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-2xs font-bold"
                        : "border-borda dark:border-[#332228] text-texto-claro dark:text-[#A89299] hover:border-borda-hover bg-white dark:bg-[#151012]"
                    }`}
                  >
                    Produção Oficial
                  </button>
                </div>
              </div>

              {/* Gateway Padrão */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-borda dark:border-[#332228] bg-fundo/40 dark:bg-[#151012]/60 transition-colors">
                <div>
                  <span className="font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    Gateway Padrão
                  </span>
                  <span className="text-[11px] text-texto-claro dark:text-[#A89299] block">
                    Usado preferencialmente no checkout online
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={mpDefault}
                  onChange={(e) => setMpDefault(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-borda dark:border-[#332228] bg-white dark:bg-[#151012] focus:ring-blue-500"
                />
              </div>

              {/* Seção de Credenciais do Mercado Pago */}
              <div className="space-y-3 pt-2 border-t border-borda dark:border-[#2C1D23]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Credenciais de Integração</span>
                  </label>
                  {mpSettings.has_saved_credentials ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Ativo no Banco (AES-256)
                    </span>
                  ) : mpSettings.has_env_fallback ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                      <Info className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      Fallback do .env
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                      Não configurado
                    </span>
                  )}
                </div>

                {/* Chave Pública */}
                <div className="space-y-1">
                  <span className="text-[11px] text-texto-medio dark:text-[#D1BFC4] font-medium block">
                    Public Key (Chave Pública)
                  </span>
                  <Input
                    type="text"
                    value={mpPublicKey}
                    onChange={(e) => setMpPublicKey(e.target.value)}
                    placeholder="TEST-xxxxxxxx ou APP_USR-xxxxxxxx"
                    className="font-mono text-[11px] bg-white dark:bg-[#151012] border-borda dark:border-[#332228] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#6E555C] h-9"
                  />
                </div>

                {/* Access Token */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-texto-medio dark:text-[#D1BFC4] font-medium block">
                      Access Token (Token Privado)
                    </span>
                    {mpSettings.masked_access_token && (
                      <span className="text-[10px] font-mono text-texto-claro dark:text-[#A89299]">
                        Atual: {mpSettings.masked_access_token}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showAccessToken ? "text" : "password"}
                      value={mpAccessToken}
                      onChange={(e) => setMpAccessToken(e.target.value)}
                      placeholder={
                        mpSettings.has_saved_credentials
                          ? "•••••••••••••••• (Preencha apenas para substituir)"
                          : "TEST-xxxxxxxx ou APP_USR-xxxxxxxx"
                      }
                      className="font-mono text-[11px] bg-white dark:bg-[#151012] border-borda dark:border-[#332228] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#6E555C] pr-9 h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#A89299] hover:text-texto-escuro dark:hover:text-[#F8EFF1]"
                      title={showAccessToken ? "Ocultar token" : "Exibir token"}
                    >
                      {showAccessToken ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-1">
                  <span className="text-[11px] text-texto-medio dark:text-[#D1BFC4] font-medium block">
                    Webhook Secret (Opcional — HMAC)
                  </span>
                  <div className="relative">
                    <Input
                      type={showWebhookSecret ? "text" : "password"}
                      value={mpWebhookSecret}
                      onChange={(e) => setMpWebhookSecret(e.target.value)}
                      placeholder={
                        mpSettings.has_webhook_secret
                          ? "•••••••••••••••• (Preencha para alterar)"
                          : "Chave HMAC da notificação IPN"
                      }
                      className="font-mono text-[11px] bg-white dark:bg-[#151012] border-borda dark:border-[#332228] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#6E555C] pr-9 h-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#A89299] hover:text-texto-escuro dark:hover:text-[#F8EFF1]"
                      title={showWebhookSecret ? "Ocultar segredo" : "Exibir segredo"}
                    >
                      {showWebhookSecret ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Caixa de Autorização: Senha Master */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-[11px] space-y-2.5 text-amber-950 dark:text-amber-200 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-amber-900 dark:text-amber-200">
                        Autorização com Senha Master
                      </span>
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold border border-amber-300/60 dark:border-amber-700/60">
                        ADMIN_MASTER_PASSWORD
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed mt-0.5">
                      Para salvar o ambiente ou alterar as credenciais, digite a senha master configurada no arquivo .env do servidor.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    type={showMasterPassword ? "text" : "password"}
                    value={mpMasterPassword}
                    onChange={(e) => setMpMasterPassword(e.target.value)}
                    placeholder="Digite a Senha Master do .env"
                    className="font-mono text-xs bg-white dark:bg-[#151012] pr-9 border-amber-300 dark:border-amber-700/70 text-texto-escuro dark:text-[#F8EFF1] placeholder:text-amber-700/50 dark:placeholder:text-amber-400/40 focus:border-amber-500 focus:ring-amber-500/20 h-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterPassword(!showMasterPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                    title={showMasterPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showMasterPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmittingMp}
                variant="default"
                className="w-full text-xs font-semibold gap-1.5 shadow-xs py-2.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Salvar Configurações com Senha Master</span>
              </Button>
            </form>
          </div>

          {/* Dossiê Mercado Pago */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#332228] shadow-xs space-y-3 text-xs transition-colors">
            <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#2C1D23]">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                Como Obter Credenciais Mercado Pago?
              </h3>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-texto-medio dark:text-[#D1BFC4] leading-relaxed">
              <li>Acesse o Portal de Desenvolvedores do Mercado Pago.</li>
              <li>Crie uma aplicação do tipo &quot;Checkout Pro&quot;.</li>
              <li>Copie a <strong>Public Key</strong> e o <strong>Access Token</strong> (TEST para testes, APP_USR para produção).</li>
              <li>Cadastre a URL de Webhook: <code className="bg-fundo/70 px-1 py-0.5 rounded font-mono text-[10px]">{appUrl}/api/webhooks/mercadopago</code></li>
              <li>Cole as credenciais no formulário ao lado e autorize com sua Senha Master.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 3: WHATSAPP COMERCIAL                                 */}
      {/* ========================================================= */}
      {selectedTab === "whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#332228] shadow-xs overflow-hidden transition-colors">
            <div className="p-6 border-b border-borda/60 dark:border-[#2C1D23] bg-gradient-to-r from-emerald-50/50 dark:from-emerald-950/30 to-white dark:to-[#1E1518] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      WhatsApp Comercial
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      Baixa Manual
                    </span>
                  </div>
                  <p className="text-xs text-texto-claro dark:text-[#A89299]">
                    Registra o pedido na loja e encaminha o cliente para fechar a compra diretamente no WhatsApp.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={waActive}
                  onChange={(e) => setWaActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 dark:after:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <form onSubmit={handleSaveWhatsApp} className="p-6 space-y-6">
              {waFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                    waFeedback.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
                  }`}
                >
                  {waFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>{waFeedback.message}</span>
                </div>
              )}

              {/* Número do WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                    Número de WhatsApp com DDI e DDD
                  </label>
                  <span className="text-[11px] text-texto-claro dark:text-[#A89299]">
                    Apenas números (Ex: 5511999998888)
                  </span>
                </div>
                <Input
                  type="text"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="5511999998888"
                  className="bg-white dark:bg-[#151012] border-borda dark:border-[#332228] text-texto-escuro dark:text-[#F8EFF1] font-mono text-xs"
                  required
                />
              </div>

              {/* Mensagem Template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                    Template da Mensagem Automática
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => insertTag("{produto}")}
                      className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40"
                    >
                      + {"{produto}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag("{pedido}")}
                      className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40"
                    >
                      + {"{pedido}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTag("{valor}")}
                      className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40"
                    >
                      + {"{valor}"}
                    </button>
                  </div>
                </div>

                <textarea
                  value={waTemplate}
                  onChange={(e) => setWaTemplate(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-borda dark:border-[#332228] bg-white dark:bg-[#151012] p-3 text-xs text-texto-escuro dark:text-[#F8EFF1] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
                  required
                />
              </div>

              {/* Instruções para o Cliente */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                  Instruções Exibidas no Checkout
                </label>
                <textarea
                  value={waInstructions}
                  onChange={(e) => setWaInstructions(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-borda dark:border-[#332228] bg-white dark:bg-[#151012] p-3 text-xs text-texto-escuro dark:text-[#F8EFF1] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Botão de Salvar WhatsApp */}
              <Button
                type="submit"
                isLoading={isSubmittingWa}
                className="w-full text-xs font-semibold gap-1.5 shadow-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Salvar Configurações do WhatsApp</span>
              </Button>
            </form>
          </div>

          {/* Coluna Direita: Preview e Dossiê WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#332228] shadow-xs space-y-3 text-xs transition-colors">
              <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#2C1D23]">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Como Funciona a Baixa Manual?
                </h3>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-texto-medio dark:text-[#D1BFC4] leading-relaxed">
                <li>O cliente seleciona <strong>WhatsApp</strong> no checkout da loja.</li>
                <li>O sistema registra o pedido na tabela <span className="font-mono text-texto-escuro dark:text-[#F8EFF1]">orders</span> como <strong>Aguardando Pagamento</strong>.</li>
                <li>O cliente é encaminhado ao WhatsApp com o texto pré-preenchido.</li>
                <li>Após confirmar o pagamento via Pix ou transferência com o cliente, vá em <Link href="/admin/pedidos" className="text-primaria font-semibold hover:underline">Pedidos</Link> e altere o status para <strong>Pago</strong>.</li>
              </ol>
            </div>

            {/* Preview da Mensagem */}
            <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#332228] shadow-xs space-y-3 text-xs transition-colors">
              <span className="font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                Preview da Conversa WhatsApp
              </span>
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed">
                &ldquo;{previewMessage}&rdquo;
              </div>
              <a
                href={testWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                <span>Testar envio no WhatsApp Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
