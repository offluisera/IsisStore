"use client";

import * as React from "react";
import type { StoreSettings } from "./types";
import { DEFAULT_STORE_SETTINGS } from "./types";

export type { StoreSettings };

const StoreSettingsContext = React.createContext<StoreSettings>(DEFAULT_STORE_SETTINGS);

export function StoreSettingsProvider({
  initialSettings,
  children,
}: {
  initialSettings: StoreSettings;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={initialSettings || DEFAULT_STORE_SETTINGS}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings(): StoreSettings {
  const context = React.useContext(StoreSettingsContext);
  return context || DEFAULT_STORE_SETTINGS;
}
