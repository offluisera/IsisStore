"use client";

import * as React from "react";
import {
  Gem,
  ShieldCheck,
  Gift,
  Award,
  Sparkles,
  Heart,
  Truck,
  Star,
  Crown,
  CheckCircle2,
} from "lucide-react";
import type { FeatureCardIcon } from "@/lib/settings/types";

interface FeatureIconProps {
  name: FeatureCardIcon | string;
  className?: string;
}

export function FeatureIcon({ name, className = "w-6 h-6" }: FeatureIconProps) {
  switch (name) {
    case "gem":
      return <Gem className={className} />;
    case "shield":
      return <ShieldCheck className={className} />;
    case "gift":
      return <Gift className={className} />;
    case "award":
      return <Award className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "heart":
      return <Heart className={className} />;
    case "truck":
      return <Truck className={className} />;
    case "star":
      return <Star className={className} />;
    case "crown":
      return <Crown className={className} />;
    case "check":
      return <CheckCircle2 className={className} />;
    default:
      return <Gem className={className} />;
  }
}

export const AVAILABLE_FEATURE_ICONS: {
  id: FeatureCardIcon;
  label: string;
}[] = [
  { id: "gem", label: "Joia / Gem" },
  { id: "shield", label: "Proteção / Níquel Free" },
  { id: "gift", label: "Presente / Unboxing" },
  { id: "award", label: "Garantia / Selo" },
  { id: "sparkles", label: "Brilho / Especial" },
  { id: "heart", label: "Amor / Afeto" },
  { id: "truck", label: "Entrega / Envio" },
  { id: "star", label: "Estrela / Destaque" },
  { id: "crown", label: "Coroa / Realeza" },
  { id: "check", label: "Qualidade / Verificado" },
];
