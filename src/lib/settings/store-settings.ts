import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  StoreSettings,
  BrandFeatureCard,
  ContactPageSettings,
  TermsPageSettings,
  PrivacyPageSettings,
} from "./types";
import {
  DEFAULT_STORE_SETTINGS,
  DEFAULT_CONTACT_PAGE_SETTINGS,
  DEFAULT_TERMS_PAGE_SETTINGS,
  DEFAULT_PRIVACY_PAGE_SETTINGS,
} from "./types";

export type {
  StoreSettings,
  BrandFeatureCard,
  ContactPageSettings,
  TermsPageSettings,
  PrivacyPageSettings,
};
export {
  DEFAULT_STORE_SETTINGS,
  DEFAULT_CONTACT_PAGE_SETTINGS,
  DEFAULT_TERMS_PAGE_SETTINGS,
  DEFAULT_PRIVACY_PAGE_SETTINGS,
};

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_STORE_SETTINGS;
    }

    return {
      id: data.id,
      store_name: data.store_name || DEFAULT_STORE_SETTINGS.store_name,
      store_tagline: data.store_tagline || DEFAULT_STORE_SETTINGS.store_tagline,
      store_description:
        data.store_description || DEFAULT_STORE_SETTINGS.store_description,
      logo_url: data.logo_url || DEFAULT_STORE_SETTINGS.logo_url,
      favicon_url: data.favicon_url || DEFAULT_STORE_SETTINGS.favicon_url,
      meta_title: data.meta_title || DEFAULT_STORE_SETTINGS.meta_title,
      meta_description:
        data.meta_description || DEFAULT_STORE_SETTINGS.meta_description,
      seo_keywords: data.seo_keywords || DEFAULT_STORE_SETTINGS.seo_keywords,
      og_image_url: data.og_image_url || DEFAULT_STORE_SETTINGS.og_image_url,
      canonical_url:
        data.canonical_url || DEFAULT_STORE_SETTINGS.canonical_url,
      support_email: data.support_email || DEFAULT_STORE_SETTINGS.support_email,
      support_phone: data.support_phone || DEFAULT_STORE_SETTINGS.support_phone,
      instagram_handle:
        data.instagram_handle || DEFAULT_STORE_SETTINGS.instagram_handle,
      announcement_banner_text:
        data.announcement_banner_text ||
        DEFAULT_STORE_SETTINGS.announcement_banner_text,
      announcement_banner_active:
        data.announcement_banner_active ??
        DEFAULT_STORE_SETTINGS.announcement_banner_active,
      free_shipping_threshold_cents:
        data.free_shipping_threshold_cents ??
        DEFAULT_STORE_SETTINGS.free_shipping_threshold_cents,
      maintenance_mode:
        data.maintenance_mode ?? DEFAULT_STORE_SETTINGS.maintenance_mode,
      maintenance_message:
        data.maintenance_message || DEFAULT_STORE_SETTINGS.maintenance_message,
      brand_features_badge:
        data.brand_features_badge || DEFAULT_STORE_SETTINGS.brand_features_badge,
      brand_features_title:
        data.brand_features_title || DEFAULT_STORE_SETTINGS.brand_features_title,
      brand_features_subtitle:
        data.brand_features_subtitle ||
        DEFAULT_STORE_SETTINGS.brand_features_subtitle,
      brand_features_cards:
        Array.isArray(data.brand_features_cards) &&
        data.brand_features_cards.length > 0
          ? (data.brand_features_cards as unknown as BrandFeatureCard[])
          : DEFAULT_STORE_SETTINGS.brand_features_cards,
      daily_deals_active:
        data.daily_deals_active ?? DEFAULT_STORE_SETTINGS.daily_deals_active,
      daily_deals_discount_percent:
        data.daily_deals_discount_percent ??
        DEFAULT_STORE_SETTINGS.daily_deals_discount_percent,
      daily_deals_product_limit:
        data.daily_deals_product_limit ??
        DEFAULT_STORE_SETTINGS.daily_deals_product_limit,
      daily_deals_title:
        data.daily_deals_title || DEFAULT_STORE_SETTINGS.daily_deals_title,
      daily_deals_bg_color:
        data.daily_deals_bg_color || DEFAULT_STORE_SETTINGS.daily_deals_bg_color,
      cnpj: data.cnpj || DEFAULT_STORE_SETTINGS.cnpj,
      support_hours: data.support_hours || DEFAULT_STORE_SETTINGS.support_hours,
      footer_text: data.footer_text || DEFAULT_STORE_SETTINGS.footer_text,
      editorial_banner_active:
        data.editorial_banner_active ??
        DEFAULT_STORE_SETTINGS.editorial_banner_active,
      editorial_banner_badge:
        data.editorial_banner_badge ||
        DEFAULT_STORE_SETTINGS.editorial_banner_badge,
      editorial_banner_title:
        data.editorial_banner_title ||
        DEFAULT_STORE_SETTINGS.editorial_banner_title,
      editorial_banner_description:
        data.editorial_banner_description ||
        DEFAULT_STORE_SETTINGS.editorial_banner_description,
      editorial_banner_coupon_active:
        data.editorial_banner_coupon_active ??
        DEFAULT_STORE_SETTINGS.editorial_banner_coupon_active,
      editorial_banner_coupon_code:
        data.editorial_banner_coupon_code ||
        DEFAULT_STORE_SETTINGS.editorial_banner_coupon_code,
      editorial_banner_coupon_text:
        data.editorial_banner_coupon_text ||
        DEFAULT_STORE_SETTINGS.editorial_banner_coupon_text,
      editorial_banner_button_text:
        data.editorial_banner_button_text ||
        DEFAULT_STORE_SETTINGS.editorial_banner_button_text,
      editorial_banner_button_link:
        data.editorial_banner_button_link ||
        DEFAULT_STORE_SETTINGS.editorial_banner_button_link,
      editorial_banner_whatsapp_button_text:
        data.editorial_banner_whatsapp_button_text ||
        DEFAULT_STORE_SETTINGS.editorial_banner_whatsapp_button_text,
      editorial_banner_image_url:
        data.editorial_banner_image_url ||
        DEFAULT_STORE_SETTINGS.editorial_banner_image_url,
      editorial_banner_image_tag:
        data.editorial_banner_image_tag ||
        DEFAULT_STORE_SETTINGS.editorial_banner_image_tag,
      editorial_banner_image_title:
        data.editorial_banner_image_title ||
        DEFAULT_STORE_SETTINGS.editorial_banner_image_title,
      editorial_banner_image_subtitle:
        data.editorial_banner_image_subtitle ||
        DEFAULT_STORE_SETTINGS.editorial_banner_image_subtitle,
      contact_page_settings:
        data.contact_page_settings &&
        typeof data.contact_page_settings === "object" &&
        !Array.isArray(data.contact_page_settings)
          ? {
              ...DEFAULT_CONTACT_PAGE_SETTINGS,
              ...(data.contact_page_settings as unknown as Partial<ContactPageSettings>),
            }
          : DEFAULT_CONTACT_PAGE_SETTINGS,
      terms_page_settings:
        data.terms_page_settings &&
        typeof data.terms_page_settings === "object" &&
        !Array.isArray(data.terms_page_settings)
          ? {
              ...DEFAULT_TERMS_PAGE_SETTINGS,
              ...(data.terms_page_settings as unknown as Partial<TermsPageSettings>),
            }
          : DEFAULT_TERMS_PAGE_SETTINGS,
      privacy_page_settings:
        data.privacy_page_settings &&
        typeof data.privacy_page_settings === "object" &&
        !Array.isArray(data.privacy_page_settings)
          ? {
              ...DEFAULT_PRIVACY_PAGE_SETTINGS,
              ...(data.privacy_page_settings as unknown as Partial<PrivacyPageSettings>),
            }
          : DEFAULT_PRIVACY_PAGE_SETTINGS,
      updated_at: data.updated_at,
    };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
});
