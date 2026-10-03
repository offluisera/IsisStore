"use client";

import * as React from "react";
import { KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePasswordAction } from "@/features/account/actions";

export function SecurityPasswordForm() {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Cálculo simples de força da senha
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: "Fraca", color: "bg-erro" };
    if (score <= 2) return { score: 50, label: "Razoável", color: "bg-alerta" };
    if (score === 3) return { score: 75, label: "Boa", color: "bg-blue-500" };
    return { score: 100, label: "Excelente", color: "bg-sucesso" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatusMessage({
        type: "error",
        text: "As senhas digitadas não coincidem.",
      });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({
        type: "error",
        text: "A senha deve conter no mínimo 6 caracteres.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    const result = await updatePasswordAction(null, formData);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        type: "success",
        text: result.message || "Senha alterada com sucesso!",
      });
      setPassword("");
      setConfirmPassword("");
    } else {
      setStatusMessage({
        type: "error",
        text: result.message || "Não foi possível alterar a senha.",
      });
    }
  };

  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#332228] p-6 sm:p-8 shadow-xs max-w-2xl transition-colors">
      <div className="flex items-start gap-4 mb-6 pb-4 border-b border-borda dark:border-[#332228]">
        <div className="w-10 h-10 rounded-2xl bg-primaria-soft dark:bg-[#381F27] text-primaria flex items-center justify-center shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Segurança & Alteração de Senha
          </h2>
          <p className="text-xs text-texto-claro dark:text-[#A89299] mt-0.5 leading-relaxed">
            Mantenha sua conta segura definindo uma senha forte e exclusiva.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className={`p-4 rounded-2xl mb-6 text-xs flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-sucesso/10 border border-sucesso/20 text-sucesso font-semibold"
              : "bg-erro/10 border border-erro/20 text-erro font-medium"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nova Senha */}
        <div>
          <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
            Nova Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              className="w-full h-11 pl-4 pr-11 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#8C767D] hover:text-primaria transition-colors"
              aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Barra de Força da Senha */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full bg-[#EFE6E8] dark:bg-[#332228] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-texto-claro dark:text-[#A89299]">Força da senha:</span>
                <span className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">{strength.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirmar Nova Senha */}
        <div>
          <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
            Confirmar Nova Senha
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            className="w-full h-11 px-4 rounded-xl border border-borda dark:border-[#38262C] text-xs outline-none focus:border-primaria bg-input-fundo dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#8C767D] focus:bg-fundo-card transition-all"
          />
        </div>

        <div className="pt-3 border-t border-borda dark:border-[#332228] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-sucesso font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Criptografia de ponta a ponta ativa</span>
          </div>

          <Button
            type="submit"
            variant="default"
            size="sm"
            isLoading={isSubmitting}
            disabled={!password || password !== confirmPassword}
            className="text-xs font-semibold px-5 shadow-xs self-end sm:self-auto"
          >
            Atualizar Senha
          </Button>
        </div>
      </form>
    </div>
  );
}
