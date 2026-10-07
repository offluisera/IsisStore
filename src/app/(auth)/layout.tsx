import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-fundo text-texto-escuro flex flex-col justify-between relative selection:bg-primaria-soft selection:text-primaria">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-texto-claro hover:text-primaria transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Voltar para a loja</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-texto-claro">
          <ShieldCheck className="w-4 h-4 text-sucesso" />
          <span className="hidden sm:inline">Ambiente 100% Seguro</span>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md sm:max-w-lg transition-all">
          {/* Brand Identity */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Link href="/" className="inline-block relative mb-3 group">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primaria/20 shadow-md group-hover:border-primaria transition-all duration-300">
                <Image
                  src="/images/logo/logo.jpeg"
                  alt="Isis Store Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-texto-escuro">
              Isis Store
            </h1>
            <p className="text-xs uppercase tracking-widest text-primaria font-semibold mt-1">
              Elegância &amp; Personalização
            </p>
          </div>

          {/* Form Box */}
          <div className="bg-fundo-card rounded-2xl border border-borda shadow-sm p-6 sm:p-8 backdrop-blur-sm transition-colors">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-texto-claro border-t border-borda/60">
        <p>&copy; {new Date().getFullYear()} Isis Store. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
