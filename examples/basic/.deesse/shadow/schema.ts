
import * as p from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Tables Generated ---

export const posts = p.pgTable("posts", {
  title: p.text(),
  content: p.text(),
  id: p.serial(),
  createdAt: p.timestamp(),
  updatedAt: p.timestamp(),
});

// --- Relations Placeholder ---
// Nécessaire pour que db.query fonctionne, même vide
export const schemaRelations = relations({ posts }, (helpers) => ({
  // TODO: Implémenter la logique de relations basée sur les champs de collection
}));
