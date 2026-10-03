"use client";

import * as React from "react";
import { recordRecentlyViewed } from "@/lib/storage/recently-viewed";

interface ProductViewTrackerProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price_cents: number;
    sale_price_cents?: number | null;
    category_name?: string;
    image_url?: string;
  };
}

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  React.useEffect(() => {
    if (product && product.id) {
      recordRecentlyViewed(product);
    }
  }, [product]);

  return null;
}
