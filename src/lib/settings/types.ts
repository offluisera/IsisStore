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
  // Configurações das Páginas Institucionais
  contact_page_settings?: ContactPageSettings;
  terms_page_settings?: TermsPageSettings;
  privacy_page_settings?: PrivacyPageSettings;
  updated_at?: string;
}

// --- Tipos & Defaults das Páginas Institucionais ---

export interface ContactFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ContactPageSettings {
  hero_badge: string;
  hero_title: string;
  hero_description: string;
  whatsapp_title: string;
  whatsapp_description: string;
  whatsapp_number: string;
  whatsapp_button_text: string;
  email_title: string;
  email_description: string;
  email_address: string;
  email_button_text: string;
  hours_title: string;
  hours_description: string;
  hours_text: string;
  guarantee_title: string;
  guarantee_description: string;
  guarantee_text: string;
  form_badge: string;
  form_title: string;
  form_description: string;
  faq_badge: string;
  faq_title: string;
  faq_description: string;
  faq_items: ContactFaqItem[];
}

export const DEFAULT_CONTACT_PAGE_SETTINGS: ContactPageSettings = {
  hero_badge: "Estamos Aqui por Você",
  hero_title: "Fale Conosco",
  hero_description:
    "Dúvidas sobre semijoias, medidas, status do seu pedido ou trocas? Nossa equipe está sempre pronta para te acolher e ajudar com todo o carinho.",
  whatsapp_title: "WhatsApp Oficial",
  whatsapp_description: "Atendimento humano e personalizado em tempo real.",
  whatsapp_number: "5517992495308",
  whatsapp_button_text: "Iniciar Conversa",
  email_title: "E-mail de Suporte",
  email_description: "Para dúvidas detalhadas, parcerias ou comprovantes.",
  email_address: "contato@isisstore.com.br",
  email_button_text: "Enviar E-mail",
  hours_title: "Horário de Atendimento",
  hours_description: "Equipe disponível para tirar dúvidas e auxiliar na compra.",
  hours_text: "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h",
  guarantee_title: "Garantia & Trocas",
  guarantee_description: "Segurança total conforme o Código do Consumidor.",
  guarantee_text: "1 Ano de garantia no banho e 7 dias para troca gratuita",
  form_badge: "Envie sua Mensagem",
  form_title: "Como podemos te ajudar hoje?",
  form_description:
    "Preencha o formulário abaixo ou fale diretamente no WhatsApp. Respondemos em até 2 horas em dias úteis.",
  faq_badge: "Dúvidas Frequentes",
  faq_title: "Perguntas Frequentes",
  faq_description:
    "Respostas rápidas para as principais dúvidas sobre pedidos, envios e cuidados.",
  faq_items: [
    {
      id: "1",
      question: "Qual o prazo de envio e código de rastreamento?",
      answer:
        "Seus pedidos são postados em até 1 dia útil após a confirmação do pagamento. O código de rastreio é enviado por e-mail e fica disponível em sua Conta imediatamente.",
    },
    {
      id: "2",
      question: "As semijoias Isis Store possuem garantia?",
      answer:
        "Sim! Todas as nossas peças contam com 1 ano de garantia no banho (ouro 18k e prata 925) e são 100% hipoalergênicas (níquel free).",
    },
    {
      id: "3",
      question: "Como funciona a troca ou devolução?",
      answer:
        "Garantimos 7 dias corridos para devolução ou troca sem nenhum custo adicional a partir da data de entrega, conforme previsto no CDC.",
    },
    {
      id: "4",
      question: "Quais as formas de pagamento disponíveis?",
      answer:
        "Aceitamos Pix com aprovação imediata e cartões de crédito em até 6x sem juros através do Mercado Pago e InfinitePay.",
    },
  ],
};

export interface LegalSectionItem {
  id: string;
  title: string;
  content: string;
  highlight?: string;
}

export interface TermsPageSettings {
  hero_badge: string;
  hero_title: string;
  hero_description: string;
  last_updated_text: string;
  cdc_banner_title: string;
  cdc_banner_text: string;
  sections: LegalSectionItem[];
}

