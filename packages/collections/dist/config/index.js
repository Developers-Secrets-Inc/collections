"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineConfig = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const path_1 = __importDefault(require("path"));
// Fonction pour charger le schéma généré sans faire planter le build
const loadGeneratedSchema = () => {
    try {
        // 1. Essai via l'alias Webpack/Turbopack (Client/Server Next.js)
        return require("@deesse/schema");
    }
    catch (e) {
        try {
            // 2. Essai via chemin système (Scripts/Worker)
            return require(path_1.default.join(process.cwd(), ".deesse", "shadow", "schema.ts"));
        }
        catch (e2) {
            // 3. Pas encore généré (Premier boot)
            return {};
        }
    }
};
const defineConfig = (config) => {
    // Charger le schéma dynamiquement
    const schema = loadGeneratedSchema();
    // Initialiser Drizzle avec le schéma
    const db = (0, node_postgres_1.drizzle)(config.databaseUrl, {
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
    return db;
};
exports.defineConfig = defineConfig;
