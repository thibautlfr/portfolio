import { describe, expect, it } from "vitest";

import { locales } from "./locales";
import { uiKeys, useTranslations } from "./ui";

describe("useTranslations", () => {
  it("fills placeholders and leaves unknown ones visible", () => {
    const t = useTranslations("en");
    expect(t("testimonial.translatedFrom", { language: "French" })).toBe(", translated from French");
    expect(t("testimonial.translatedFrom")).toBe(", translated from {language}");
  });

  it("has every key written, with the same placeholders, in every language", () => {
    const english = useTranslations("en");
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    for (const locale of locales) {
      const t = useTranslations(locale);
      for (const key of uiKeys) {
        expect(t(key).trim(), `${locale} ${key}`).not.toBe("");
        expect(placeholders(t(key)), `${locale} ${key}`).toEqual(placeholders(english(key)));
      }
    }
  });
});
