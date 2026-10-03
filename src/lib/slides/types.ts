export type SlideType = "editorial" | "full_banner";

export type SlideBgTheme =
  | "default"
  | "dark_rose"
  | "soft_pink"
  | "gold_luxury"
  | "deep_wine";

export interface HomeSlide {
  id: string;
  title: string;
  title_highlight?: string;
  subtitle?: string;
  badge_text?: string;
  image_url: string;
  slide_type: SlideType;
  primary_button_text?: string;
  primary_button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  bg_theme: SlideBgTheme;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface HomeSlideInput {
  id?: string;
  title: string;
  title_highlight?: string;
  subtitle?: string;
  badge_text?: string;
  image_url: string;
  slide_type?: SlideType;
  primary_button_text?: string;
  primary_button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  bg_theme?: SlideBgTheme;
  is_active?: boolean;
  sort_order?: number;
}

export const DEFAULT_HOME_SLIDES: HomeSlide[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    title: "Produtos que fazem",
    title_highlight: "você sorrir! ♡",
    subtitle:
      "Beleza, estilo, conforto e muito afeto para o seu dia a dia. Conheça nossa seleção de mimos pensados com amor em cada detalhe.",
    badge_text: "Coleção Especial",
    image_url: "/images/banner-rosto.jpeg",
    slide_type: "editorial",
    primary_button_text: "Ver Coleção",
    primary_button_url: "#produtos-destaque",
    secondary_button_text: "Nossa História",
    secondary_button_url: "/sobre",
    bg_theme: "default",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    title: "Semijoias Banhadas a Ouro",
    title_highlight: "Brilho e Elegância ✨",
    subtitle:
      "Colares, brincos e pulseiras delicadas com acabamento de alta joalheria, antialérgicos e com garantia.",
    badge_text: "Lançamento Exclusivo",
    image_url: "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
    slide_type: "editorial",
    primary_button_text: "Explorar Semijoias",
    primary_button_url: "#produtos-destaque",
    secondary_button_text: "Presentes",
    secondary_button_url: "/produtos",
    bg_theme: "gold_luxury",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    title: "Mimos & Presentes Especiais",
    title_highlight: "com Afeto Único ♡",
    subtitle:
      "Acessórios e mimos pensados para surpreender quem você ama. Embalagens presenteáveis com cartão personalizado.",
    badge_text: "Frete Grátis acima de R$ 199",
    image_url: "/images/products/ursinho-de-pelucia-carinho.jpg",
    slide_type: "editorial",
    primary_button_text: "Conhecer Mimos",
    primary_button_url: "#produtos-destaque",
    secondary_button_text: "Ver Catálogo",
    secondary_button_url: "/produtos",
    bg_theme: "dark_rose",
    is_active: true,
    sort_order: 3,
  },
];
