export type FeatureCardIcon =
  | "gem"
  | "shield"
  | "gift"
  | "award"
  | "sparkles"
  | "heart"
  | "truck"
  | "star"
  | "crown"
  | "check";

export type FeatureCardBadgeVariant = "default" | "success" | "warning" | "discount";

export interface BrandFeatureCard {
  id: string;
  title: string;
  description: string;
  badge_text: string;
  badge_variant: FeatureCardBadgeVariant;
  icon: FeatureCardIcon;
}

export const DEFAULT_BRAND_FEATURE_CARDS: BrandFeatureCard[] = [
  {
    id: "1",
    title: "Banhos Nobres 18k & Prata",
    description:
      "Camadas generosas de ouro 18k e prata 925 com verniz de proteção suíço para brilho intenso.",
    badge_text: "Alta Durabilidade",
    badge_variant: "success",
    icon: "gem",
  },
  {
    id: "2",
    title: "100% Hipoalergênicas",
    description:
      "Livre de níquel e metais pesados. Total conforto e segurança, inclusive para peles sensíveis.",
    badge_text: "Níquel Free",
    badge_variant: "default",
    icon: "shield",
  },
  {
    id: "3",
    title: "Embalagem de Presente",
    description:
      "Caixa rígida exclusiva com laço de cetim e nosso aroma autoral. Experiência de unboxing mágica.",
    badge_text: "Pronto p/ Presentear",
    badge_variant: "warning",
    icon: "gift",
  },
  {
    id: "4",
    title: "Garantia de 1 Ano",
    description:
      "Todas as semijoias acompanham certificado de garantia de 1 ano no banho e suporte humanizado.",
    badge_text: "Certificado Oficial",
    badge_variant: "discount",
    icon: "award",
  },
];

export interface StoreSettings {
  id: string;
  store_name: string;
  store_tagline: string;
  store_description: string;
  logo_url: string;
  favicon_url: string;
  meta_title: string;
  meta_description: string;
  seo_keywords: string;
  og_image_url: string;
  canonical_url: string;
  support_email: string;
  support_phone: string;
  instagram_handle: string;
  announcement_banner_text: string;
  announcement_banner_active: boolean;
  free_shipping_threshold_cents: number;
  maintenance_mode: boolean;
  maintenance_message: string;
  brand_features_badge: string;
  brand_features_title: string;
  brand_features_subtitle: string;
  brand_features_cards: BrandFeatureCard[];
  daily_deals_active: boolean;
  daily_deals_discount_percent: number;
  daily_deals_product_limit: number;
  daily_deals_title: string;
  daily_deals_bg_color?: string;
  cnpj?: string;
  support_hours?: string;
  footer_text?: string;
  // Banner Editorial de Presentes & Cupom
  editorial_banner_active?: boolean;
  editorial_banner_badge?: string;
  editorial_banner_title?: string;
  editorial_banner_description?: string;
  editorial_banner_coupon_active?: boolean;
  editorial_banner_coupon_code?: string;
  editorial_banner_coupon_text?: string;
  editorial_banner_button_text?: string;
  editorial_banner_button_link?: string;
  editorial_banner_whatsapp_button_text?: string;
  editorial_banner_image_url?: string;
  editorial_banner_image_tag?: string;
  editorial_banner_image_title?: string;
  editorial_banner_image_subtitle?: string;
  updated_at?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: "default",
  store_name: "Isis Store",
  store_tagline: "Semijoias & Presentes Especiais",
  store_description:
    "Loja online oficial Isis Store. Moda, acessórios e semijoias com acabamento impecável.",
  logo_url: "/images/logo/logo.jpeg",
  favicon_url: "/favicon.ico",
  meta_title: "Isis Store — E-commerce Feminino & Presenteável",
  meta_description:
    "Loja online oficial Isis Store. Moda, acessórios e presentes especiais com carinho, elegância e acabamento impecável.",
  seo_keywords:
    "semijoias, colares, brincos, pulseiras, anéis, ouro 18k, prata 925, presentes femininos, moda",
  og_image_url: "/images/logo/logo.jpeg",
  canonical_url: "https://isisstore.com.br",
  support_email: "contato@isisstore.com.br",
  support_phone: "5517992495308",
  instagram_handle: "@isisstoreoficial",
  cnpj: "58.123.456/0001-78",
  support_hours: "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h",
  footer_text: "Isis Store — Semijoias, Brinquedos e Presentes Finos. Envio para todo o Brasil.",
  announcement_banner_text:
    "Frete Grátis para todo o Brasil acima de R$ 199,00",
  announcement_banner_active: true,
  free_shipping_threshold_cents: 19900,
  maintenance_mode: false,
  maintenance_message:
    "Estamos preparando novidades incríveis para você. Voltamos em breve!",
  brand_features_badge: "Padrão de Excelência",
  brand_features_title: "Por que escolher a Isis Store?",
  brand_features_subtitle:
    "Cada semijoia e presente especial é produzido com carinho, durabilidade e acabamento impecável.",
  brand_features_cards: DEFAULT_BRAND_FEATURE_CARDS,
  daily_deals_active: true,
  daily_deals_discount_percent: 15,
  daily_deals_product_limit: 15,
  daily_deals_title: "Ofertas do dia",
  daily_deals_bg_color: "#D9480F",
  editorial_banner_active: true,
  editorial_banner_badge: "Experiência Exclusiva de Compra",
  editorial_banner_title: "A Arte de Presentear quem você mais Ama",
  editorial_banner_description:
    "Seja para um aniversário, data marcante ou simplesmente um gesto de carinho, a Isis Store cuida de cada detalhe: personalizamos o cartão de dedicatória e enviamos na embalagem de luxo pronta para encantar.",
  editorial_banner_coupon_active: true,
  editorial_banner_coupon_code: "ISIS10",
  editorial_banner_coupon_text: "10% OFF em todo o catálogo",
  editorial_banner_button_text: "Explorar Coleção Completa",
  editorial_banner_button_link: "/produtos",
  editorial_banner_whatsapp_button_text: "Personal Shopper no WhatsApp",
  editorial_banner_image_url: "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
  editorial_banner_image_tag: "Destaque da Coleção",
  editorial_banner_image_title: "Colar Coração Delicado",
  editorial_banner_image_subtitle: "Banho em Ouro Rosa com Zircônias",
};
