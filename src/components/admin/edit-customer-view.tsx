"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit3,
  User,
  Mail,
  Lock,
  Phone,
  CreditCard,
  Shield,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Search,
  ExternalLink,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { adminUpdateCustomerAction } from "@/features/admin/actions";

export interface EditableCustomer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: "customer" | "admin";
  created_at: string;
  orderCount: number;
  totalSpentCents: number;
  address?: {
    postal_code: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
}

interface EditCustomerViewProps {
  customers: EditableCustomer[];
  initialSelectedId?: string;
  currentUserId: string;
}

export function EditCustomerView({
  customers,
  initialSelectedId,
  currentUserId,
}: EditCustomerViewProps) {
  const router = useRouter();

  // Seletor de cliente
  const [selectedId, setSelectedId] = React.useState<string>(() => {
    if (initialSelectedId && customers.some((c) => c.id === initialSelectedId)) {
      return initialSelectedId;
    }
    return customers[0]?.id || "";
  });

  const [selectorSearch, setSelectorSearch] = React.useState("");

  const currentCustomer = React.useMemo(() => {
    return customers.find((c) => c.id === selectedId);
  }, [customers, selectedId]);

  // Estados dos campos do formulário
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [role, setRole] = React.useState<"customer" | "admin">("customer");

  // Endereço
  const [postalCode, setPostalCode] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [complement, setComplement] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");

  // Feedback e Loading
  const [isSearchingCep, setIsSearchingCep] = React.useState(false);
  const [cepError, setCepError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sincroniza formulário com o cliente selecionado
  React.useEffect(() => {
    if (!currentCustomer) return;
    setFullName(currentCustomer.full_name || "");
    setEmail(currentCustomer.email || "");
    setPassword("");
    setPhone(currentCustomer.phone || "");
    setCpf(currentCustomer.cpf || "");
    setRole(currentCustomer.role || "customer");

    if (currentCustomer.address) {
      setPostalCode(currentCustomer.address.postal_code || "");
      setStreet(currentCustomer.address.street || "");
      setNumber(currentCustomer.address.number || "");
      setComplement(currentCustomer.address.complement || "");
      setNeighborhood(currentCustomer.address.neighborhood || "");
      setCity(currentCustomer.address.city || "");
      setState(currentCustomer.address.state || "");
    } else {
      setPostalCode("");
      setStreet("");
      setNumber("");
      setComplement("");
      setNeighborhood("");
      setCity("");
      setState("");
    }
    setFeedback(null);
  }, [currentCustomer]);

  // Atualizar URL silenciosamente ao mudar cliente
  const handleSelectCustomer = (id: string) => {
    setSelectedId(id);
    router.replace(`/admin/clientes/editar?id=${id}`);
  };

  // Máscaras
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    setPhone(val);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 9) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6, 9)}-${val.slice(9)}`;
    } else if (val.length > 6) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6)}`;
    } else if (val.length > 3) {
      val = `${val.slice(0, 3)}.${val.slice(3)}`;
    }
    setCpf(val);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setPostalCode(val);

    const clean = val.replace(/\D/g, "");
    if (clean.length === 8) {
      fetchViaCep(clean);
    }
  };

  const fetchViaCep = async (cleanCep: string) => {
    setIsSearchingCep(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
      } else {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
    } catch {
      setCepError("Falha na consulta automática do CEP.");
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    if (!fullName.trim() || !email.trim()) {
      setFeedback({
        type: "error",
        message: "Nome completo e E-mail são obrigatórios.",
      });
      return;
    }

    if (password && password.trim().length > 0 && password.trim().length < 6) {
      setFeedback({
        type: "error",
        message: "A nova senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("userId", currentCustomer.id);
    formData.append("fullName", fullName.trim());
    formData.append("email", email.trim().toLowerCase());
    if (password.trim()) formData.append("password", password.trim());
    formData.append("phone", phone);
    formData.append("cpf", cpf);
    formData.append("role", role);
    formData.append("postalCode", postalCode);
    formData.append("street", street);
    formData.append("number", number);
    formData.append("complement", complement);
    formData.append("neighborhood", neighborhood);
    formData.append("city", city);
    formData.append("state", state);

    try {
      const res = await adminUpdateCustomerAction(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        setPassword("");
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Falha ao salvar as alterações do cliente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clientes filtrados no seletor
  const selectorFiltered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(selectorSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(selectorSearch.toLowerCase())
  );

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isSelf = currentCustomer?.id === currentUserId;

  return (
    <div className="space-y-6">
      {/* Seletor Superior de Cliente */}
      <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="w-10 h-10 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1 max-w-sm">
            <span className="text-[11px] font-semibold text-texto-claro uppercase tracking-wider block">
              Selecione o Cliente para Editar
            </span>
            <select
              value={selectedId}
              onChange={(e) => handleSelectCustomer(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-borda rounded-xl px-3 py-2 text-texto-escuro focus:outline-none focus:border-primaria"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email}) {c.role === "admin" ? "[ADMIN]" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Atalhos Rápidos */}
        {currentCustomer && (
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Link
              href={`/admin/clientes/busca?id=${currentCustomer.id}`}
              className={buttonVariants({
                variant: "white",
                size: "sm",
                className: "flex items-center gap-1.5",
              })}
            >
              <Search className="w-3.5 h-3.5 text-primaria" />
              <span>Ver Dossiê 360°</span>
            </Link>
          </div>
        )}
      </div>

      {currentCustomer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulário Principal */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-borda shadow-xs space-y-8"
          >
            {/* Seção 1: Dados Pessoais */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-borda/60">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-primaria" />
                  <h2 className="font-serif text-base font-bold text-texto-escuro">
                    1. Dados do Cliente
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-texto-claro">
                  ID: {currentCustomer.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome Completo */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro flex items-center gap-1">
                    <span>Nome Completo</span>
                    <span className="text-primaria">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro flex items-center gap-1">
                    <Mail className="w-3 h-3 text-texto-claro" />
                    <span>E-mail</span>
                    <span className="text-primaria">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>

                {/* Redefinição de Senha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-texto-claro" />
                      <span>Nova Senha</span>
                    </span>
                    <span className="text-[10px] text-texto-claro">
                      Opcional (mín. 6 dígitos)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Deixe em branco para não alterar"
                      className="w-full pl-3.5 pr-9 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-claro hover:text-texto-escuro"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro flex items-center gap-1">
                    <Phone className="w-3 h-3 text-texto-claro" />
                    <span>Telefone / WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>

                {/* CPF */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-texto-claro" />
                    <span>CPF (Documento)</span>
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Cargo / Permissões */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-borda/60">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-primaria" />
                  <h2 className="font-serif text-base font-bold text-texto-escuro">
                    2. Cargo na Loja
                  </h2>
                </div>
                {isSelf && (
                  <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-2 py-0.5 rounded-full">
                    Sua conta logada
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => !isSelf && setRole("customer")}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelf ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  } ${
                    role === "customer"
                      ? "border-primaria bg-primaria-soft/20 shadow-2xs"
                      : "border-borda hover:border-primaria/40 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    disabled={isSelf}
                    checked={role === "customer"}
                    onChange={() => setRole("customer")}
                    className="mt-1 text-primaria focus:ring-primaria"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-texto-escuro block">
                      Cliente Comum
                    </span>
                    <p className="text-[11px] text-texto-claro">
                      Acesso apenas para compras e sua conta pessoal.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setRole("admin")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    role === "admin"
                      ? "border-amber-500 bg-amber-500/10 shadow-2xs"
                      : "border-borda hover:border-amber-500/40 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                      <span>Administrador</span>
                      <span className="text-[9px] bg-amber-200 text-amber-800 px-1 rounded-sm uppercase font-bold">
                        Painel
                      </span>
                    </span>
                    <p className="text-[11px] text-texto-claro">
                      Acesso completo ao painel administrativo e dados.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Seção 3: Endereço Principal */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-borda/60">
                <MapPin className="w-4 h-4 text-primaria" />
                <h2 className="font-serif text-base font-bold text-texto-escuro">
                  3. Endereço Principal de Entrega
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                {/* CEP */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro flex items-center justify-between">
                    <span>CEP</span>
                    {isSearchingCep && (
                      <span className="text-[10px] text-primaria flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Buscando...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors font-mono"
                  />
                  {cepError && (
                    <p className="text-[10px] text-erro mt-0.5">{cepError}</p>
                  )}
                </div>

                {/* Rua */}
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>

                {/* Número */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro">
                    Número
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>

                {/* Complemento */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>

                {/* Bairro */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>

                {/* Cidade */}
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
                  />
                </div>

                {/* UF */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro">
                    UF
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 text-xs ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Botões */}
            <div className="pt-4 border-t border-borda/60 flex items-center justify-between">
              <Link
                href="/admin/clientes"
                className={buttonVariants({ variant: "white", size: "sm" })}
              >
                Cancelar
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando Alterações...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Card Lateral: Resumo & Atalhos */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-borda shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-borda/60 text-xs font-bold text-texto-escuro uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4 text-primaria" />
                <span>Atividade do Cliente</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-fundo/40 border border-borda flex items-center justify-between">
                  <span className="text-xs text-texto-claro">Total de Pedidos</span>
                  <span className="text-xs font-bold text-texto-escuro">
                    {currentCustomer.orderCount}{" "}
                    {currentCustomer.orderCount === 1 ? "pedido" : "pedidos"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-fundo/40 border border-borda flex items-center justify-between">
                  <span className="text-xs text-texto-claro">Volume Gasto</span>
                  <span className="text-xs font-bold text-primaria">
                    {formatCurrency(currentCustomer.totalSpentCents)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-fundo/40 border border-borda flex items-center justify-between">
                  <span className="text-xs text-texto-claro">Data de Cadastro</span>
                  <span className="text-xs font-mono text-texto-escuro">
                    {formatDate(currentCustomer.created_at)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/admin/clientes/busca?id=${currentCustomer.id}`}
                  className={buttonVariants({
                    variant: "default",
                    size: "sm",
                    className: "w-full flex items-center justify-center gap-1.5",
                  })}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Dossiê Completo (Busca Avançada)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-borda text-texto-claro">
          Nenhum cliente cadastrado para edição.
        </div>
      )}
    </div>
  );
}
