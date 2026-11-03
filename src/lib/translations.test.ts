// Every published entry exists in both languages: an entry added in English only fails here,
// before a French page ships with English text in it.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src/content");
const collections = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory());

const entriesOf = (collection: string) =>
  readdirSync(join(root, collection), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => ({ slug: entry.name, files: readdirSync(join(root, collection, entry.name)) }));

const isDraft = (path: string) => /^draft:\s*true\s*$/m.test(readFileSync(path, "utf8").split("---")[1] ?? "");

describe("translations", () => {
  for (const { name: collection } of collections) {
    for (const { slug, files } of entriesOf(collection)) {
      const english = files.find((file) => /^index\.mdx?$/.test(file));
      const french = files.find((file) => /^index\.fr\.mdx?$/.test(file));

      it(`${collection}/${slug} has an English file`, () => {
        expect(english, "a French file without its English entry is never loaded").toBeDefined();
      });

      if (!english || isDraft(join(root, collection, slug, english))) continue;

      it(`${collection}/${slug} has its French file`, () => {
        expect(french, `add src/content/${collection}/${slug}/index.fr.${english.split(".").pop()}`).toBeDefined();
      });
    }
  }
});
