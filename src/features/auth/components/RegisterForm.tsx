"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  MapPin,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  Edit2,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { registerAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperPanel,
  StepperContent,
} from "@/components/reui/stepper";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/conta";

  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [currentStep, setCurrentStep] = useState(1);

  // Estados Passo 1: Conta
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Estados Passo 2: Endereço
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [ufState, setUfState] = useState("");
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Estados Passo 3: Confirmação e Termos
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Máscara e Busca de CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);
    if (raw.length > 5) {
      raw = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    }
    setPostalCode(raw);

    const clean = raw.replace(/\D/g, "");
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
        setCepError("CEP não localizado. Preencha o endereço manualmente.");
      } else {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setUfState(data.uf || "");
      }
    } catch {
      setCepError("Erro na busca do CEP. Preencha os campos abaixo.");
    } finally {
      setIsSearchingCep(false);
    }
  };

  // Validação do Passo 1 para avançar
  const validateStep1 = () => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      setStep1Error("Informe seu nome completo (mínimo 3 caracteres).");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setStep1Error("Informe um e-mail válido.");
      return false;
    }
    if (!password || password.length < 6 || !/\d/.test(password)) {
      setStep1Error("A senha deve ter no mínimo 6 dígitos e pelo menos 1 número.");
      return false;
    }
    if (password !== confirmPassword) {
      setStep1Error("A confirmação de senha não coincide com a senha digitada.");
      return false;
    }
    setStep1Error(null);
    return true;
  };

  // Validação do Passo 2 para avançar
  const validateStep2 = () => {
    const cleanCep = postalCode.replace(/\D/g, "");
    if (!cleanCep || cleanCep.length < 8) {
      setStep2Error("Informe um CEP válido com 8 dígitos.");
      return false;
    }
    if (!street.trim()) {
      setStep2Error("Informe a rua/logradouro.");
      return false;
    }
    if (!number.trim()) {
      setStep2Error("Informe o número do endereço.");
      return false;
    }
    if (!neighborhood.trim()) {
      setStep2Error("Informe o bairro.");
      return false;
    }
    if (!city.trim() || !ufState.trim()) {
      setStep2Error("Informe a cidade e o estado (UF).");
      return false;
    }
    setStep2Error(null);
    return true;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!acceptTerms) {
      e.preventDefault();
      setTermsError("Você precisa aceitar os Termos de Uso e Política de Privacidade para criar sua conta.");
      return;
    }
    setTermsError(null);
  };

  if (state?.success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-full bg-sucesso/10 text-sucesso flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-bold text-texto-escuro dark:text-[#F8EFF1]">
          Cadastro realizado com sucesso!
        </h2>
        <p className="text-xs text-texto-claro dark:text-[#C5B0B6] leading-relaxed max-w-sm">
          {state.message}
        </p>
        <div className="pt-2">
          <Link
            href={`/login${next !== "/conta" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-texto-escuro dark:text-[#F8EFF1]">
          Crie sua conta
        </h2>
        <p className="text-xs text-texto-claro dark:text-[#A8949A] mt-1">
          Tenha acesso exclusivo a mimos, joias sob medida e seus pedidos
        </p>
      </div>

      {/* Stepper com completed state (ReUI c-stepper-2) */}
      <Stepper
        value={currentStep}
        onValueChange={(val) => {
          // Permite voltar livremente ou avançar se o passo anterior for válido
          if (val === 1) setCurrentStep(1);
          if (val === 2 && (currentStep >= 2 || validateStep1())) setCurrentStep(2);
          if (val === 3 && validateStep1() && validateStep2()) setCurrentStep(3);
        }}
        className="w-full"
      >
        <StepperNav className="justify-between px-1">
          <StepperItem step={1}>
            <StepperTrigger>
              <StepperIndicator>1</StepperIndicator>
              <div className="hidden sm:flex flex-col text-left">
                <StepperTitle>Conta</StepperTitle>
                <StepperDescription>Seus dados</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>

          <StepperItem step={2}>
            <StepperTrigger>
              <StepperIndicator>2</StepperIndicator>
              <div className="hidden sm:flex flex-col text-left">
                <StepperTitle>Endereço</StepperTitle>
                <StepperDescription>Entrega</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>

          <StepperItem step={3}>
            <StepperTrigger>
              <StepperIndicator>3</StepperIndicator>
              <div className="hidden sm:flex flex-col text-left">
                <StepperTitle>Confirmação</StepperTitle>
                <StepperDescription>Termos & Resumo</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
        </StepperNav>

        {/* Mensagem de Erro da Action do Servidor */}
        {state?.message && !state.success && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-xl bg-erro/10 border border-erro/20 text-erro text-xs leading-relaxed animate-in fade-in mt-4"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{state.message}</span>
          </div>
        )}

        <form
          ref={formRef}
          action={formAction}
          onSubmit={handleFormSubmit}
          className="mt-6"
        >
          <input type="hidden" name="next" value={next} />

          <StepperPanel>
            {/* SEÇÃO 1: Dados da Conta */}
            <StepperContent value={1} forceMount={true}>
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 pb-1 border-b border-borda dark:border-[#332228]">
                  <User className="w-4 h-4 text-primaria" />
                  <span className="text-xs font-bold uppercase tracking-wider text-texto-escuro dark:text-[#F8EFF1]">
                    Passo 1 de 3: Dados Pessoais
                  </span>
                </div>

                {step1Error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{step1Error}</span>
                  </div>
                )}

                <Input
                  label="Nome Completo"
                  name="fullName"
                  type="text"
                  placeholder="Ex: Maria Silva"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  isRequired
                  iconLeft={<User className="w-4 h-4" />}
                  error={state?.fieldErrors?.fullName?.[0]}
                  disabled={isPending}
                />

                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isRequired
                  iconLeft={<Mail className="w-4 h-4" />}
                  error={state?.fieldErrors?.email?.[0]}
                  disabled={isPending}
                />

                <div className="relative">
                  <Input
                    label="Senha"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 dígitos com números"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isRequired
                    iconLeft={<Lock className="w-4 h-4" />}
                    iconRight={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-texto-escuro dark:hover:text-white transition-colors focus:outline-none"
                        aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    helperText="Mínimo 6 caracteres e ao menos 1 número"
                    error={state?.fieldErrors?.password?.[0]}
                    disabled={isPending}
                  />
                </div>

                <div className="relative">
                  <Input
                    label="Confirmar Senha"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita sua senha"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isRequired
                    iconLeft={<Lock className="w-4 h-4" />}
                    iconRight={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="hover:text-texto-escuro dark:hover:text-white transition-colors focus:outline-none"
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar confirmação"
                            : "Ver confirmação"
                        }
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    error={state?.fieldErrors?.confirmPassword?.[0]}
                    disabled={isPending}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="w-full font-semibold gap-2 shadow-sm"
                  >
                    <span>Avançar para Endereço</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </StepperContent>

            {/* SEÇÃO 2: Endereço do Cliente */}
            <StepperContent value={2} forceMount={true}>
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 pb-1 border-b border-borda dark:border-[#332228]">
                  <MapPin className="w-4 h-4 text-primaria" />
                  <span className="text-xs font-bold uppercase tracking-wider text-texto-escuro dark:text-[#F8EFF1]">
                    Passo 2 de 3: Endereço de Entrega
                  </span>
                </div>

                {step2Error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{step2Error}</span>
                  </div>
                )}

                {/* Campo CEP */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                      CEP <span className="text-primaria">*</span>
                    </label>
                    {isSearchingCep && (
                      <span className="text-[11px] text-primaria flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Buscando endereço...</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="postalCode"
                      value={postalCode}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                      disabled={isPending}
                      className="w-full h-11 px-3.5 pl-9 rounded-xl border border-borda dark:border-[#3E2931] bg-white dark:bg-[#1E1418] text-xs sm:text-sm text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder-[#8C747C] focus:outline-none focus:ring-2 focus:ring-primaria/30 focus:border-primaria transition-all"
                    />
                    <Search className="w-4 h-4 text-texto-claro dark:text-[#8E787C] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {cepError && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                      {cepError}
                    </p>
                  )}
                </div>

                {/* Rua e Número */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input
                      label="Rua / Logradouro"
                      name="street"
                      type="text"
                      placeholder="Ex: Av. Paulista"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      isRequired
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <Input
                      label="Número"
                      name="number"
                      type="text"
                      placeholder="123"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      isRequired
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Complemento e Bairro */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Complemento"
                    name="complement"
                    type="text"
                    placeholder="Apto 42, Bloco B"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    helperText="Opcional"
                    disabled={isPending}
                  />
                  <Input
                    label="Bairro"
                    name="neighborhood"
                    type="text"
                    placeholder="Centro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    isRequired
                    disabled={isPending}
                  />
                </div>

                {/* Cidade e UF */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input
                      label="Cidade"
                      name="city"
                      type="text"
                      placeholder="São Paulo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      isRequired
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <Input
                      label="Estado (UF)"
                      name="state"
                      type="text"
                      placeholder="SP"
                      maxLength={2}
                      value={ufState}
                      onChange={(e) => setUfState(e.target.value.toUpperCase())}
                      isRequired
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Ações do Passo 2 */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="flex-1 font-semibold gap-2 shadow-sm"
                  >
                    <span>Avançar</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </StepperContent>

            {/* SEÇÃO 3: Confirmação, Resumo & Termos */}
            <StepperContent value={3} forceMount={true}>
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 pb-1 border-b border-borda dark:border-[#332228]">
                  <FileCheck className="w-4 h-4 text-primaria" />
                  <span className="text-xs font-bold uppercase tracking-wider text-texto-escuro dark:text-[#F8EFF1]">
                    Passo 3 de 3: Revisão & Termos
                  </span>
                </div>

                {termsError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{termsError}</span>
                  </div>
                )}

                {/* Card de Resumo das Informações */}
                <div className="rounded-2xl border border-borda dark:border-[#38262C] bg-[#FFF9FA]/60 dark:bg-[#1E1418] p-4 space-y-3.5 text-xs">
                  {/* Resumo da Conta */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-borda/60 dark:border-[#332228]">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primaria" />
                        <span>{fullName || "Nome não informado"}</span>
                      </p>
                      <p className="text-texto-claro dark:text-[#A8949A] text-[11px]">
                        {email || "E-mail não informado"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-primaria hover:underline text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Alterar</span>
                    </button>
                  </div>

                  {/* Resumo do Endereço */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primaria" />
                        <span>Endereço de Entrega:</span>
                      </p>
                      <p className="text-texto-claro dark:text-[#A8949A] text-[11px]">
                        {street ? `${street}, nº ${number || "S/N"}` : "Endereço pendente"}
                        {complement ? ` (${complement})` : ""}
                      </p>
                      <p className="text-texto-claro dark:text-[#A8949A] text-[11px]">
                        {neighborhood ? `${neighborhood} • ` : ""}
                        {city ? `${city} - ${ufState}` : ""}
                        {postalCode ? ` • CEP: ${postalCode}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-primaria hover:underline text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Alterar</span>
                    </button>
                  </div>
                </div>

                {/* Checkbox Termos de Uso e Política de Privacidade (Obrigatório) */}
                <div className="p-3.5 rounded-xl border border-primaria/30 dark:border-primaria/40 bg-white dark:bg-[#1E1418] shadow-2xs">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked);
                        if (e.target.checked) setTermsError(null);
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-borda dark:border-[#3E2931] text-primaria focus:ring-primaria/30 accent-primaria shrink-0 cursor-pointer"
                      required
                    />
                    <span className="text-xs text-texto-escuro dark:text-[#F8EFF1] leading-relaxed">
                      Li e concordo com os{" "}
                      <Link
                        href="/termos"
                        target="_blank"
                        className="font-semibold text-primaria hover:underline inline-flex items-center gap-0.5"
                      >
                        Termos de Uso
                      </Link>{" "}
                      e a{" "}
                      <Link
                        href="/privacidade"
                        target="_blank"
                        className="font-semibold text-primaria hover:underline inline-flex items-center gap-0.5"
                      >
                        Política de Privacidade (LGPD)
                      </Link>{" "}
                      da Isis Store. <span className="text-primaria font-bold">*</span>
                    </span>
                  </label>
                </div>

                {/* Checkbox Novidades e Notificações (Opcional) */}
                <div className="p-3.5 rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1418]">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="newsletterOptIn"
                      checked={newsletterOptIn}
                      onChange={(e) => setNewsletterOptIn(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-borda dark:border-[#3E2931] text-primaria focus:ring-primaria/30 accent-primaria shrink-0 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-primaria" />
                        <span>Receber novidades e lançamentos exclusivos</span>
                      </span>
                      <p className="text-[11px] text-texto-claro dark:text-[#A8949A] leading-normal">
                        Fique por dentro de cupons relâmpago, promoções e novas coleções de joias (Opcional).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Selo de Segurança */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-texto-claro dark:text-[#A8949A] pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Seus dados são protegidos com criptografia ponta a ponta</span>
                </div>

                {/* Ações Finais */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    isLoading={isPending}
                    disabled={!acceptTerms || isPending}
                    className="flex-1 font-semibold shadow-sm"
                  >
                    Criar Minha Conta
                  </Button>
                </div>
              </div>
            </StepperContent>
          </StepperPanel>
        </form>
      </Stepper>

      {/* Rodapé: Já possui conta? */}
      <div className="text-center pt-2 border-t border-borda dark:border-[#332228]">
        <p className="text-xs text-texto-claro dark:text-[#A8949A]">
          Já possui uma conta?{" "}
          <Link
            href={`/login${next !== "/conta" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-primaria hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
