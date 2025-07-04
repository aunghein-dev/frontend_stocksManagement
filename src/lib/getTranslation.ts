export type Locale = "en" | "my";

export async function getTranslations(locale: Locale) {
  switch (locale) {
    case "my":
      return (await import("../../locales/my/common.json")).default;
    case "en":
    default:
      return (await import("../../locales/en/common.json")).default;
  }
}
