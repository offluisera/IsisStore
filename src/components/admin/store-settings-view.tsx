"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Store,
  Search,
  Globe,
  Mail,
  Phone,
  Megaphone,
  Truck,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  Sliders,
  Zap,
  Clock,
  FileText,
  Check,
  Gift,
  Copy,
  ArrowRight,
  MessageCircle,
  Tag,
  ImageIcon,
  Upload,
  Loader2,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateStoreSettingsAction,
  uploadStoreAssetAction,
} from "@/features/admin/actions";
import type { StoreSettings } from "@/lib/settings/types";
import type { HomeSlide } from "@/lib/slides/types";
import { HomeSlidesManager } from "@/components/admin/home-slides-manager";
import { BrandFeaturesManager } from "@/components/admin/brand-features-manager";
import { ContactPageManager } from "@/components/admin/institutional/contact-page-manager";
import { TermsPageManager } from "@/components/admin/institutional/terms-page-manager";
import { PrivacyPageManager } from "@/components/admin/institutional/privacy-page-manager";

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

interface StoreSettingsViewProps {
  settings: StoreSettings;
  initialSlides?: HomeSlide[];
}

type TabType =
  | "general"
  | "slides"
  | "features"
  | "editorial"
  | "seo"
  | "contact"
  | "operation"
  | "contact-page"
  | "terms-page"
  | "privacy-page";

