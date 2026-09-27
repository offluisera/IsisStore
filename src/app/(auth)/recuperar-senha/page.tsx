import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Senha | Isis Store",
  description: "Recupere o acesso à sua conta Isis Store com rapidez e segurança.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
