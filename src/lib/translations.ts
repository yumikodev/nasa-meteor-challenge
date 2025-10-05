import i18n, { type Config } from "sveltekit-i18n";

const config: Config = {
  loaders: [
    {
      locale: "es",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("../locales/es/main.json")).default,
    },
    {
      locale: "es",
      key: "navbar",
      routes: ["/"],
      loader: async () => (await import("../locales/es/navbar.json")).default,
    },
    {
      locale: "en",
      key: "home",
      routes: ["/"],
      loader: async () => (await import("../locales/en/main.json")).default,
    },
    {
      locale: "en",
      key: "navbar",
      routes: ["/"],
      loader: async () => (await import("../locales/en/navbar.json")).default,
    },
    {
      locale: "es",
      key: "asteroidList",
      routes: ["/"],
      loader: async () => (await import("../locales/es/asteroidList.json")).default,
    },
    {
      locale: "en",
      key: "asteroidList",
      routes: ["/"],
      loader: async () => (await import("../locales/en/asteroidList.json")).default,
    },
    {
      locale: "es",
      key: "footer",
      routes: ["/"],
      loader: async () => (await import("../locales/es/footer.json")).default,
    },
    {
      locale: "en",
      key: "footer",
      routes: ["/"],
      loader: async () => (await import("../locales/en/footer.json")).default,
    },
  ],
};

export const { t, locale, locales, loading, loadTranslations, setLocale } =
  new i18n(config);

// Sincronizar idioma con localStorage
if (typeof window !== "undefined") {
  // Al iniciar, usar localStorage si existe
  const savedLocale = localStorage.getItem("locale");
  if (savedLocale && savedLocale !== locale.get()) {
    setLocale(savedLocale);
  }
  // Guardar cambios de idioma en localStorage
  locale.subscribe((value) => {
    if (value) localStorage.setItem("locale", value);
  });
}
