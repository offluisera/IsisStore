import { Truck, ShieldCheck, Headphones } from "lucide-react";

export function TrustBar() {
  const BENEFITS = [
    {
      title: "Frete Grátis",
      subtitle: "para todo o Brasil em compras acima de R$ 199,00",
      icon: Truck,
    },
    {
      title: "Pagamento Seguro",
      subtitle: "processamento oficial via Mercado Pago",
      icon: ShieldCheck,
    },
    {
      title: "Atendimento Especializado",
      subtitle: "suporte humanizado sempre com você",
      icon: Headphones,
    },
  ];

  return (
    <div className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-5 shadow-xs select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 divide-y md:divide-y-0 md:divide-x divide-[#F7EFF1] dark:divide-[#2C1D23]">
        {BENEFITS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`flex items-center gap-3.5 ${
                idx > 0 ? "pt-4 md:pt-0 md:pl-5" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] dark:bg-[#2C1A20] text-primaria flex items-center justify-center shrink-0 border border-primaria/10 dark:border-primaria/25">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-serif font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  {item.title}
                </h4>
                <p className="text-[11px] text-texto-claro dark:text-[#A89299] leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
