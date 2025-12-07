import { Collection } from "../collections/types";
import {
  boolean,
  integer,
  serial,
  text,
  varchar,
  char,
  numeric,
  decimal,
  json,
  uuid,
  timestamp,
  pgTable,
} from "drizzle-orm/pg-core";
import { FieldKind } from "../fields";

export const DrizzleTypes: Record<FieldKind, () => any> = {
  boolean: () => boolean(),
  integer: () => integer(),
  serial: () => serial(),
  text: () => text(),
  varchar: () => varchar(),
  char: () => char(),
  numeric: () => numeric(),
  decimal: () => decimal(),
  json: () => json(),
  uuid: () => uuid(),
  timestamp: () => timestamp(),
};

export const toDrizzle = (collection: Collection) => {
  return pgTable(
    collection.slug,
    Object.fromEntries(
      Object.entries(collection.fields).map(([name, field]) => {
        const kind = field.type.dsl.kind as FieldKind;
        return [name, DrizzleTypes[kind]()];
      }),
    ),
  );
};
