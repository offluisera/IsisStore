"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Shield,
  MapPin,
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  CreditCard,
  User,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { adminCreateCustomerAction } from "@/features/admin/actions";

export function NewCustomerForm() {
  const router = useRouter();

  // Estados dos campos
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

  // Máscara de Telefone
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

  // Máscara de CPF
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

  // Máscara de CEP e Busca ViaCEP
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

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setCpf("");
    setRole("customer");
    setPostalCode("");
    setStreet("");
    setNumber("");
    setComplement("");
    setNeighborhood("");
    setCity("");
    setState("");
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFeedback({
        type: "error",
        message: "Por favor preencha os campos obrigatórios (Nome, E-mail e Senha).",
      });
      return;
    }

    if (password.length < 6) {
      setFeedback({
        type: "error",
        message: "A senha deve conter no mínimo 6 caracteres.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("fullName", fullName.trim());
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
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
      const res = await adminCreateCustomerAction(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        setTimeout(() => {
          router.push("/admin/clientes");
        }, 1500);
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Ocorreu um erro ao comunicar com o servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Formulário Principal */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-borda shadow-xs space-y-8"
      >
        {/* Seção 1: Dados Cadastrais */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-borda/60">
            <User className="w-4 h-4 text-primaria" />
            <h2 className="font-serif text-base font-bold text-texto-escuro">
              1. Identificação do Cliente
            </h2>
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
                placeholder="Ex: Maria Clara Souza"
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
                placeholder="cliente@exemplo.com"
                className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
              />
            </div>

            {/* Senha Inicial */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-texto-escuro flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-texto-claro" />
                  <span>Senha de Acesso</span>
                  <span className="text-primaria">*</span>
                </span>
                <span className="text-[10px] text-texto-claro">mín. 6 dígitos</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defina a senha do cliente"
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

            {/* Telefone / WhatsApp */}
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

        {/* Seção 2: Privilégios & Papel na Loja */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-borda/60">
            <Shield className="w-4 h-4 text-primaria" />
            <h2 className="font-serif text-base font-bold text-texto-escuro">
              2. Nível de Acesso (Cargo)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opção Cliente */}
            <label
              onClick={() => setRole("customer")}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                role === "customer"
                  ? "border-primaria bg-primaria-soft/20 shadow-2xs"
                  : "border-borda hover:border-primaria/40 bg-white"
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={role === "customer"}
                onChange={() => setRole("customer")}
                className="mt-1 text-primaria focus:ring-primaria"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-texto-escuro block">
                  Cliente Comum (Padrão)
                </span>
                <p className="text-[11px] text-texto-claro leading-relaxed">
                  Acesso para compras na vitrine, carrinho, checkout e área do cliente pessoal.
                </p>
              </div>
            </label>

            {/* Opção Administrador */}
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
                <p className="text-[11px] text-texto-claro leading-relaxed">
                  Acesso completo ao Painel Administrativo, pedidos, produtos, clientes e auditoria.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Seção 3: Endereço Inicial de Entrega */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borda/60">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-primaria" />
              <h2 className="font-serif text-base font-bold text-texto-escuro">
                3. Endereço Principal (Opcional)
              </h2>
            </div>
            <span className="text-[11px] text-texto-claro">
              Poderá ser editado a qualquer momento
            </span>
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
                Logradouro (Rua, Av, etc.)
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Ex: Rua das Flores"
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
                placeholder="Ex: 120"
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
                placeholder="Apto 42, Bloco B"
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
                placeholder="Centro"
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
                placeholder="São Paulo"
                className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors"
              />
            </div>

            {/* Estado (UF) */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-texto-escuro">
                UF / Estado
              </label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="SP"
                className="w-full px-3.5 py-2.5 text-xs bg-fundo/40 rounded-xl border border-borda focus:outline-none focus:border-primaria transition-colors uppercase font-mono"
              />
            </div>
          </div>
        </div>

        {/* Feedback visual */}
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

        {/* Botões de Ação */}
        <div className="pt-4 border-t border-borda/60 flex items-center justify-between">
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-texto-claro hover:text-texto-escuro transition-colors font-medium"
          >
            Limpar formulário
          </button>

          <div className="flex items-center gap-3">
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
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar Cliente</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Card Lateral: Preview em Tempo Real */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-borda shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-borda/60 text-xs font-bold text-texto-escuro uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primaria" />
            <span>Pré-visualização do Cliente</span>
          </div>

          {/* Card Visual Simulado */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FFF5F6] via-white to-[#FDF2F4] border border-primaria/20 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secundaria to-primaria text-white flex items-center justify-center font-serif font-bold text-base shadow-sm">
                {fullName ? fullName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-texto-escuro truncate">
                  {fullName || "Nome do Cliente"}
                </p>
                <p className="text-[11px] text-texto-claro truncate font-mono">
                  {email || "cliente@exemplo.com"}
                </p>
                <span
                  className={`inline-block mt-1 text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${
                    role === "admin"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-primaria-soft text-primaria"
                  }`}
                >
                  {role === "admin" ? "Administrador" : "Cliente"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-primaria/10 text-xs text-texto-medio">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-texto-claro">Telefone:</span>
                <span className="font-mono">{phone || "Não informado"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-texto-claro">CPF:</span>
                <span className="font-mono">{cpf || "Não informado"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-texto-claro">Cidade/UF:</span>
                <span>
                  {city && state ? `${city} - ${state}` : "Não informado"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-texto-claro leading-relaxed space-y-2">
            <p>
              &bull; Ao salvar, a conta é criada diretamente no sistema de autenticação e no banco de dados.
            </p>
            <p>
              &bull; Todas as inserções manuais são registradas no log imutável de auditoria da Isis Store.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
