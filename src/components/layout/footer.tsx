"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useStoreSettings } from "@/lib/settings/store-settings-context";
import { Mail, Phone, Clock, ShieldCheck } from "lucide-react";

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  const storeSettings = useStoreSettings();

  const rawPhone = storeSettings.support_phone || "5517992495308";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const cleanInstagram = (storeSettings.instagram_handle || "@isisstoreoficial")
    .replace(/^@/, "")
    .trim();

  return (
    <footer className="w-full bg-fundo-card border-t border-borda-suave mt-12 py-12 px-4 sm:px-8 text-texto-escuro transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left text-sm">
        {/* Brand & Slogan */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-primaria-border shrink-0">
              <Image
                src={storeSettings.logo_url || "/images/logo/logo.jpeg"}
                alt={storeSettings.store_name || "Isis Store"}
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-serif text-xl font-bold text-texto-escuro">
              {storeSettings.store_name || "Isis Store"}
            </span>
          </div>
          <p className="text-xs text-texto-claro leading-relaxed mb-3">
            {storeSettings.store_description ||
              "Tudo o que você ama, em um só lugar! ♡ Entregamos afeto, elegância e mimos especiais em cada pedido."}
          </p>
          {storeSettings.footer_text && (
            <p className="text-[11px] text-texto-claro leading-relaxed mb-3 italic">
              {storeSettings.footer_text}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-primaria font-semibold">
            <ShieldCheck className="w-4 h-4 text-primaria" />
            <span>Compra Segura & Garantia de Satisfação</span>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-serif text-base font-bold text-texto-escuro mb-3">
            Navegação
          </h4>
          <ul className="space-y-2 text-xs text-texto-medio">
            <li>
              <Link href="/" className="hover:text-primaria transition-colors">
                Início
              </Link>
            </li>
            <li>
              <Link
                href="/produtos"
                className="hover:text-primaria transition-colors"
              >
                Todos os Produtos
              </Link>
            </li>
            <li>
              <Link
                href="/categorias"
                className="hover:text-primaria transition-colors"
              >
                Departamentos & Categorias
              </Link>
            </li>
            <li>
              <Link
                href="/conta"
                className="hover:text-primaria transition-colors"
              >
                Minha Conta
              </Link>
            </li>
            <li>
              <Link
                href="/conta/pedidos"
                className="hover:text-primaria transition-colors"
              >
                Meus Pedidos & Rastreio
              </Link>
            </li>
          </ul>
        </div>

        {/* Categorias Oficiais */}
        <div>
          <h4 className="font-serif text-base font-bold text-texto-escuro mb-3">
            Vitrines Principais
          </h4>
          <ul className="space-y-2 text-xs text-texto-medio">
            <li>
              <Link
                href="/produtos?categoria=brinquedos"
                className="hover:text-primaria transition-colors"
              >
                Brinquedos
              </Link>
            </li>
            <li>
              <Link
                href="/produtos?categoria=personalizados"
                className="hover:text-primaria transition-colors"
              >
                Personalizados
              </Link>
            </li>
            <li>
              <Link
                href="/produtos?categoria=infantil-baby"
                className="hover:text-primaria transition-colors"
              >
                Infantil & Baby
              </Link>
            </li>
            <li>
              <Link
                href="/produtos?categoria=joias-e-semijoias"
                className="hover:text-primaria transition-colors"
              >
                Joias e Semijoias
              </Link>
            </li>
            <li>
              <Link
                href="/produtos?categoria=acessorios"
                className="hover:text-primaria transition-colors"
              >
                Acessórios & Presentes
              </Link>
            </li>
          </ul>
        </div>

        {/* Suporte & Canais de Contato */}
        <div>
          <h4 className="font-serif text-base font-bold text-texto-escuro mb-3">
            Atendimento
          </h4>
          <div className="space-y-2.5 text-xs text-texto-claro leading-relaxed">
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-primaria shrink-0 mt-0.5" />
              <span>
                {storeSettings.support_hours ||
                  "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-primaria shrink-0" />
              <a
                href={`mailto:${storeSettings.support_email || "contato@isisstore.com.br"}`}
                className="text-texto-medio hover:text-primaria transition-colors font-medium"
              >
                {storeSettings.support_email || "contato@isisstore.com.br"}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-texto-medio hover:text-emerald-600 transition-colors font-semibold"
              >
                WhatsApp: {storeSettings.support_phone || "(17) 99249-5308"}
              </a>
            </div>

            {cleanInstagram && (
              <div className="flex items-center gap-2">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <a
                  href={`https://instagram.com/${cleanInstagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-texto-medio hover:text-pink-600 transition-colors font-medium"
                >
                  @{cleanInstagram}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright & CNPJ */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-borda-suave flex flex-col sm:flex-row items-center justify-between text-xs text-texto-claro gap-3">
        <p>
          © {new Date().getFullYear()} {storeSettings.store_name || "Isis Store"}. Todos os direitos reservados.
          {storeSettings.cnpj ? ` • CNPJ: ${storeSettings.cnpj}` : ""}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/termos" className="hover:text-primaria transition-colors">
            Termos de Uso
          </Link>
          <span>•</span>
          <Link
            href="/privacidade"
            className="hover:text-primaria transition-colors"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
