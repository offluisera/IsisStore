"use client";

import * as React from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: {
    id: string;
    public_url: string;
    alt_text: string | null;
  }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails (desktop left, mobile bottom) */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[500px] scrollbar-thin py-1">
          {images.map((img, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={img.id || index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 outline-none",
                  isSelected
                    ? "border-primaria shadow-xs scale-102"
                    : "border-borda hover:border-primaria/50 opacity-70 hover:opacity-100"
                )}
                aria-label={`Visualizar foto ${index + 1} de ${productName}`}
              >
                <Image
                  src={img.public_url}
                  alt={img.alt_text || `${productName} miniatura ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image Display */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl border border-borda bg-fundo-card shadow-xs">
        {activeImage ? (
          <Image
            src={activeImage.public_url}
            alt={activeImage.alt_text || productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover object-center transition-all duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-texto-claro bg-fundo-elevado">
            <ShoppingBag className="h-16 w-16 stroke-1" />
          </div>
        )}
      </div>
    </div>
  );
}
