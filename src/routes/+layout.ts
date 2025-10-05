import { loadTranslations } from "$lib/translations";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ url }) => {
  const { pathname } = url;

  const initLocale = "es";
  await loadTranslations(initLocale, pathname);

  return {};
};
