
// Ce fichier est généré automatiquement par Deesse.
// Il permet d'avoir le typage strict sur db.query.*

import type * as Schema from "./shadow/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Config } from "@deessejs/collections";

declare module "@deessejs/collections" {
  export function defineConfig(config: Config): NodePgDatabase<typeof Schema> & { _config: Config };
}
