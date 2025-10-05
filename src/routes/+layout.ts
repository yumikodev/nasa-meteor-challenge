import { loadTranslations } from "$lib/translations";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ url }) => {
  const { pathname } = url;
  let initLocale = "en";

  if (typeof window !== "undefined") {
    const savedLocale = window.localStorage.getItem("locale");
    if (savedLocale) {
      initLocale = savedLocale;
    }
  }

  await loadTranslations(initLocale, pathname);

  return {};
};
