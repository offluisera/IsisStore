import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { HomeSlide } from "./types";
import { DEFAULT_HOME_SLIDES } from "./types";

export type { HomeSlide };
export { DEFAULT_HOME_SLIDES };

export const getHomeSlides = cache(async (): Promise<HomeSlide[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_HOME_SLIDES;
    }

    return data as unknown as HomeSlide[];
  } catch {
    return DEFAULT_HOME_SLIDES;
  }
});
