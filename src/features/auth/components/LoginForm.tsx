"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/conta";
  const errorParam = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-serif font-semibold text-texto-escuro">
          Bem-vindo(a) de volta
        </h2>
        <p className="text-xs text-texto-claro mt-1">
          Acesse sua conta para acompanhar seus pedidos
        </p>
      </div>

      {/* Alerta de erro vindo da URL ou da Action */}
      {(state?.message || errorParam) && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-erro/10 border border-erro/20 text-erro text-xs leading-relaxed animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {state?.message ||
              (errorParam === "auth_callback_failed"
                ? "Falha na confirmação de autenticação. Tente novamente."
                : "Acesso restrito. Faça login para continuar.")}
          </span>
        </div>
      )}

      {/* Hidden input para redirecionamento após o login */}
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-4">
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
            placeholder="••••••••"
            autoComplete="current-password"
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
            error={state?.fieldErrors?.password?.[0]}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Link
          href="/recuperar-senha"
          className="text-xs font-medium text-primaria hover:underline transition-colors"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        isLoading={isPending}
        className="w-full font-semibold shadow-sm"
      >
        Acessar Conta
      </Button>

      <div className="text-center pt-2 border-t border-borda">
        <p className="text-xs text-texto-claro">
          Ainda não tem conta?{" "}
          <Link
            href={`/cadastro${next !== "/conta" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-primaria hover:underline"
          >
            Cadastre-se gratuitamente
          </Link>
        </p>
      </div>
    </form>
  );
}
