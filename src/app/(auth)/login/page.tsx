import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Isis Store",
  description:
    "Acesse sua conta na Isis Store para visualizar pedidos, endereços e acompanhar compras.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-xs text-texto-claro">
          Carregando formulário de acesso...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
