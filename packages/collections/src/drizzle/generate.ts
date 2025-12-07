import fs from "fs";
import path from "path";
import { Collection } from "../collections/types";
import { DrizzleTypes } from "."; // Assurez-vous que cet import est correct dans votre structure

const SHADOW_DIR = path.join(process.cwd(), ".deesse", "shadow");
const SCHEMA_PATH = path.join(SHADOW_DIR, "schema.ts");

export const generateShadowSchema = (collections: Collection[]) => {
  fs.mkdirSync(SHADOW_DIR, { recursive: true });

  const tablesCode = collections.map((col) => {
    const columns = Object.entries(col.fields)
      .map(([name, field]) => {
        // @ts-ignore - TODO: typer proprement l'accès au DSL
        const kind = field.type.dsl.kind;
        const drizzleType = Object.keys(DrizzleTypes).includes(kind)
          ? `p.${kind}()` // TODO: Ajouter params (ex: varchar(255))
          : `p.text()`;
        return `  ${name}: ${drizzleType},`;
      })
      .join("\n");

    return `
export const ${col.slug} = p.pgTable("${col.slug}", {
${columns}
});`;
  });

  // On prépare la section relations (vide pour l'instant, mais requise pour db.query)
  // On liste les tables dans l'objet relations
  const tableNames = collections.map(c => c.slug).join(", ");
  
  const schemaFileContent = `
import * as p from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Tables Generated ---
${tablesCode.join("\n")}

// --- Relations Placeholder ---
// Nécessaire pour que db.query fonctionne, même vide
export const schemaRelations = relations({ ${tableNames} }, (helpers) => ({
  // TODO: Implémenter la logique de relations basée sur les champs de collection
}));
`;

  fs.writeFileSync(SCHEMA_PATH, schemaFileContent);
  // console.log("[Deesse] ✅ Schema generated at", SCHEMA_PATH);
};