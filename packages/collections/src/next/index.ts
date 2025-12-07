import { spawn } from "child_process";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";
import path from "path";

declare global {
  var __collections_worker_started: boolean | undefined;
}

export const withCollections = (phase: string, config: NextConfig): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  // 1. Lancement du Worker
  if (isDev && !global.__collections_worker_started) {
    global.__collections_worker_started = true;
    
    // Chemin vers le fichier JS compilé du worker dans node_modules
    const workerPath = path.join(__dirname, "../worker/index.js");

    console.log("[Deesse] Spawning background worker");

    spawn("node", [workerPath], {
      stdio: "inherit",
      env: { ...process.env },
    });
  }

  // Chemin absolu vers le schéma généré
  const shadowSchemaPath = path.join(process.cwd(), ".deesse", "shadow", "schema.ts");

  return {
    ...config,

    // 2. Config Turbopack (Next 16+)
    turbopack: {
      ...(config.turbopack || {}),
      resolveAlias: {
        ...(config.turbopack?.resolveAlias || {}),
        "@deesse/schema": shadowSchemaPath,
      },
    },

    // 3. Config Webpack (Next <16 ou fallback)
    webpack: (webpackConfig, options) => {
      if (typeof config.webpack === "function") {
        webpackConfig = config.webpack(webpackConfig, options);
      }
      
      // Alias pour que require("@deesse/schema") fonctionne dans defineConfig
      webpackConfig.resolve.alias["@deesse/schema"] = shadowSchemaPath;

      return webpackConfig;
    },

    // 4. Empêcher le bundling des dépendances serveur
    serverExternalPackages: [
      ...(config.serverExternalPackages || []),
      "drizzle-orm",
      "drizzle-kit",
      "pg",
      "jiti",
      "@deessejs/collections",
    ],
  };
};