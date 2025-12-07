import { createJiti } from "jiti";
import path from "path";
import chokidar from "chokidar";
import fs from "fs";
import { generateShadowSchema } from "../drizzle/generate";

const PROJECT_ROOT = process.cwd();
const CONFIG_PATH = path.join(PROJECT_ROOT, "src", "api", "index.ts");
const COLLECTIONS_DIR = path.join(PROJECT_ROOT, "src", "collections");
const DEESSE_DIR = path.join(PROJECT_ROOT, ".deesse");
const TYPES_PATH = path.join(DEESSE_DIR, "types.d.ts");

/**
 * Charge les alias depuis tsconfig.json pour que jiti puisse résoudre "@/..."
 */
function getTsConfigAliases(root: string) {
  const tsConfigPath = path.join(root, "tsconfig.json");
  if (!fs.existsSync(tsConfigPath)) return {};

  try {
    const tempJiti = createJiti(root, { requireCache: false });
    const loaded = tempJiti(tsConfigPath) as any;
    const tsConfig = loaded.default || loaded;
    const paths = tsConfig?.compilerOptions?.paths;

    if (!paths) return {};

    const aliases: Record<string, string> = {};
    for (const [key, values] of Object.entries(paths)) {
      const value = Array.isArray(values) ? values[0] : (values as string);
      const aliasKey = key.replace("/*", "");
      const aliasValue = String(value).replace("/*", "");
      aliases[aliasKey] = path.resolve(root, aliasValue);
    }
    return aliases;
  } catch (error) {
    console.warn("[Deesse] ⚠️ Failed to load aliases from tsconfig.json", error);
    return {};
  }
}

/**
 * Génère le fichier de définition de types (.d.ts) pour surcharger defineConfig
 */
function generateTypeDefinitions() {
  // On s'assure que le dossier existe
  if (!fs.existsSync(DEESSE_DIR)) {
    fs.mkdirSync(DEESSE_DIR, { recursive: true });
  }

  const typeDefContent = `
// Ce fichier est généré automatiquement par Deesse.
// Il permet d'avoir le typage strict sur db.query.*

import type * as Schema from "./shadow/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Config } from "@deessejs/collections";

declare module "@deessejs/collections" {
  export function defineConfig(config: Config): NodePgDatabase<typeof Schema> & { _config: Config };
}
`;

  fs.writeFileSync(TYPES_PATH, typeDefContent);
}

// Initialisation Jiti
const aliases = getTsConfigAliases(PROJECT_ROOT);
const jiti = createJiti(PROJECT_ROOT, {
  interopDefault: true,
  requireCache: false,
  alias: aliases,
});

async function runGenerator() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return;

    // Charger la config utilisateur
    const mod = await jiti.import(CONFIG_PATH) as any;
    const dbInstance = mod.db || mod.default;

    if (!dbInstance || !dbInstance._config) return;

    const collections = dbInstance._config.collections;

    // 1. Générer le schéma Drizzle (schema.ts)
    generateShadowSchema(collections);

    // 2. Générer les définitions TypeScript (types.d.ts)
    generateTypeDefinitions();

  } catch (error) {
    console.error("[Deesse] ❌ Worker Error:", error);
  }
}

// Lancement
runGenerator();

console.log(`[Deesse] 👀 Watching collections...`);
const watcher = chokidar.watch([CONFIG_PATH, COLLECTIONS_DIR], {
  ignoreInitial: true,
  ignored: /(^|[\/\\])\../,
});

watcher.on("all", () => {
  runGenerator();
});