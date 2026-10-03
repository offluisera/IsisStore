import { adminListCouponsAction } from "@/features/coupons/actions";
import { CouponsManagerView } from "@/components/admin/coupons-manager-view";

export const metadata = {
  title: "Gerenciamento de Cupons — Isis Store Admin",
  description: "Gerencie cupons de desconto, regras de carrinho, limites de uso e promoções do e-commerce.",
};

export default async function AdminCouponsPage() {
  const coupons = await adminListCouponsAction();

  return <CouponsManagerView initialCoupons={coupons} />;
}
