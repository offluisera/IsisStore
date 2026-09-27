"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { forgotPasswordAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    null
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4 animate-in fade-in">
        <div className="w-12 h-12 rounded-full bg-sucesso/10 text-sucesso flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-semibold text-texto-escuro">
          Verifique seu e-mail
        </h2>
        <p className="text-xs text-texto-claro leading-relaxed max-w-sm">
          {state.message}
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className={buttonVariants({ variant: "white", size: "default" })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Voltar ao login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-serif font-semibold text-texto-escuro">
          Recuperar Senha
        </h2>
        <p className="text-xs text-texto-claro mt-1">
          Informe seu e-mail cadastrado e enviaremos um link de recuperação
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

      <Button
        type="submit"
        variant="default"
        size="lg"
        isLoading={isPending}
        className="w-full font-semibold shadow-sm"
      >
        Enviar Link de Recuperação
      </Button>

      <div className="text-center pt-2 border-t border-borda">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-primaria hover:underline font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Lembrou da senha? Fazer login</span>
        </Link>
      </div>
    </form>
  );
}
