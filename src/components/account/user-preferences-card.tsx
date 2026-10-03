"use client";

import * as React from "react";
import { Sun, Moon, Bell, MessageSquare, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/lib/theme/theme-context";

export function UserPreferencesCard() {
  const { theme, setTheme } = useTheme();
  const [notifyWhatsapp, setNotifyWhatsapp] = React.useState(true);
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [notifyPromos, setNotifyPromos] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    // Carregar preferências salvas no localStorage se existirem
    try {
      const saved = localStorage.getItem("isis_user_prefs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.notifyWhatsapp === "boolean") setNotifyWhatsapp(parsed.notifyWhatsapp);
        if (typeof parsed.notifyEmail === "boolean") setNotifyEmail(parsed.notifyEmail);
        if (typeof parsed.notifyPromos === "boolean") setNotifyPromos(parsed.notifyPromos);
      }
    } catch {
      // Ignorar fallback
    }
  }, []);

  const handleToggle = (key: "whatsapp" | "email" | "promos") => {
    let newWhatsapp = notifyWhatsapp;
    let newEmail = notifyEmail;
    let newPromos = notifyPromos;

    if (key === "whatsapp") newWhatsapp = !notifyWhatsapp;
    if (key === "email") newEmail = !notifyEmail;
    if (key === "promos") newPromos = !notifyPromos;

    setNotifyWhatsapp(newWhatsapp);
    setNotifyEmail(newEmail);
    setNotifyPromos(newPromos);

    try {
      localStorage.setItem(
        "isis_user_prefs",
        JSON.stringify({
          notifyWhatsapp: newWhatsapp,
          notifyEmail: newEmail,
          notifyPromos: newPromos,
        })
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {
      // Ignorar fallback
    }
  };

  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#332228] p-6 sm:p-8 shadow-xs max-w-2xl transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-borda dark:border-[#332228] mb-6">
        <div>
          <h2 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primaria" />
            <span>Preferências do Sistema & Notificações</span>
          </h2>
          <p className="text-xs text-texto-claro dark:text-[#A89299] mt-0.5">
            Personalize sua experiência visual e escolha como quer receber avisos.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-[11px] font-semibold text-sucesso flex items-center gap-1 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Salvo!</span>
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Seletor de Tema Visual */}
        <div>
          <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-2.5">
            Aparência da Loja
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Opção Tema Claro */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                theme === "light"
                  ? "border-primaria bg-primaria-soft/40 text-texto-escuro shadow-xs ring-1 ring-primaria/30"
                  : "border-[#F0E5E7] dark:border-[#38262C] bg-[#FAF7F8] dark:bg-[#251A1E] text-texto-claro dark:text-[#A89299] hover:border-primaria/40"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  theme === "light"
                    ? "bg-primaria text-white"
                    : "bg-white dark:bg-[#1E1518] text-amber-500 border border-[#F0E5E7] dark:border-[#38262C]"
                }`}
              >
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Modo Claro
                </p>
                <p className="text-[10px] text-texto-claro dark:text-[#A89299]">
                  Tons rosados e acolhedores
                </p>
              </div>
            </button>

            {/* Opção Tema Noturno */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                theme === "dark"
                  ? "border-primaria bg-primaria-soft/30 dark:bg-[#381F27] text-texto-escuro dark:text-[#F8EFF1] shadow-xs ring-1 ring-primaria/30"
                  : "border-[#F0E5E7] dark:border-[#38262C] bg-[#FAF7F8] dark:bg-[#251A1E] text-texto-claro dark:text-[#A89299] hover:border-primaria/40"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-primaria text-white"
                    : "bg-white dark:bg-[#1E1518] text-purple-400 border border-[#F0E5E7] dark:border-[#38262C]"
                }`}
              >
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Modo Noturno
                </p>
                <p className="text-[10px] text-texto-claro dark:text-[#A89299]">
                  Ameixa profundo para a noite
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Toggles de Notificação */}
        <div className="pt-4 border-t border-[#F0E5E7] dark:border-[#332228] space-y-4">
          <label className="block text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Canais de Comunicação
          </label>

          {/* Toggle WhatsApp */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F8] dark:bg-[#251A1E] border border-[#F0E5E7] dark:border-[#38262C]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                  Atualizações via WhatsApp
                </p>
                <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                  Avisos de confirmação, envio e código de rastreio em tempo real.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notifyWhatsapp}
              onClick={() => handleToggle("whatsapp")}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                notifyWhatsapp ? "bg-primaria" : "bg-[#D9CACD] dark:bg-[#3D2B32]"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  notifyWhatsapp ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle E-mail */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F8] dark:bg-[#251A1E] border border-[#F0E5E7] dark:border-[#38262C]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                  E-mails Transacionais
                </p>
                <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                  Comprovantes de pagamento e notas fiscais eletrônicas em PDF.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notifyEmail}
              onClick={() => handleToggle("email")}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                notifyEmail ? "bg-primaria" : "bg-[#D9CACD] dark:bg-[#3D2B32]"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  notifyEmail ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle Promoções e Cupons */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F8] dark:bg-[#251A1E] border border-[#F0E5E7] dark:border-[#38262C]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                  Cupons & Ofertas VIP
                </p>
                <p className="text-[11px] text-texto-claro dark:text-[#A89299]">
                  Lançamentos de mimos em primeira mão e cupons exclusivos.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notifyPromos}
              onClick={() => handleToggle("promos")}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                notifyPromos ? "bg-primaria" : "bg-[#D9CACD] dark:bg-[#3D2B32]"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  notifyPromos ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
