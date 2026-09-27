import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redefinir Senha | Isis Store",
  description: "Crie uma nova senha segura para a sua conta na Isis Store.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