export const DEFAULT_TERMS_PAGE_SETTINGS: TermsPageSettings = {
  hero_badge: "Transparência & Conformidade Legal",
  hero_title: "Termos e Condições de Uso",
  hero_description:
    "Termos e Condições Gerais de Uso e Compra da Isis Store. Políticas de compra, envio, garantia de semijoias e devolução conforme o Código de Defesa do Consumidor.",
  last_updated_text: "Última atualização: Outubro de 2026 • Versão 2.0",
  cdc_banner_title: "Compromisso com o Código de Defesa do Consumidor",
  cdc_banner_text:
    "Todas as relações de compra e venda realizadas na Isis Store são regidas pela Lei Federal nº 8.078/1990 (CDC). Garantimos transparência absoluta em preços, prazos, política de trocas e direito de arrependimento em até 7 dias corridos sem qualquer encargo.",
  sections: [
    {
      id: "aceitacao",
      title: "1. Aceitação e Objeto",
      content:
        "Ao navegar, cadastrar-se ou realizar compras na plataforma digital da Isis Store, o usuário declara ter lido, compreendido e concordado integralmente com estes Termos e Condições Gerais de Uso, bem como com a nossa Política de Privacidade.\n\nEstes termos aplicam-se a todos os visitantes, clientes cadastrados e compradores de semijoias, joias, personalizados e acessórios comercializados em nosso storefront.",
    },
    {
      id: "cadastro",
      title: "2. Cadastro e Segurança da Conta",
      content:
        "Para efetuar pedidos, o usuário pode criar uma conta pessoal ou fornecer os dados necessários durante o fluxo de checkout. Todas as informações cadastrais prestadas (nome, CPF, e-mail, telefone e endereço) devem ser verídicas e atualizadas.\n\nO cliente é o único responsável pela guarda e confidencialidade de sua senha de acesso. Em caso de extravio ou uso indevido suspeito, contate imediatamente nosso suporte.",
    },
    {
      id: "produtos-precos",
      title: "3. Catálogo, Preços e Disponibilidade",
      content:
        "As imagens das semijoias e joias exibidas são fotos reais em alta definição com iluminação controlada. Pequenas variações de tonalidade podem ocorrer devido à calibragem de telas de diferentes smartphones ou monitores.\n\nTodos os preços são expressos em Reais (BRL) e incluem os tributos aplicáveis. Reservamo-nos o direito de corrigir eventuais erros materiais em preços com imediata notificação ao comprador.",
    },
    {
      id: "pagamento-seguranca",
      title: "4. Formas de Pagamento e Antifraude",
      content:
        "Disponibilizamos pagamentos via Pix (com desconto e aprovação imediata) e Cartão de Crédito (com parcelamento). O processamento é realizado por adquirentes e gateways certificados PCI-DSS (Mercado Pago e InfinitePay).\n\nPara segurança de ambas as partes, transações com cartão estão sujeitas à análise cadastral e verificação antifraude automatizada.",
    },
    {
      id: "envio-prazos",
      title: "5. Prazos de Envio e Frete",
      content:
        "Os pedidos são postados em até 1 dia útil após a liquidação do pagamento. O prazo de entrega informado no momento do checkout é calculado diretamente com as transportadoras parceiras (Correios, Jadlog, Loggi).\n\nOferecemos Frete Grátis nas compras que atingirem o valor mínimo estabelecido em nossa política de frete anunciada no topo da loja.",
    },
    {
      id: "trocas-cdc",
      title: "6. Trocas, Devoluções e Direito de Arrependimento (CDC art. 49)",
      content:
        "Conforme o artigo 49 do Código de Defesa do Consumidor, o cliente tem até 7 (sete) dias corridos a contar da entrega para solicitar o cancelamento e a devolução do produto por arrependimento, com reembolso integral e custos de frete reversos arcados pela Isis Store.\n\nA peça deve ser devolvida em sua embalagem original, sem sinais de uso, acompanhada do certificado de garantia.",
      highlight:
        "Artigo 49 do CDC: Devolução grátis em até 7 dias corridos após o recebimento.",
    },
    {
      id: "garantia",
      title: "7. Garantia de Banho e Cuidados com as Peças",
      content:
        "Nossas semijoias possuem 1 (um) ano de garantia no banho de ouro 18k e prata 925 a partir da data de compra, comprovada pelo certificado que acompanha cada envio.\n\nA garantia cobre o desprendimento natural do banho decorrente de defeito de fabricação. Não estão cobertos danos causados por mau uso, quebras mecânicas por impacto, contato com produtos químicos, perfumes ou cloro.",
    },
    {
      id: "propriedade-intelectual",
      title: "8. Propriedade Intelectual e Foro",
      content:
        "Todo o conteúdo do site (marca Isis Store, logotipos, layouts, fotografias, textos e ilustrações) é de propriedade exclusiva e protegido pela legislação de direitos autorais e propriedade industrial.\n\nFica eleito o Foro da Comarca do domicílio do consumidor para dirimir quaisquer controvérsias oriundas destes termos.",
    },
  ],
};

export interface PrivacyPageSettings {
  hero_badge: string;
  hero_title: string;
  hero_description: string;
  last_updated_text: string;
  lgpd_banner_title: string;
  lgpd_banner_text: string;
  dpo_name: string;
  dpo_email: string;
  dpo_role: string;
  sections: LegalSectionItem[];
}

