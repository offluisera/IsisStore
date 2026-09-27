"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { resetPasswordAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-serif font-semibold text-texto-escuro">
          Criar Nova Senha
        </h2>
        <p className="text-xs text-texto-claro mt-1">
          Defina sua nova credencial de acesso seguro
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

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Input
            label="Nova Senha"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Nova senha (mínimo 6 dígitos)"
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
            label="Confirmar Nova Senha"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repita a nova senha"
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

      <Button
        type="submit"
        variant="default"
        size="lg"
        isLoading={isPending}
        className="w-full font-semibold shadow-sm"
      >
        Redefinir e Entrar
      </Button>

      <div className="text-center pt-2 border-t border-borda">
        <Link
          href="/login"
          className="text-xs text-primaria hover:underline font-medium"
        >
          Voltar para o login
        </Link>
      </div>
    </form>
  );
}
