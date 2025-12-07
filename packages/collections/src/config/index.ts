import { drizzle } from "drizzle-orm/node-postgres";
import { Config } from "./types";
import path from "path";

// Fonction pour charger le schéma généré sans faire planter le build
const loadGeneratedSchema = () => {
  try {
    // 1. Essai via l'alias Webpack/Turbopack (Client/Server Next.js)
    return require("@deesse/schema");
  } catch (e) {
    try {
      // 2. Essai via chemin système (Scripts/Worker)
      return require(path.join(process.cwd(), ".deesse", "shadow", "schema.ts"));
    } catch (e2) {
      // 3. Pas encore généré (Premier boot)
      return {};
    }
  }
};

export const defineConfig = (config: Config) => {
  // Charger le schéma dynamiquement
  const schema = loadGeneratedSchema();

  // Initialiser Drizzle avec le schéma
  const db = drizzle(config.databaseUrl, { 
    schema,
    // logger: true // Décommentez pour debug
  });

  // Attacher la config brute pour que le Worker puisse la lire via Jiti
  Object.defineProperty(db, '_config', {
    value: config,
    enumerable: false,
    writable: false
  });

  // On retourne "any" ici au niveau du runtime de la lib.
  // La vraie magie se passe dans .deesse/types.d.ts qui surcharge ce type
  // pour l'utilisateur final.
  return db as any;
};