export const DEFAULT_PRIVACY_PAGE_SETTINGS: PrivacyPageSettings = {
  hero_badge: "Conformidade com a LGPD (Lei 13.709/2018)",
  hero_title: "Política de Privacidade & Dados",
  hero_description:
    "Saiba como a Isis Store protege, armazena e respeita seus dados pessoais em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).",
  last_updated_text: "Última atualização: Outubro de 2026 • Versão 2.0",
  lgpd_banner_title: "Sua Privacidade é Sagrada para Nós",
  lgpd_banner_text:
    "Na Isis Store, tratamos suas informações com o mesmo carinho e cuidado que dedicamos à seleção das nossas semijoias. Seus dados nunca são comercializados, alugados ou compartilhados com terceiros para fins publicitários não autorizados.",
  dpo_name: "Encarregado de Proteção de Dados (DPO)",
  dpo_email: "dpo@isisstore.com.br",
  dpo_role: "Canal oficial para atendimento a titulares e solicitações LGPD",
  sections: [
    {
      id: "compromisso",
      title: "1. Nosso Compromisso com a sua Privacidade",
      content:
        "Esta Política de Privacidade descreve com transparência e clareza como a Isis Store coleta, armazena, utiliza e protege os dados pessoais de seus clientes e visitantes, em conformidade integral com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis.",
    },
    {
      id: "dados-coletados",
      title: "2. Dados Pessoais que Coletamos",
      content:
        "Coletamos apenas os dados estritamente necessários para a correta prestação dos nossos serviços de e-commerce:\n\n• Dados Cadastrais: Nome completo, CPF, e-mail, telefone celular e data de nascimento.\n• Dados de Entrega: Endereço completo com CEP para emissão da etiqueta de envio.\n• Dados de Navegação: Endereço IP, registros de acesso, identificadores de sessão e cookies técnicos essenciais.\n• Dados de Pagamento: Processados diretamente em ambiente seguro do gateway (não armazenamos números de cartão no banco de dados).",
    },
    {
      id: "finalidade",
      title: "3. Finalidades do Tratamento e Bases Legais",
      content:
        "O tratamento de seus dados apoia-se em bases legais legítimas:\n\n• Execução de Contrato: Para processar pagamentos, emitir notas fiscais e despachar encomendas.\n• Cumprimento de Obrigação Legal: Manutenção de registros fiscais e contábeis nos termos da legislação.\n• Legítimo Interesse: Prevenção a fraudes e garantia da segurança das contas de usuário.\n• Consentimento: Envio opcional de avisos sobre novas coleções e promoções exclusivas, revogável a qualquer instante.",
    },
    {
      id: "compartilhamento",
      title: "4. Compartilhamento Seguro com Terceiros",
      content:
        "Seus dados são compartilhados exclusivamente com parceiros fundamentais para o ciclo de compra:\n\n• Gateways de Pagamento (Mercado Pago e InfinitePay) para liquidação segura.\n• Operadores Logísticos (Correios e transportadoras integradas) para entrega.\n• Plataformas de infraestrutura de nuvem certificadas com criptografia em repouso e em trânsito.\n\nNunca vendemos nem alugamos suas informações para terceiros.",
    },
    {
      id: "direitos-titular",
      title: "5. Direitos do Titular (Art. 18 da LGPD)",
      content:
        "Você tem o controle absoluto sobre seus dados pessoais. A qualquer momento, você pode solicitar:\n\n• Confirmação e acesso aos dados armazenados;\n• Correção de dados incompletos ou inexatos;\n• Anonimização, bloqueio ou eliminação de dados desnecessários;\n• Portabilidade dos dados;\n• Revogação do consentimento.",
      highlight:
        "Você tem o direito de solicitar a exclusão de seus dados ou revogar o consentimento a qualquer momento.",
    },
    {
      id: "seguranca-armazenamento",
      title: "6. Segurança da Informação e Armazenamento",
      content:
        "Adotamos medidas técnicas e administrativas rigorosas para proteger seus dados contra acessos não autorizados, perdas ou alterações. Utilizamos criptografia TLS 1.3, controle de acesso estrito com Row Level Security (RLS) no banco PostgreSQL e trilha de auditoria para operações administrativas.",
    },
    {
      id: "cookies",
      title: "7. Política de Cookies",
      content:
        "Utilizamos apenas cookies essenciais para manter você conectado à sua conta, preservar os itens do seu carrinho de compras e proteger suas sessões contra ataques do tipo CSRF.",
    },
    {
      id: "canal-dpo",
      title: "8. Canal Oficial do DPO (Encarregado de Dados)",
      content:
        "Para exercer qualquer um dos seus direitos previstos na LGPD ou esclarecer dúvidas sobre o tratamento de seus dados pessoais, entre em contato direto com o nosso Encarregado de Proteção de Dados pelo e-mail dpo@isisstore.com.br.",
    },
  ],
};

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
  contact_page_settings: DEFAULT_CONTACT_PAGE_SETTINGS,
  terms_page_settings: DEFAULT_TERMS_PAGE_SETTINGS,
  privacy_page_settings: DEFAULT_PRIVACY_PAGE_SETTINGS,
};
