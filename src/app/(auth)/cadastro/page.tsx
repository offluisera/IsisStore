import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastre-se | Isis Store",
  description: "Crie sua conta para desfrutar de atendimento e produtos exclusivos na Isis Store.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-xs text-texto-claro">
          Carregando formulário de cadastro...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