export function StoreSettingsView({ settings, initialSlides }: StoreSettingsViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = React.useState<TabType>("general");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType | null;
    if (
      tabParam &&
      [
        "general",
        "slides",
        "features",
        "editorial",
        "seo",
        "contact",
        "operation",
        "contact-page",
        "terms-page",
        "privacy-page",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    } else if (!tabParam && pathname === "/admin/configuracoes") {
      setActiveTab("general");
    }
  }, [searchParams, pathname]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/admin/configuracoes?tab=${tab}`, { scroll: false });
  };

  // Form states
  const [storeName, setStoreName] = React.useState(settings.store_name);
  const [storeTagline, setStoreTagline] = React.useState(settings.store_tagline || "");
  const [storeDescription, setStoreDescription] = React.useState(settings.store_description || "");
  const [logoUrl, setLogoUrl] = React.useState(settings.logo_url || "");
  const [faviconUrl, setFaviconUrl] = React.useState(settings.favicon_url || "");

  // SEO states
  const [metaTitle, setMetaTitle] = React.useState(settings.meta_title || "");
  const [metaDescription, setMetaDescription] = React.useState(settings.meta_description || "");
  const [seoKeywords, setSeoKeywords] = React.useState(settings.seo_keywords || "");
  const [ogImageUrl, setOgImageUrl] = React.useState(settings.og_image_url || "");
  const [canonicalUrl, setCanonicalUrl] = React.useState(settings.canonical_url || "");

  // Contact & Footer states
  const [supportEmail, setSupportEmail] = React.useState(settings.support_email || "");
  const [supportPhone, setSupportPhone] = React.useState(settings.support_phone || "");
  const [instagramHandle, setInstagramHandle] = React.useState(settings.instagram_handle || "");
  const [cnpj, setCnpj] = React.useState(settings.cnpj || "58.123.456/0001-78");
  const [supportHours, setSupportHours] = React.useState(
    settings.support_hours || "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h"
  );
  const [footerText, setFooterText] = React.useState(settings.footer_text || "");

  // Operation states
  const [announcementText, setAnnouncementText] = React.useState(
    settings.announcement_banner_text || ""
  );
  const [announcementActive, setAnnouncementActive] = React.useState(
    settings.announcement_banner_active ?? true
  );
  const [freeShippingReais, setFreeShippingReais] = React.useState(
    (settings.free_shipping_threshold_cents / 100).toFixed(2)
  );
  const [maintenanceMode, setMaintenanceMode] = React.useState(
    settings.maintenance_mode ?? false
  );
  const [maintenanceMessage, setMaintenanceMessage] = React.useState(
    settings.maintenance_message || ""
  );

  // Ofertas do Dia (Daily Deals)
  const [dailyDealsActive, setDailyDealsActive] = React.useState(
    settings.daily_deals_active ?? true
  );
  const [dailyDealsTitle, setDailyDealsTitle] = React.useState(
    settings.daily_deals_title || "Ofertas do dia"
  );
  const [dailyDealsDiscount, setDailyDealsDiscount] = React.useState(
    settings.daily_deals_discount_percent ?? 15
  );
  const [dailyDealsLimit, setDailyDealsLimit] = React.useState(
    settings.daily_deals_product_limit ?? 15
  );
  const [dailyDealsBgColor, setDailyDealsBgColor] = React.useState(
    settings.daily_deals_bg_color || "#D9480F"
  );

  // Banner Editorial de Presentes & Cupom
  const [editorialBannerActive, setEditorialBannerActive] = React.useState(
    settings.editorial_banner_active ?? true
  );
  const [editorialBannerBadge, setEditorialBannerBadge] = React.useState(
    settings.editorial_banner_badge || "Experiência Exclusiva de Compra"
  );
  const [editorialBannerTitle, setEditorialBannerTitle] = React.useState(
    settings.editorial_banner_title || "A Arte de Presentear quem você mais Ama"
  );
  const [editorialBannerDescription, setEditorialBannerDescription] = React.useState(
    settings.editorial_banner_description ||
      "Seja para um aniversário, data marcante ou simplesmente um gesto de carinho, a Isis Store cuida de cada detalhe: personalizamos o cartão de dedicatória e enviamos na embalagem de luxo pronta para encantar."
  );
  const [editorialBannerCouponActive, setEditorialBannerCouponActive] = React.useState(
    settings.editorial_banner_coupon_active ?? true
  );
  const [editorialBannerCouponCode, setEditorialBannerCouponCode] = React.useState(
    settings.editorial_banner_coupon_code || "ISIS10"
  );
  const [editorialBannerCouponText, setEditorialBannerCouponText] = React.useState(
    settings.editorial_banner_coupon_text || "10% OFF em todo o catálogo"
  );
  const [editorialBannerButtonText, setEditorialBannerButtonText] = React.useState(
    settings.editorial_banner_button_text || "Explorar Coleção Completa"
  );
  const [editorialBannerButtonLink, setEditorialBannerButtonLink] = React.useState(
    settings.editorial_banner_button_link || "/produtos"
  );
  const [editorialBannerWhatsappButtonText, setEditorialBannerWhatsappButtonText] = React.useState(
    settings.editorial_banner_whatsapp_button_text || "Personal Shopper no WhatsApp"
  );
  const [editorialBannerImageUrl, setEditorialBannerImageUrl] = React.useState(
    settings.editorial_banner_image_url ||
      "/images/products/colar-coracao-delicado-ouro-rosa.jpg"
  );
  const [editorialBannerImageTag, setEditorialBannerImageTag] = React.useState(
    settings.editorial_banner_image_tag || "Destaque da Coleção"
  );
  const [editorialBannerImageTitle, setEditorialBannerImageTitle] = React.useState(
    settings.editorial_banner_image_title || "Colar Coração Delicado"
  );
  const [editorialBannerImageSubtitle, setEditorialBannerImageSubtitle] = React.useState(
    settings.editorial_banner_image_subtitle || "Banho em Ouro Rosa com Zircônias"
  );
  const [previewCopiedCoupon, setPreviewCopiedCoupon] = React.useState(false);

  const handlePreviewCopyCoupon = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setPreviewCopiedCoupon(true);
      setTimeout(() => setPreviewCopiedCoupon(false), 2000);
    }
  };

  // Upload de Imagem do Computador
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAsset, setIsUploadingAsset] = React.useState(false);
  const [uploadAssetError, setUploadAssetError] = React.useState<string | null>(null);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadAssetError("A imagem selecionada deve ter no máximo 5MB.");
      return;
    }

    setUploadAssetError(null);
    setIsUploadingAsset(true);

    // Pré-visualização instantânea local (DataURL) para UX imediata
    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target?.result as string;
      if (previewUrl) {
        setEditorialBannerImageUrl(previewUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadStoreAssetAction(fd);
      if (res.success && res.url) {
        setEditorialBannerImageUrl(res.url);
        setFeedback({
          type: "success",
          message: "Imagem do computador carregada com sucesso!",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else if (!res.success) {
        setUploadAssetError(res.message || "Erro ao salvar imagem no servidor.");
      }
    } catch {
      setUploadAssetError("Falha de conexão durante o upload da imagem.");
    } finally {
      setIsUploadingAsset(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Upload do Favicon do Computador
  const faviconFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingFavicon, setIsUploadingFavicon] = React.useState(false);
  const [uploadFaviconError, setUploadFaviconError] = React.useState<string | null>(null);

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadFaviconError("O arquivo de favicon deve ter no máximo 5MB.");
      return;
    }

    setUploadFaviconError(null);
    setIsUploadingFavicon(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target?.result as string;
      if (previewUrl) {
        setFaviconUrl(previewUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "favicons");
      const res = await uploadStoreAssetAction(fd);
      if (res.success && res.url) {
        setFaviconUrl(res.url);
        setFeedback({
          type: "success",
          message: "Favicon enviado do computador com sucesso!",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else if (!res.success) {
        setUploadFaviconError(res.message || "Erro ao salvar favicon.");
      }
    } catch {
      setUploadFaviconError("Falha de conexão durante o upload do favicon.");
    } finally {
      setIsUploadingFavicon(false);
      if (faviconFileInputRef.current) {
        faviconFileInputRef.current.value = "";
      }
    }
  };

  // Upload da Logo Principal do Computador
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const [uploadLogoError, setUploadLogoError] = React.useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadLogoError("A imagem da logo deve ter no máximo 5MB.");
      return;
    }

    setUploadLogoError(null);
    setIsUploadingLogo(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target?.result as string;
      if (previewUrl) {
        setLogoUrl(previewUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "brand");
      const res = await uploadStoreAssetAction(fd);
      if (res.success && res.url) {
        setLogoUrl(res.url);
        setFeedback({
          type: "success",
          message: "Logo enviada do computador com sucesso!",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else if (!res.success) {
        setUploadLogoError(res.message || "Erro ao salvar logo.");
      }
    } catch {
      setUploadLogoError("Falha de conexão durante o upload da logo.");
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  // Upload da Imagem Open Graph (SEO) do Computador
  const ogFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingOg, setIsUploadingOg] = React.useState(false);
  const [uploadOgError, setUploadOgError] = React.useState<string | null>(null);

  const handleOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadOgError("A imagem Open Graph deve ter no máximo 5MB.");
      return;
    }

    setUploadOgError(null);
    setIsUploadingOg(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target?.result as string;
      if (previewUrl) {
        setOgImageUrl(previewUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "seo");
      const res = await uploadStoreAssetAction(fd);
      if (res.success && res.url) {
        setOgImageUrl(res.url);
        setFeedback({
          type: "success",
          message: "Imagem Open Graph enviada com sucesso!",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else if (!res.success) {
        setUploadOgError(res.message || "Erro ao salvar imagem Open Graph.");
      }
    } catch {
      setUploadOgError("Falha de conexão durante o upload da imagem Open Graph.");
    } finally {
      setIsUploadingOg(false);
      if (ogFileInputRef.current) {
        ogFileInputRef.current.value = "";
      }
    }
  };

  // Simulação de Carrinho para teste em tempo real do Frete
  const [simulatedCartSubtotal, setSimulatedCartSubtotal] = React.useState<number>(150);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const thresholdCents = Math.round(
      parseFloat(freeShippingReais.replace(",", ".")) * 100
    );

    const formData = new FormData();
    formData.append("store_name", storeName.trim());
    formData.append("store_tagline", storeTagline.trim());
    formData.append("store_description", storeDescription.trim());
    formData.append("logo_url", logoUrl.trim());
    formData.append("favicon_url", faviconUrl.trim());

    formData.append("meta_title", metaTitle.trim());
    formData.append("meta_description", metaDescription.trim());
    formData.append("seo_keywords", seoKeywords.trim());
    formData.append("og_image_url", ogImageUrl.trim());
    formData.append("canonical_url", canonicalUrl.trim());

    formData.append("support_email", supportEmail.trim());
    formData.append("support_phone", supportPhone.trim());
    formData.append("instagram_handle", instagramHandle.trim());
    formData.append("cnpj", cnpj.trim());
    formData.append("support_hours", supportHours.trim());
    formData.append("footer_text", footerText.trim());

    formData.append("announcement_banner_text", announcementText.trim());
    formData.append("announcement_banner_active", String(announcementActive));
    formData.append("free_shipping_threshold_cents", String(thresholdCents || 19900));
    formData.append("maintenance_mode", String(maintenanceMode));
    formData.append("maintenance_message", maintenanceMessage.trim());

    formData.append("daily_deals_active", String(dailyDealsActive));
    formData.append("daily_deals_title", dailyDealsTitle.trim());
    formData.append("daily_deals_discount_percent", String(dailyDealsDiscount || 15));
    formData.append("daily_deals_product_limit", String(dailyDealsLimit || 15));
    formData.append("daily_deals_bg_color", dailyDealsBgColor.trim());

    // Banner Editorial de Presentes & Cupom
    formData.append("editorial_banner_active", String(editorialBannerActive));
    formData.append("editorial_banner_badge", editorialBannerBadge.trim());
    formData.append("editorial_banner_title", editorialBannerTitle.trim());
    formData.append("editorial_banner_description", editorialBannerDescription.trim());
    formData.append("editorial_banner_coupon_active", String(editorialBannerCouponActive));
    formData.append("editorial_banner_coupon_code", editorialBannerCouponCode.trim());
    formData.append("editorial_banner_coupon_text", editorialBannerCouponText.trim());
    formData.append("editorial_banner_button_text", editorialBannerButtonText.trim());
    formData.append("editorial_banner_button_link", editorialBannerButtonLink.trim());
    formData.append("editorial_banner_whatsapp_button_text", editorialBannerWhatsappButtonText.trim());
    formData.append("editorial_banner_image_url", editorialBannerImageUrl.trim());
    formData.append("editorial_banner_image_tag", editorialBannerImageTag.trim());
    formData.append("editorial_banner_image_title", editorialBannerImageTitle.trim());
    formData.append("editorial_banner_image_subtitle", editorialBannerImageSubtitle.trim());

    try {
      const res = await updateStoreSettingsAction(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Configurações da loja atualizadas com sucesso!",
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Erro ao salvar configurações.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Falha de conexão ao comunicar com o servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Previews reativos inteligentes
  const browserTabTitle = React.useMemo(() => {
    const name = storeName.trim() || "Isis Store";
    const tagline = storeTagline.trim();
    return tagline ? `${name} — ${tagline}` : name;
  }, [storeName, storeTagline]);

  const displayDescription =
    metaDescription ||
    storeDescription ||
    "Loja online oficial Isis Store. Moda, acessórios e presentes especiais.";
  const displayFavicon = faviconUrl.trim() || "/favicon-isis.svg";
  const displayLogo = logoUrl.trim() || "/images/logo/logo.jpeg";
  const displayOgImage = ogImageUrl.trim() || "/images/logo/logo.jpeg";

  // Sincronizar texto do anúncio com valor digitado do frete
  const handleSyncAnnouncementWithShipping = () => {
    const val = parseFloat(freeShippingReais.replace(",", ".")) || 0;
    const formatted = val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    setAnnouncementText(`Frete Grátis para todo o Brasil acima de ${formatted}`);
  };

  // Cálculo da simulação de frete grátis
  const parsedThreshold = parseFloat(freeShippingReais.replace(",", ".")) || 0;
  const isSimulatedFreeShipping = simulatedCartSubtotal >= parsedThreshold && parsedThreshold > 0;
  const missingForSimulatedFreeShipping = Math.max(0, parsedThreshold - simulatedCartSubtotal);
  const simulatedProgress = parsedThreshold > 0 ? Math.min(100, (simulatedCartSubtotal / parsedThreshold) * 100) : 100;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header com Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>/</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Configurações Gerais</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] tracking-tight">
            Configurações da Loja
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Gerencie identidade de marca, favicons, SEO, tags de busca, contato e operação comercial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-texto-medio dark:text-[#D4BFC5] bg-fundo dark:bg-[#251A1E] hover:bg-neutral-100 dark:hover:bg-[#2D1F24] rounded-xl border border-borda dark:border-[#38262C] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Loja</span>
            <ExternalLink className="w-3 h-3 text-texto-claro dark:text-[#988087]" />
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 transition-all animate-fade-in shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Tabs de Navegação */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#1C1417] border border-borda dark:border-[#38262C] rounded-2xl overflow-x-auto shadow-2xs">
        <button
          type="button"
          onClick={() => handleTabChange("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "general"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Identidade & Marca</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("slides")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "slides"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Slides da Home</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "slides"
                ? "bg-white text-primaria"
                : "bg-primaria/10 text-primaria"
            }`}
          >
            Carrossel
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("features")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "features"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diferenciais da Loja</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "features"
                ? "bg-white text-primaria"
                : "bg-primaria/10 text-primaria"
            }`}
          >
            Live Preview
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("editorial")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "editorial"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Banner Presentes & Cupom</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "editorial"
                ? "bg-white text-primaria"
                : "bg-primaria/10 text-primaria"
            }`}
          >
            Editorial
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("seo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "seo"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>SEO & Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("contact")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "contact"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Contato & Rodapé (CNPJ)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("operation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "operation"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Avisos & Operação</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("contact-page")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "contact-page"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Pág. Contato</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "contact-page"
                ? "bg-white text-primaria"
                : "bg-primaria/10 text-primaria"
            }`}
          >
            Live Preview
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("terms-page")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "terms-page"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Termos de Uso</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "terms-page"
                ? "bg-white text-primaria"
                : "bg-primaria/10 text-primaria"
            }`}
          >
            CDC
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("privacy-page")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "privacy-page"
              ? "bg-primaria text-white shadow-2xs"
              : "text-texto-medio dark:text-[#C5B0B6] hover:text-texto-escuro dark:hover:text-white hover:bg-fundo dark:hover:bg-[#25181E]"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Privacidade</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "privacy-page"
                ? "bg-white text-primaria"
                : "bg-emerald-500/10 text-emerald-600"
            }`}
          >
            LGPD
          </span>
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === "slides" ? (
        <HomeSlidesManager initialSlides={initialSlides} />
      ) : activeTab === "features" ? (
        <BrandFeaturesManager
          initialBadge={settings.brand_features_badge}
          initialTitle={settings.brand_features_title}
          initialSubtitle={settings.brand_features_subtitle}
          initialCards={settings.brand_features_cards}
          storeName={storeName}
        />
      ) : activeTab === "contact-page" ? (
        <ContactPageManager
          initialSettings={settings.contact_page_settings}
          storeName={storeName}
        />
      ) : activeTab === "terms-page" ? (
        <TermsPageManager
          initialSettings={settings.terms_page_settings}
          storeName={storeName}
        />
      ) : activeTab === "privacy-page" ? (
        <PrivacyPageManager
          initialSettings={settings.privacy_page_settings}
          storeName={storeName}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ABA 1: Identidade & Marca */}
          {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                <Store className="w-4 h-4 text-primaria" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Dados Institucionais da Loja
                </h3>
              </div>

              {/* Nome da Loja */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Nome da Loja <span className="text-primaria">*</span>
                </label>
                <Input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Isis Store"
                  className="bg-white dark:bg-[#151012] font-medium"
                  required
                />
                <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                  Nome exibido no cabeçalho, rodapé, aba do navegador e comunicações.
                </span>
              </div>

              {/* Slogan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Slogan / Subtítulo
                </label>
                <Input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="Ex: Semijoias & Presentes Especiais"
                  className="bg-white dark:bg-[#151012]"
                />
                <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                  Subtítulo exibido abaixo da logo e no título da aba do navegador.
                </span>
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Descrição da Loja
                </label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                  placeholder="Conte um pouco sobre sua marca e diferencial..."
                  className="w-full text-xs p-3 rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:border-primaria focus:ring-1 focus:ring-primaria/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Input ocultos para seleção de arquivo do PC */}
              <input
                ref={faviconFileInputRef}
                type="file"
                accept=".ico,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/png,image/webp,image/jpeg"
                onChange={handleFaviconUpload}
                className="hidden"
              />
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {/* URLs de Favicon e Logo com Upload do PC e Recomendações em Pixel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* Bloco do Favicon */}
                <div className="space-y-2 p-4 rounded-2xl bg-white dark:bg-[#1A1316] border border-borda dark:border-[#38262C]">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      URL do Favicon (.svg, .png, .ico)
                    </label>
                    <span className="text-[10px] font-semibold text-primaria bg-primaria-soft dark:bg-primaria-soft/30 px-2 py-0.5 rounded-full">
                      Recomendado: 32×32px ou 48×48px
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => !isUploadingFavicon && faviconFileInputRef.current?.click()}
                      disabled={isUploadingFavicon}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primaria text-white hover:bg-primaria-hover active:scale-[0.98] transition-all shadow-xs disabled:opacity-60 shrink-0 cursor-pointer"
                    >
                      {isUploadingFavicon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingFavicon ? "Enviando..." : "Upload do PC"}</span>
                    </button>
                    <Input
                      type="text"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="/favicon-isis.svg ou https://..."
                      className="font-mono text-xs bg-white dark:bg-[#151012] flex-1"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setFaviconUrl("/favicon-isis.svg")}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-primaria-soft dark:bg-primaria-soft/30 text-primaria font-semibold hover:bg-primaria/20 transition-colors"
                    >
                      Usar Ícone Isis (SVG)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaviconUrl("/images/logo/logo.jpeg")}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-fundo dark:bg-[#251A1E] text-texto-medio dark:text-[#D4BFC5] font-semibold hover:bg-neutral-200 dark:hover:bg-[#302127] transition-colors border border-borda dark:border-[#38262C]"
                    >
                      Usar Foto Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaviconUrl("/favicon.ico")}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-fundo dark:bg-[#251A1E] text-texto-claro dark:text-[#988087] hover:bg-neutral-200 dark:hover:bg-[#302127] transition-colors border border-borda dark:border-[#38262C]"
                    >
                      Padrão .ico
                    </button>
                  </div>

                  {uploadFaviconError && (
                    <p className="text-[11px] text-red-500 font-medium">{uploadFaviconError}</p>
                  )}

                  {/* Guia de Tamanho em Pixels para Favicon */}
                  <div className="p-2.5 rounded-xl bg-primaria/5 dark:bg-primaria/10 border border-primaria/15 text-[11px] text-texto-medio dark:text-[#D4BFC5] space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-primaria">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Recomendações de Tamanho em Pixel:</span>
                    </div>
                    <ul className="space-y-0.5 text-[10.5px] text-texto-claro dark:text-[#A0888F] leading-relaxed">
                      <li>• <strong>32×32 px</strong> ou <strong>48×48 px</strong>: tamanho padrão para navegadores desktop.</li>
                      <li>• <strong>Formato SVG (.svg)</strong>: nitidez infinita em monitores Retina e telas 4K.</li>
                      <li>• Formatos aceitos: <code>.ico</code>, <code>.svg</code>, <code>.png</code>, <code>.webp</code> (máx. 5MB).</li>
                    </ul>
                  </div>
                </div>

                {/* Bloco da Logo Principal */}
                <div className="space-y-2 p-4 rounded-2xl bg-white dark:bg-[#1A1316] border border-borda dark:border-[#38262C]">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      URL da Logo Principal
                    </label>
                    <span className="text-[10px] font-semibold text-primaria bg-primaria-soft dark:bg-primaria-soft/30 px-2 py-0.5 rounded-full">
                      Recomendado: 512×512px (1:1)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => !isUploadingLogo && logoFileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primaria text-white hover:bg-primaria-hover active:scale-[0.98] transition-all shadow-xs disabled:opacity-60 shrink-0 cursor-pointer"
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingLogo ? "Enviando..." : "Upload do PC"}</span>
                    </button>
                    <Input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="/images/logo/logo.jpeg ou https://..."
                      className="font-mono text-xs bg-white dark:bg-[#151012] flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setLogoUrl("/images/logo/logo.jpeg")}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-fundo dark:bg-[#251A1E] text-texto-medio dark:text-[#D4BFC5] font-semibold hover:bg-neutral-200 dark:hover:bg-[#302127] transition-colors border border-borda dark:border-[#38262C]"
                    >
                      Logo Padrão Isis
                    </button>
                  </div>

                  {uploadLogoError && (
                    <p className="text-[11px] text-red-500 font-medium">{uploadLogoError}</p>
                  )}

                  {/* Guia de Tamanho em Pixels para Logo */}
                  <div className="p-2.5 rounded-xl bg-primaria/5 dark:bg-primaria/10 border border-primaria/15 text-[11px] text-texto-medio dark:text-[#D4BFC5] space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-primaria">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Recomendações de Tamanho em Pixel:</span>
                    </div>
                    <ul className="space-y-0.5 text-[10.5px] text-texto-claro dark:text-[#A0888F] leading-relaxed">
                      <li>• <strong>512×512 px</strong> (Quadrado 1:1): perfeito para o avatar arredondado do topo e rodapé.</li>
                      <li>• <strong>800×300 px</strong> (Horizontal): ideal caso sua marca possua tipografia retangular.</li>
                      <li>• Prefira formato com fundo transparente (<code>.png</code>, <code>.webp</code>, <code>.svg</code>).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel Lateral: Previews de Identidade em Tempo Real */}
            <div className="space-y-6">
              {/* Preview da Aba do Navegador */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primaria" />
                    <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      Preview da Aba do Navegador
                    </h4>
                  </div>
                  <span className="text-[10px] bg-primaria-soft dark:bg-primaria-soft/30 text-primaria font-semibold px-2 py-0.5 rounded-full">
                    Tempo Real
                  </span>
                </div>

                {/* Aba Simulada do Chrome/Edge/Safari */}
                <div className="p-3 bg-neutral-100 dark:bg-[#151012] rounded-2xl border border-borda dark:border-[#38262C] space-y-2.5">
                  <div className="bg-white dark:bg-[#1E1518] rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs border border-borda/60 dark:border-[#38262C]/60">
                    <div className="w-5 h-5 relative shrink-0 overflow-hidden rounded bg-fundo dark:bg-[#251A1E] border border-borda/50 dark:border-[#38262C]/50 flex items-center justify-center">
                      <Image
                        key={displayFavicon}
                        src={displayFavicon}
                        alt="Favicon"
                        width={18}
                        height={18}
                        className="object-contain"
                        unoptimized
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/logo/logo.jpeg";
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-texto-escuro dark:text-[#F8EFF1] truncate max-w-[210px]">
                      {browserTabTitle}
                    </span>
                    <span className="text-neutral-400 dark:text-[#988087] text-xs ml-auto font-sans">✕</span>
                  </div>
                  <div className="text-[11px] text-texto-claro dark:text-[#988087] px-1 break-all flex items-center gap-1.5">
                    <span className="text-texto-medio dark:text-[#D4BFC5] font-semibold">Favicon ativo:</span>
                    <span className="font-mono text-[10px] bg-white dark:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] px-1.5 py-0.5 rounded border border-borda dark:border-[#38262C]">
                      {displayFavicon}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview da Logo */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Preview da Logo no Cabeçalho
                  </h4>
                  <span className="text-[10px] text-texto-claro dark:text-[#988087]">Exibição real</span>
                </div>
                <div className="h-28 bg-fundo dark:bg-[#151012] rounded-2xl flex items-center justify-center p-4 border border-dashed border-borda dark:border-[#38262C] overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-primaria/30 shadow-xs relative shrink-0">
                      <Image
                        key={displayLogo}
                        src={displayLogo}
                        alt={storeName}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/logo/logo.jpeg";
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1] leading-tight">
                        {storeName.trim() || "Isis Store"}
                      </span>
                      <span className="text-[10px] text-texto-claro dark:text-[#988087] tracking-wider uppercase mt-0.5">
                        {storeTagline.trim() || "Tudo o que você ama"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: SEO & Indexação Google */}
        {activeTab === "seo" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                <Search className="w-4 h-4 text-primaria" />
                <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Otimização para Mecanismos de Busca (SEO)
                </h3>
              </div>

              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    Meta Title (Título SEO)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      metaTitle.length > 60 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-texto-claro dark:text-[#988087]"
                    }`}
                  >
                    {metaTitle.length}/60 caracteres recomendados
                  </span>
                </div>
                <Input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Ex: Isis Store — Semijoias Exclusivas & Presentes"
                  className="bg-white dark:bg-[#151012] text-xs"
                />
                <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                  Aparece em destaque na primeira linha azul dos resultados do Google.
                </span>
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    Meta Description (Descrição nos Buscadores)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      metaDescription.length > 160 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-texto-claro dark:text-[#988087]"
                    }`}
                  >
                    {metaDescription.length}/160 caracteres
                  </span>
                </div>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="Ex: Encontre semijoias banhadas a ouro 18k e prata 925 com garantia..."
                  className="w-full text-xs p-3 rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:border-primaria focus:ring-1 focus:ring-primaria/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Palavras-chave / Tags de Busca */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Tags de Busca & Keywords (separadas por vírgula)
                </label>
                <Input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="semijoias, colares femininos, brincos banhados, presentes finos, moda feminina"
                  className="bg-white dark:bg-[#151012] text-xs"
                />
                <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                  Tags utilizadas para alimentar a indexação e pesquisas do catálogo interno.
                </span>
              </div>

              {/* Input oculto para upload de imagem Open Graph */}
              <input
                ref={ogFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleOgUpload}
                className="hidden"
              />

              {/* Imagem de Compartilhamento (Open Graph) e URL Canônica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2 p-4 rounded-2xl bg-white dark:bg-[#1A1316] border border-borda dark:border-[#38262C]">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      URL da Imagem Open Graph (WhatsApp / Facebook)
                    </label>
                    <span className="text-[10px] font-semibold text-primaria bg-primaria-soft dark:bg-primaria-soft/30 px-2 py-0.5 rounded-full">
                      Recomendado: 1200×630px
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => !isUploadingOg && ogFileInputRef.current?.click()}
                      disabled={isUploadingOg}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primaria text-white hover:bg-primaria-hover active:scale-[0.98] transition-all shadow-xs disabled:opacity-60 shrink-0 cursor-pointer"
                    >
                      {isUploadingOg ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingOg ? "Enviando..." : "Upload do PC"}</span>
                    </button>
                    <Input
                      type="text"
                      value={ogImageUrl}
                      onChange={(e) => setOgImageUrl(e.target.value)}
                      placeholder="/images/logo/logo.jpeg ou https://..."
                      className="font-mono text-xs bg-white dark:bg-[#151012] flex-1"
                    />
                  </div>

                  {uploadOgError && (
                    <p className="text-[11px] text-red-500 font-medium">{uploadOgError}</p>
                  )}

                  <div className="p-2.5 rounded-xl bg-primaria/5 dark:bg-primaria/10 border border-primaria/15 text-[10.5px] text-texto-claro dark:text-[#A0888F] space-y-0.5 leading-relaxed">
                    <span className="font-semibold text-primaria block">Recomendação de Tamanho em Pixel:</span>
                    <span>• <strong>1200×630 px</strong> (Proporção 1.91:1 horizontal): padrão oficial para pré-visualização no WhatsApp, Facebook, iMessage e Twitter.</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    URL Canônica da Loja
                  </label>
                  <Input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://isisstore.com.br"
                    className="font-mono text-xs bg-white dark:bg-[#151012]"
                  />
                </div>
              </div>
            </div>

            {/* Painel Lateral: Preview Google SERP */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-borda/60 dark:border-[#38262C]/60">
                  <Search className="w-4 h-4 text-primaria" />
                  <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Preview no Google (SERP)
                  </h4>
                </div>

                <div className="p-4 bg-[#f8f9fa] dark:bg-[#151012] rounded-2xl border border-borda dark:border-[#38262C] space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-white dark:bg-[#1E1518] border border-neutral-300 dark:border-[#38262C] relative flex items-center justify-center">
                      <Image
                        key={displayFavicon}
                        src={displayFavicon}
                        alt="Favicon"
                        width={14}
                        height={14}
                        className="object-contain"
                        unoptimized
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/logo/logo.jpeg";
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#202124] dark:text-[#e8eaed] font-medium leading-none">
                        {storeName || "Isis Store"}
                      </span>
                      <span className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] font-mono leading-none mt-0.5 truncate max-w-[200px]">
                        {canonicalUrl || "https://isisstore.com.br"}
                      </span>
                    </div>
                  </div>

                  <h5 className="text-sm font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-2">
                    {metaTitle || browserTabTitle}
                  </h5>

                  <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3">
                    {displayDescription}
                  </p>
                </div>
              </div>

              {/* Preview Card WhatsApp / Redes Sociais */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-3">
                <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                  Preview de Compartilhamento Social
                </h4>
                <div className="bg-fundo dark:bg-[#151012] rounded-2xl border border-borda dark:border-[#38262C] overflow-hidden shadow-2xs">
                  <div className="h-32 w-full relative bg-neutral-200 dark:bg-[#251A1E]">
                    <Image
                      key={displayOgImage}
                      src={displayOgImage}
                      alt="Open Graph Preview"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/logo/logo.jpeg";
                      }}
                    />
                  </div>
                  <div className="p-3 space-y-1 bg-white dark:bg-[#1E1518]">
                    <span className="text-[10px] uppercase font-mono text-texto-claro dark:text-[#988087] block">
                      isisstore.com.br
                    </span>
                    <h6 className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] truncate">
                      {metaTitle || browserTabTitle}
                    </h6>
                    <p className="text-[11px] text-texto-medio dark:text-[#D4BFC5] line-clamp-2 leading-snug">
                      {displayDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: Contato & Rodapé (CNPJ) */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna Formulário */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Canais de Atendimento */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <Mail className="w-4 h-4 text-primaria" />
                  <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Canais de Atendimento ao Cliente
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* E-mail de Suporte */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primaria" />
                      <span>E-mail de Atendimento</span>
                    </label>
                    <Input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="contato@isisstore.com.br"
                      className="bg-white dark:bg-[#151012] text-xs"
                    />
                  </div>

                  {/* Telefone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Telefone / WhatsApp Comercial</span>
                    </label>
                    <Input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="5517992495308"
                      className="bg-white dark:bg-[#151012] text-xs font-mono"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                      <span>Perfil do Instagram (@usuario)</span>
                    </label>
                    <Input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@isisstoreoficial"
                      className="bg-white dark:bg-[#151012] text-xs"
                    />
                  </div>

                  {/* Horário de Atendimento */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primaria" />
                      <span>Horário de Atendimento da Equipe</span>
                    </label>
                    <Input
                      type="text"
                      value={supportHours}
                      onChange={(e) => setSupportHours(e.target.value)}
                      placeholder="Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h"
                      className="bg-white dark:bg-[#151012] text-xs"
                    />
                    <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                      Exibido na coluna de Atendimento do rodapé da loja.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Dados Fiscais & Rodapé Oficial */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <FileText className="w-4 h-4 text-primaria" />
                  <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Dados Fiscais & Informações do Rodapé (Footer)
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* CNPJ */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1.5">
                      <span>CNPJ da Empresa</span>
                      <span className="text-[10px] text-primaria font-bold bg-primaria-soft dark:bg-primaria-soft/30 px-2 py-0.5 rounded-full">
                        Exibido no Rodapé
                      </span>
                    </label>
                    <Input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="58.123.456/0001-78"
                      className="bg-white dark:bg-[#151012] text-xs font-mono"
                    />
                    <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                      Obrigatoriedade legal do E-commerce (Decreto Federal nº 7.962/2013).
                    </span>
                  </div>

                  {/* Texto Institucional / Endereço do Rodapé */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      Texto Institucional / Endereço da Empresa
                    </label>
                    <textarea
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      rows={3}
                      placeholder="Isis Store — Semijoias, Brinquedos e Presentes Finos. Envio para todo o Brasil."
                      className="w-full text-xs p-3 rounded-xl border border-borda dark:border-[#38262C] focus:border-primaria focus:ring-1 focus:ring-primaria/20 outline-none transition-all resize-none bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1]"
                    />
                    <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                      Frase institucional ou endereço da sede exibido na coluna da marca no rodapé.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Preview: Live Preview do Rodapé */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-4 sticky top-6">
                <div className="flex items-center justify-between pb-2 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primaria" />
                    <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      Preview do Rodapé Oficial (Footer)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-primaria-soft dark:bg-primaria-soft/30 text-primaria px-2 py-0.5 rounded-full font-bold">
                    Ao Vivo
                  </span>
                </div>

                {/* Miniatura do Rodapé */}
                <div className="p-4 bg-fundo-card dark:bg-[#151012] rounded-2xl border border-borda dark:border-[#38262C] space-y-4 text-xs">
                  {/* Topo da Miniatura */}
                  <div className="space-y-2 border-b border-borda/60 dark:border-[#38262C]/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-primaria-border relative shrink-0">
                        <Image
                          src={displayLogo}
                          alt="Logo"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="font-serif font-bold text-texto-escuro dark:text-[#F8EFF1] text-sm">
                        {storeName || "Isis Store"}
                      </span>
                    </div>
                    <p className="text-[11px] text-texto-claro dark:text-[#988087] leading-relaxed line-clamp-2">
                      {storeDescription || "Tudo o que você ama em um só lugar! ♡"}
                    </p>
                    {footerText && (
                      <p className="text-[10px] text-texto-claro dark:text-[#988087] italic border-l-2 border-primaria/40 pl-2">
                        {footerText}
                      </p>
                    )}
                  </div>

                  {/* Atendimento da Miniatura */}
                  <div className="space-y-1.5 text-[11px] border-b border-borda/60 dark:border-[#38262C]/60 pb-3">
                    <span className="font-serif font-bold text-texto-escuro dark:text-[#F8EFF1] block">Atendimento</span>
                    <p className="text-texto-claro dark:text-[#988087] flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-primaria" />
                      <span>{supportHours || "Segunda a Sexta: 09h às 18h"}</span>
                    </p>
                    <p className="text-texto-claro dark:text-[#988087] flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-primaria" />
                      <span className="truncate">{supportEmail || "contato@isisstore.com.br"}</span>
                    </p>
                    <p className="text-texto-claro dark:text-[#988087] flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>WhatsApp: {supportPhone || "(17) 99249-5308"}</span>
                    </p>
                    {instagramHandle && (
                      <p className="text-texto-claro dark:text-[#988087] flex items-center gap-1.5 text-pink-600 dark:text-pink-400">
                        <InstagramIcon className="w-3 h-3" />
                        <span>{instagramHandle}</span>
                      </p>
                    )}
                  </div>

                  {/* Copyright e CNPJ da Miniatura */}
                  <div className="pt-1 text-[10px] text-texto-claro dark:text-[#988087] leading-snug">
                    <p className="font-medium text-texto-escuro dark:text-[#F8EFF1]">
                      © {new Date().getFullYear()} {storeName || "Isis Store"}. Todos os direitos reservados.
                    </p>
                    <p className="font-mono mt-0.5 text-primaria font-bold">
                      CNPJ: {cnpj || "00.000.000/0001-00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: Banner Editorial de Presentes & Cupom */}
        {activeTab === "editorial" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna da Esquerda: Formulários de Configuração (6 colunas) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Card 1: Status & Textos Principais */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                        Banner Editorial de Presentes
                      </h3>
                      <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                        Configurações visuais, chamada e textos de destaque
                      </p>
                    </div>
                  </div>
                  {/* Toggle Ativar/Desativar Banner */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorialBannerActive}
                      onChange={(e) => setEditorialBannerActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 dark:bg-[#251A1E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaria" />
                    <span className="ml-2 text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                      {editorialBannerActive ? "Ativo no Site" : "Desativado"}
                    </span>
                  </label>
                </div>

                {/* Badge Superior */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center justify-between">
                    <span>Badge Superior</span>
                    <span className="text-[10px] text-texto-claro dark:text-[#988087] font-normal">Exibido com ícone de brilho</span>
                  </label>
                  <Input
                    type="text"
                    value={editorialBannerBadge}
                    onChange={(e) => setEditorialBannerBadge(e.target.value)}
                    placeholder="Ex: Experiência Exclusiva de Compra"
                    maxLength={100}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-[#151012]"
                  />
                </div>

                {/* Título */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    Título Principal <span className="text-primaria">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editorialBannerTitle}
                    onChange={(e) => setEditorialBannerTitle(e.target.value)}
                    placeholder="Ex: A Arte de Presentear quem você mais Ama"
                    maxLength={200}
                    className="h-10 text-xs rounded-xl font-medium bg-white dark:bg-[#151012]"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      Descrição do Banner
                    </label>
                    <span className="text-[10px] text-texto-claro dark:text-[#988087]">
                      {editorialBannerDescription.length}/800
                    </span>
                  </div>
                  <textarea
                    value={editorialBannerDescription}
                    onChange={(e) => setEditorialBannerDescription(e.target.value)}
                    rows={4}
                    maxLength={800}
                    placeholder="Escreva a mensagem inspiradora sobre os presentes e embalagens..."
                    className="w-full text-xs p-3 rounded-2xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:outline-none focus:ring-2 focus:ring-primaria/20 focus:border-primaria resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Card 2: Cupom de Boas-Vindas */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                        Cupom de Boas-Vindas
                      </h3>
                      <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                        Exibir ou ocultar cupom promocional neste banner
                      </p>
                    </div>
                  </div>
                  {/* Toggle Ativar/Desativar Cupom */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorialBannerCouponActive}
                      onChange={(e) => setEditorialBannerCouponActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 dark:bg-[#251A1E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaria" />
                    <span className="ml-2 text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                      {editorialBannerCouponActive ? "Cupom Ativo" : "Cupom Oculto"}
                    </span>
                  </label>
                </div>

                {editorialBannerCouponActive && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                        Código do Cupom
                      </label>
                      <Input
                        type="text"
                        value={editorialBannerCouponCode}
                        onChange={(e) => setEditorialBannerCouponCode(e.target.value.toUpperCase())}
                        placeholder="Ex: ISIS10"
                        maxLength={50}
                        className="h-10 text-xs font-mono font-bold tracking-wider rounded-xl uppercase bg-white dark:bg-[#151012]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                        Texto de Desconto
                      </label>
                      <Input
                        type="text"
                        value={editorialBannerCouponText}
                        onChange={(e) => setEditorialBannerCouponText(e.target.value)}
                        placeholder="Ex: 10% OFF em todo o catálogo"
                        maxLength={150}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-[#151012]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Botões de Ação */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      Botões de Ação (CTAs)
                    </h3>
                    <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                      Personalize os textos e links dos botões principal e WhatsApp
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Botão Principal */}
                  <div className="p-4 rounded-2xl bg-fundo dark:bg-[#151012] border border-borda/70 dark:border-[#38262C]/70 space-y-3">
                    <div className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primaria" />
                      Botão Principal (Destaque)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-texto-medio dark:text-[#D4BFC5] block">Texto do Botão</label>
                        <Input
                          type="text"
                          value={editorialBannerButtonText}
                          onChange={(e) => setEditorialBannerButtonText(e.target.value)}
                          placeholder="Ex: Explorar Coleção Completa"
                          maxLength={100}
                          className="h-9 text-xs rounded-xl bg-white dark:bg-[#1E1518]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-texto-medio dark:text-[#D4BFC5] block">Link de Destino</label>
                        <Input
                          type="text"
                          value={editorialBannerButtonLink}
                          onChange={(e) => setEditorialBannerButtonLink(e.target.value)}
                          placeholder="Ex: /produtos ou /categoria/semijoias"
                          maxLength={300}
                          className="h-9 text-xs rounded-xl bg-white dark:bg-[#1E1518] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botão Secundário WhatsApp */}
                  <div className="p-4 rounded-2xl bg-fundo dark:bg-[#151012] border border-borda/70 dark:border-[#38262C]/70 space-y-3">
                    <div className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Botão Secundário (Personal Shopper WhatsApp)
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-texto-medio dark:text-[#D4BFC5] block">Texto do Botão WhatsApp</label>
                      <Input
                        type="text"
                        value={editorialBannerWhatsappButtonText}
                        onChange={(e) => setEditorialBannerWhatsappButtonText(e.target.value)}
                        placeholder="Ex: Personal Shopper no WhatsApp"
                        maxLength={100}
                        className="h-9 text-xs rounded-xl bg-white dark:bg-[#1E1518]"
                      />
                    </div>
                    <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                      O botão abre diretamente uma conversa no número de WhatsApp da loja (
                      <span className="font-mono font-medium text-texto-medio dark:text-[#D4BFC5]">{supportPhone || "5517992495308"}</span>).
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Imagem & Detalhes do Produto */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      Imagem de Destaque
                    </h3>
                    <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                      Carregue uma imagem do seu computador ou escolha do catálogo
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Input de Arquivo Oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  {/* Dropzone de Upload do Computador */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center justify-between">
                      <span>Adicionar Imagem do Computador</span>
                      <span className="text-[10px] text-primaria font-semibold">Upload Direto</span>
                    </label>

                    <div
                      onClick={() => !isUploadingAsset && fileInputRef.current?.click()}
                      className={`relative group border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                        isUploadingAsset
                          ? "bg-primaria/5 border-primaria/40 cursor-wait"
                          : "bg-fundo dark:bg-[#151012] hover:bg-primaria-soft/20 dark:hover:bg-primaria-soft/10 border-borda dark:border-[#38262C] hover:border-primaria"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-primaria/10 text-primaria flex items-center justify-center transition-transform group-hover:scale-110">
                          {isUploadingAsset ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
                            {isUploadingAsset
                              ? "Enviando e otimizando imagem..."
                              : "Clique para escolher uma imagem do seu computador"}
                          </p>
                          <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-0.5">
                            Formatos aceitos: JPG, PNG, WebP ou AVIF até 5MB
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          disabled={isUploadingAsset}
                          className="mt-1 h-8 px-4 text-xs font-semibold rounded-xl gap-1.5 shadow-2xs pointer-events-none"
                        >
                          <HardDrive className="w-3.5 h-3.5" />
                          <span>Selecionar Arquivo</span>
                        </Button>
                      </div>
                    </div>

                    {uploadAssetError && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {uploadAssetError}
                      </p>
                    )}
                  </div>

                  {/* URL da Imagem Atual (editável) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      URL ou Caminho da Imagem
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={editorialBannerImageUrl}
                        onChange={(e) => setEditorialBannerImageUrl(e.target.value)}
                        placeholder="Ex: /images/products/colar-coracao-delicado-ouro-rosa.jpg"
                        className="h-10 text-xs rounded-xl font-mono flex-1 bg-white dark:bg-[#151012]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAsset}
                        className="h-10 px-3 text-xs rounded-xl gap-1.5 shrink-0"
                        title="Trocar por arquivo do computador"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Upload</span>
                      </Button>
                    </div>
                  </div>

                  {/* Atalhos de imagens do catálogo */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                      Ou escolha uma sugestão do catálogo de semijoias:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        {
                          name: "Colar Coração",
                          url: "/images/products/colar-coracao-delicado-ouro-rosa.jpg",
                          tag: "Destaque da Coleção",
                          title: "Colar Coração Delicado",
                          sub: "Banho em Ouro Rosa com Zircônias",
                        },
                        {
                          name: "Brinco Gota",
                          url: "/images/products/brinco-gota-cristal-ouro-18k.jpg",
                          tag: "Mais Vendido",
                          title: "Brinco Gota Cristal",
                          sub: "Banho em Ouro 18k",
                        },
                        {
                          name: "Pulseira Riviera",
                          url: "/images/products/pulseira-riviera-zirconias-prata-925.jpg",
                          tag: "Edição Especial",
                          title: "Pulseira Riviera",
                          sub: "Prata 925 com Zircônias Cúbicas",
                        },
                        {
                          name: "Anel Solitário",
                          url: "/images/products/anel-solitario-classico-ouro-18k.jpg",
                          tag: "Romance & Brilho",
                          title: "Anel Solitário Clássico",
                          sub: "Banho de Ouro 18k com Zircônia",
                        },
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setEditorialBannerImageUrl(item.url);
                            setEditorialBannerImageTag(item.tag);
                            setEditorialBannerImageTitle(item.title);
                            setEditorialBannerImageSubtitle(item.sub);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-fundo dark:bg-[#151012] hover:bg-primaria/10 hover:text-primaria border border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] transition-colors"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-texto-medio dark:text-[#D4BFC5] block">Tag Superior</label>
                      <Input
                        type="text"
                        value={editorialBannerImageTag}
                        onChange={(e) => setEditorialBannerImageTag(e.target.value)}
                        placeholder="Ex: Destaque da Coleção"
                        maxLength={100}
                        className="h-9 text-xs rounded-xl bg-white dark:bg-[#151012]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-texto-medio dark:text-[#D4BFC5] block">Título do Produto</label>
                      <Input
                        type="text"
                        value={editorialBannerImageTitle}
                        onChange={(e) => setEditorialBannerImageTitle(e.target.value)}
                        placeholder="Ex: Colar Coração Delicado"
                        maxLength={150}
                        className="h-9 text-xs rounded-xl font-medium bg-white dark:bg-[#151012]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-texto-medio dark:text-[#D4BFC5] block">Subtítulo / Material</label>
                      <Input
                        type="text"
                        value={editorialBannerImageSubtitle}
                        onChange={(e) => setEditorialBannerImageSubtitle(e.target.value)}
                        placeholder="Ex: Banho em Ouro Rosa"
                        maxLength={200}
                        className="h-9 text-xs rounded-xl bg-white dark:bg-[#151012]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna da Direita: Live Preview em Tempo Real (6 colunas) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white dark:bg-[#1E1518] p-5 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primaria" />
                      <h4 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                        Pré-visualização em Tempo Real (Home)
                      </h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primaria/10 text-primaria">
                      Ao Vivo
                    </span>
                  </div>

                  {!editorialBannerActive && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        <strong>Aviso:</strong> Este banner está marcado como <strong>Desativado</strong> e ficará oculto para os clientes na Home.
                      </span>
                    </div>
                  )}

                  {/* Componente idêntico ao da Home */}
                  <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primaria-soft/40 via-fundo-card to-primaria-soft/20 dark:from-[#251A1E] dark:via-[#1A1114] dark:to-[#22171B] border border-primaria/30 p-6 sm:p-8 shadow-sm transition-all ${!editorialBannerActive ? "opacity-60 saturate-50" : ""}`}>
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
                      <div className="xl:col-span-7 space-y-3.5 text-left">
                        {editorialBannerBadge && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primaria/10 text-primaria text-[11px] font-semibold">
                            <Sparkles className="w-3 h-3" />
                            {editorialBannerBadge}
                          </div>
                        )}

                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] leading-tight">
                          {editorialBannerTitle || "Título do Banner"}
                        </h3>

                        <p className="text-xs text-texto-claro dark:text-[#988087] leading-relaxed line-clamp-4">
                          {editorialBannerDescription || "Descrição do banner configurável..."}
                        </p>

                        {/* Bloco de Cupom */}
                        {editorialBannerCouponActive && (
                          <div className="pt-1 flex flex-wrap items-center gap-2.5">
                            <div className="flex items-center gap-2 bg-fundo dark:bg-[#151012] px-3 py-1.5 rounded-2xl border border-borda-suave dark:border-[#38262C] shadow-2xs">
                              <span className="text-[11px] font-medium text-texto-claro dark:text-[#988087]">Cupom 1ª Compra:</span>
                              <span className="font-mono font-bold text-primaria text-xs sm:text-sm tracking-wider">
                                {editorialBannerCouponCode || "ISIS10"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePreviewCopyCoupon(editorialBannerCouponCode || "ISIS10")}
                                className="ml-1 p-1 rounded-md hover:bg-primaria-soft dark:hover:bg-primaria-soft/20 text-texto-claro dark:text-[#988087] hover:text-primaria transition-colors"
                                title="Copiar cupom (teste)"
                              >
                                {previewCopiedCoupon ? (
                                  <Check className="w-3.5 h-3.5 text-sucesso" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {editorialBannerCouponText && (
                              <span className="text-[11px] text-texto-claro dark:text-[#988087]">
                                {editorialBannerCouponText}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Botões */}
                        <div className="pt-2 flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primaria text-white text-xs font-semibold shadow-xs hover:bg-primaria-dark transition-colors"
                          >
                            <span>{editorialBannerButtonText || "Explorar Coleção"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] text-xs font-medium hover:bg-primaria-soft/30 dark:hover:bg-primaria-soft/10 transition-colors shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{editorialBannerWhatsappButtonText || "Personal Shopper no WhatsApp"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Card de Imagem do Destaque */}
                      <div className="xl:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-[220px] aspect-square rounded-2xl overflow-hidden border border-borda dark:border-[#38262C] shadow-md bg-neutral-100 dark:bg-[#151012]">
                          <Image
                            src={editorialBannerImageUrl || "/images/products/colar-coracao-delicado-ouro-rosa.jpg"}
                            alt={editorialBannerImageTitle || "Imagem de destaque"}
                            fill
                            sizes="220px"
                            className="object-cover"
                            unoptimized={
                              editorialBannerImageUrl?.startsWith("data:") ||
                              editorialBannerImageUrl?.startsWith("blob:")
                            }
                          />
                          {(editorialBannerImageTag ||
                            editorialBannerImageTitle ||
                            editorialBannerImageSubtitle) && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3.5">
                              <div className="text-white space-y-0.5">
                                {editorialBannerImageTag && (
                                  <p className="text-[9px] uppercase tracking-wider text-white/80 font-medium">
                                    {editorialBannerImageTag}
                                  </p>
                                )}
                                {editorialBannerImageTitle && (
                                  <p className="font-serif text-xs font-bold text-white line-clamp-1">
                                    {editorialBannerImageTitle}
                                  </p>
                                )}
                                {editorialBannerImageSubtitle && (
                                  <p className="text-[10px] text-white/90 line-clamp-1">
                                    {editorialBannerImageSubtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-texto-claro dark:text-[#988087] flex items-center justify-between pt-2">
                    <span>Destino do botão: <strong className="font-mono text-texto-medio dark:text-[#D4BFC5]">{editorialBannerButtonLink || "/produtos"}</strong></span>
                    <span>Status: <strong className={editorialBannerActive ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500 dark:text-[#988087]"}>{editorialBannerActive ? "Visível" : "Oculto"}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: Avisos & Operação Comercial */}
        {activeTab === "operation" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna 1: Configurações de Frete e Anúncio */}
            <div className="space-y-6">
              {/* Card de Configuração das Ofertas do Dia */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 fill-orange-600 dark:fill-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                        Ofertas do Dia
                      </h3>
                      <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                        Sorteio diário automático de produtos com desconto promocional na vitrine principal.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={dailyDealsActive}
                      onChange={(e) => setDailyDealsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 dark:bg-[#251A1E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      Título da Faixa Promocional
                    </label>
                    <Input
                      type="text"
                      value={dailyDealsTitle}
                      onChange={(e) => setDailyDealsTitle(e.target.value)}
                      placeholder="Ofertas do dia"
                      className="bg-white dark:bg-[#151012] text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      Desconto Diário (%)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={dailyDealsDiscount}
                        onChange={(e) => setDailyDealsDiscount(Number(e.target.value) || 15)}
                        className="bg-white dark:bg-[#151012] text-xs font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-600 dark:text-orange-400">
                        % OFF
                      </span>
                    </div>
                    <span className="text-[10px] text-texto-claro dark:text-[#988087] block">
                      Desconto aplicado automaticamente aos produtos sorteados do dia.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      Quantidade de Produtos
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={dailyDealsLimit}
                      onChange={(e) => setDailyDealsLimit(Number(e.target.value) || 15)}
                      className="bg-white dark:bg-[#151012] text-xs font-bold"
                    />
                    <span className="text-[10px] text-texto-claro dark:text-[#988087] block">
                      Total de itens sorteados aleatoriamente todo dia (padrão: 15).
                    </span>
                  </div>
                </div>

                {/* Seleção da Cor de Fundo da Faixa */}
                <div className="space-y-2 pt-2 border-t border-borda/40 dark:border-[#38262C]/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      Cor de Fundo da Faixa
                    </label>
                    <span className="text-[10px] font-mono text-texto-claro dark:text-[#988087]">
                      {dailyDealsBgColor || "#D9480F"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { name: "Laranja Fogo", hex: "#D9480F" },
                      { name: "Rosa Isis", hex: "#D6336C" },
                      { name: "Vermelho Rubi", hex: "#C92A2A" },
                      { name: "Roxo Ametista", hex: "#7048E8" },
                      { name: "Preto Ônix", hex: "#1A1A1A" },
                      { name: "Azul Safira", hex: "#1864AB" },
                      { name: "Verde Esmeralda", hex: "#0CA678" },
                    ].map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setDailyDealsBgColor(preset.hex)}
                        className={`w-7 h-7 rounded-xl transition-all flex items-center justify-center border-2 ${
                          (dailyDealsBgColor || "#D9480F").toLowerCase() === preset.hex.toLowerCase()
                            ? "border-texto-escuro dark:border-white scale-110 shadow-xs"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: preset.hex }}
                        title={preset.name}
                      >
                        {(dailyDealsBgColor || "#D9480F").toLowerCase() === preset.hex.toLowerCase() && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="color"
                        value={dailyDealsBgColor || "#D9480F"}
                        onChange={(e) => setDailyDealsBgColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-borda dark:border-[#38262C] cursor-pointer p-0.5 bg-white dark:bg-[#151012]"
                        title="Escolher cor personalizada"
                      />
                      <Input
                        type="text"
                        value={dailyDealsBgColor}
                        onChange={(e) => setDailyDealsBgColor(e.target.value)}
                        placeholder="#D9480F"
                        className="w-24 text-xs font-mono h-7 uppercase bg-white dark:bg-[#151012]"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview em Tempo Real da Faixa de Ofertas */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-texto-claro dark:text-[#988087] block mb-1.5">
                    Preview da Faixa de Destaque
                  </span>
                  <div
                    className="rounded-2xl p-3 text-white flex items-center justify-between shadow-xs transition-colors"
                    style={{
                      backgroundColor: dailyDealsBgColor || "#D9480F",
                      backgroundImage: `linear-gradient(135deg, ${dailyDealsBgColor || "#D9480F"} 0%, rgba(0,0,0,0.18) 100%)`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-white text-white animate-pulse" />
                      <span className="font-bold text-xs">{dailyDealsTitle || "Ofertas do dia"}</span>
                      <span
                        className="bg-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase"
                        style={{ color: dailyDealsBgColor || "#D9480F" }}
                      >
                        até {dailyDealsDiscount}% OFF
                      </span>
                    </div>
                    <span className="text-[10px] bg-black/25 px-2.5 py-1 rounded-lg border border-white/20">
                      Ver todas as ofertas &rarr;
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Aviso Superior */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primaria" />
                    <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      Barra de Avisos Superior (Topo da Loja)
                    </h3>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementActive}
                      onChange={(e) => setAnnouncementActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 dark:bg-[#251A1E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaria"></div>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                      Texto do Comunicado Superior
                    </label>
                    <button
                      type="button"
                      onClick={handleSyncAnnouncementWithShipping}
                      className="text-[11px] text-primaria hover:underline font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sincronizar com Frete</span>
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Ex: Frete Grátis para todo o Brasil acima de R$ 199,00"
                    className="bg-white dark:bg-[#151012] text-xs"
                  />
                  <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                    Mensagem de destaque com ícone que percorre o topo em todas as páginas da loja.
                  </span>
                </div>

                {/* Preview em Tempo Real da Barra Superior */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-texto-claro dark:text-[#988087] block">
                      Preview em Tempo Real do Topo
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        announcementActive
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                          : "bg-neutral-100 dark:bg-[#251A1E] text-neutral-500 dark:text-[#988087] border border-neutral-300 dark:border-[#38262C]"
                      }`}
                    >
                      {announcementActive ? "Visível no Site" : "Oculto no Site"}
                    </span>
                  </div>

                  {announcementActive ? (
                    <div className="bg-fundo dark:bg-[#151012] border border-borda-suave dark:border-[#38262C] rounded-xl p-2.5 text-center text-xs text-texto-medio dark:text-[#D4BFC5] flex items-center justify-center gap-2 shadow-2xs">
                      <Truck className="w-3.5 h-3.5 text-primaria shrink-0" />
                      <span className="font-medium text-[11px] truncate">
                        {announcementText || "Frete Grátis para todo o Brasil acima de R$ 199,00"}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 dark:bg-[#151012] border border-dashed border-neutral-300 dark:border-[#38262C] rounded-xl p-3 text-center text-xs text-neutral-400 dark:text-[#988087]">
                      Barra de anúncio superior desativada (não aparecerá para os clientes)
                    </div>
                  )}
                </div>
              </div>

              {/* Regras Comerciais de Frete & Modo de Manutenção */}
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Regra Oficial de Frete Grátis
                  </h3>
                </div>

                {/* Frete Grátis Threshold */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                    Valor Mínimo para Frete Grátis (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-texto-claro dark:text-[#988087]">
                      R$
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={freeShippingReais}
                      onChange={(e) => setFreeShippingReais(e.target.value)}
                      className="pl-9 bg-white dark:bg-[#151012] text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-texto-claro dark:text-[#988087]">
                    <span>Pedidos com subtotal igual ou maior ganham frete grátis via PAC.</span>
                    <button
                      type="button"
                      onClick={handleSyncAnnouncementWithShipping}
                      className="text-primaria font-semibold hover:underline"
                    >
                      Copiar p/ anúncio
                    </button>
                  </div>
                </div>

                {/* Modo de Manutenção */}
                <div className="pt-4 border-t border-borda dark:border-[#38262C] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-texto-escuro dark:text-[#F8EFF1] block">
                        Modo de Manutenção
                      </span>
                      <span className="text-[11px] text-texto-claro dark:text-[#988087] block">
                        Bloqueia compras temporariamente para atualização da loja
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 dark:bg-[#251A1E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {maintenanceMode && (
                    <div className="space-y-1.5 pt-2 animate-fade-in">
                      <label className="text-xs font-semibold text-amber-900 dark:text-amber-200 block flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Mensagem Exibida aos Clientes</span>
                      </label>
                      <textarea
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        rows={2}
                        placeholder="Estamos preparando novidades incríveis para você. Voltamos em breve!"
                        className="w-full text-xs p-2.5 rounded-xl border border-amber-300 dark:border-amber-600/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna 2: Preview Interativo da Barra de Frete do Carrinho */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E1518] p-6 rounded-3xl border border-borda dark:border-[#38262C] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primaria" />
                    <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      Preview da Barra de Frete no Carrinho
                    </h3>
                  </div>
                  <span className="text-[10px] bg-primaria-soft dark:bg-primaria-soft/30 text-primaria font-semibold px-2 py-0.5 rounded-full">
                    Simulador Interativo
                  </span>
                </div>

                <p className="text-xs text-texto-claro dark:text-[#988087]">
                  Veja exatamente como a barra de progresso se comportará para a cliente dentro da sacola e na página do carrinho conforme ela adiciona produtos:
                </p>

                {/* Seletor de Simulação */}
                <div className="space-y-2 bg-fundo dark:bg-[#151012] p-4 rounded-2xl border border-borda dark:border-[#38262C]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                      Simular valor no carrinho:
                    </span>
                    <span className="font-bold font-mono text-primaria">
                      {simulatedCartSubtotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[50, 120, 199, 250].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSimulatedCartSubtotal(val)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all border ${
                          simulatedCartSubtotal === val
                            ? "bg-primaria text-white border-primaria shadow-2xs"
                            : "bg-white dark:bg-[#251A1E] text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] border-borda dark:border-[#38262C] hover:bg-neutral-50 dark:hover:bg-[#302127]"
                        }`}
                      >
                        R$ {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Componente Simulado da Barra de Frete */}
                <div className="p-4 bg-fundo dark:bg-[#151012] rounded-2xl border border-borda-suave dark:border-[#38262C] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    {isSimulatedFreeShipping ? (
                      <p className="font-semibold text-sucesso flex items-center gap-1.5">
                        🎉 Parabéns! Você ganhou <strong>Frete Grátis</strong>!
                      </p>
                    ) : (
                      <p className="text-texto-medio dark:text-[#D4BFC5]">
                        Faltam apenas{" "}
                        <strong className="text-primaria">
                          {missingForSimulatedFreeShipping.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </strong>{" "}
                        para <strong>Frete Grátis</strong>!
                      </p>
                    )}
                    <span className="text-[10px] font-mono text-texto-claro dark:text-[#988087] font-semibold">
                      {Math.round(simulatedProgress)}%
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="h-2 w-full rounded-full bg-borda dark:bg-[#251A1E] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isSimulatedFreeShipping ? "bg-emerald-500" : "bg-primaria"
                      }`}
                      style={{ width: `${simulatedProgress}%` }}
                    />
                  </div>
                </div>

                {/* Resumo da Regra Vigente */}
                <div className="text-[11px] text-texto-claro dark:text-[#988087] space-y-1 bg-white dark:bg-[#151012] p-3 rounded-xl border border-borda/60 dark:border-[#38262C]/60">
                  <div className="flex items-center justify-between">
                    <span>Regra atual configurada:</span>
                    <strong className="text-texto-escuro dark:text-[#F8EFF1] font-mono">
                      Frete Grátis acima de R$ {freeShippingReais}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Modalidade do Frete Grátis:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">PAC Correios (Brasil)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Gravação Sticky Inferior */}
        <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-sm">
          <div className="text-xs text-texto-claro dark:text-[#988087] hidden sm:block">
            As alterações gravadas serão sincronizadas imediatamente no cabeçalho, carrinho, checkout e SEO da loja.
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            variant="default"
            className="w-full sm:w-auto px-6 font-semibold text-xs gap-1.5 shadow-xs ml-auto"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações da Loja</span>
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
