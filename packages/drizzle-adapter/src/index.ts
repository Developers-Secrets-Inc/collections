// dsl-drizzle.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  pgTable,
  serial,
  text,
  AnyPgTable,
  PgColumn,
} from "drizzle-orm/pg-core";

/* ------------------------------------------
   1) Types du DSL
---------------------------------------------*/

export type DSLColumn =
  | { type: "serial"; primary?: boolean; notNull?: boolean }
  | { type: "text"; notNull?: boolean };

export type DSLTables = Record<string, Record<string, DSLColumn>>;

/* ------------------------------------------
   2) Generated types pour un schema typé
---------------------------------------------*/

// Table générée : toutes les colonnes deviennent PgColumn
export type GeneratedTable<TColumns extends Record<string, DSLColumn>> =
  AnyPgTable & {
    [K in keyof TColumns]: PgColumn;
  };

// Schema généré : pour chaque table => table typée
export type GeneratedSchema<T extends DSLTables> = {
  [K in keyof T]: GeneratedTable<T[K]>;
};

/* ------------------------------------------
   3) Mapping DSL type → Drizzle builder
---------------------------------------------*/

const typeMap = {
  serial: (name: string) => serial(name),
  text: (name: string) => text(name),
} as const;

/* ------------------------------------------
   4) Génère une table à partir d’un DSL
---------------------------------------------*/

function generateTable<T extends Record<string, DSLColumn>>(
  tableName: string,
  columns: T
): GeneratedTable<T> {
  const shape: Record<string, any> = {};

  for (const columnName in columns) {
    const col = columns[columnName];

    let c = typeMap[col.type](columnName);

    if (col.notNull) c = c.notNull();
    if ("primary" in col && col.primary) c = c.primaryKey();

    shape[columnName] = c;
  }

  return pgTable(tableName, shape) as GeneratedTable<T>;
}

/* ------------------------------------------
   5) Initialisation de Drizzle depuis le DSL
---------------------------------------------*/

export function initDrizzleFromDSL<T extends DSLTables>(
  dsl: T,
  url: string
): {
  schema: GeneratedSchema<T>;
  db: ReturnType<typeof drizzle<GeneratedSchema<T>>>;
} {
  const schema: Partial<GeneratedSchema<T>> = {};

  for (const tableName in dsl) {
    schema[tableName] = generateTable(
      tableName,
      dsl[tableName]
    ) as any;
  }

  const client = postgres(url);
  const db = drizzle(client, { schema: schema as GeneratedSchema<T> });

  return { schema: schema as GeneratedSchema<T>, db };
}


const dsl = {
  users: {
    id: { type: "serial", primary: true },
    name: { type: "text", notNull: true },
    email: { type: "text" },
  },
  posts: {
    id: { type: "serial", primary: true },
    title: { type: "text", notNull: true },
    content: { type: "text" },
  },
} satisfies DSLTables;

const { db, schema } = initDrizzleFromDSL(dsl, process.env.DATABASE_URL!);

// SELECT
const allUsers = await db.select().from(schema.users);

// INSERT
await db.insert(schema.users).values({
  name: "Alice",
  email: "alice@example.com",
});

// WRONG → TypeScript ERROR
// await db.insert(schema.users).values({ unknown: "..." });

// FULLY typed join
const result = await db
  .select({
    userName: schema.users.name,
    postTitle: schema.posts.title,
  })
  .from(schema.users)
  .leftJoin(schema.posts, schema.users.id.eq(schema.posts.id));

console.log(result);