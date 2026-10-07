"use client";

import { useActionState, useState } from "react";
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
} from "lucide-react";
import { registerAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/conta";

  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4 animate-in fade-in">
        <div className="w-12 h-12 rounded-full bg-sucesso/10 text-sucesso flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-semibold text-texto-escuro">
          Cadastro realizado!
        </h2>
        <p className="text-xs text-texto-claro leading-relaxed max-w-sm">
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
    <form action={formAction} className="flex flex-col gap-4">
      <div className="text-center mb-1">
        <h2 className="text-xl font-serif font-semibold text-texto-escuro">
          Crie sua conta
        </h2>
        <p className="text-xs text-texto-claro mt-1">
          Tenha acesso exclusivo a lançamentos e pedidos
        </p>
      </div>

      {state?.message && !state.success && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-erro/10 border border-erro/20 text-erro text-xs leading-relaxed animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-3.5">
        <Input
          label="Nome Completo"
          name="fullName"
          type="text"
          placeholder="Ex: Maria Silva"
          autoComplete="name"
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
            isRequired
            iconLeft={<Lock className="w-4 h-4" />}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-texto-escuro transition-colors focus:outline-none"
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
            isRequired
            iconLeft={<Lock className="w-4 h-4" />}
            iconRight={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="hover:text-texto-escuro transition-colors focus:outline-none"
                aria-label={
                  showConfirmPassword ? "Ocultar confirmação" : "Ver confirmação"
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
      </div>

      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="accept-terms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-borda text-primaria focus:ring-primaria/20 accent-primaria"
          required
        />
        <label htmlFor="accept-terms" className="text-xs text-texto-claro select-none">
          Li e concordo com os{" "}
          <span className="text-texto-escuro font-medium underline">
            Termos de Uso
          </span>{" "}
          e{" "}
          <span className="text-texto-escuro font-medium underline">
            Política de Privacidade
          </span>
          .
        </label>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        isLoading={isPending}
        disabled={!acceptTerms || isPending}
        className="w-full font-semibold shadow-sm mt-1"
      >
        Criar Minha Conta
      </Button>

      <div className="text-center pt-2 border-t border-borda">
        <p className="text-xs text-texto-claro">
          Já possui uma conta?{" "}
          <Link
            href={`/login${next !== "/conta" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-primaria hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </form>
  );
}
