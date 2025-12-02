import { field, Field, timestamp, uuid } from "../fields";
import { extendFields } from "./extend-fields";
import { Collection } from "./types";

export const collection = <
  const Slug extends string,
  const Fields extends Record<string, Field>,
>(
  config: Collection<Slug, Fields>,
) => {
  return extendFields(config, {
    id: field({ type: uuid() }),
    createdAt: field({ type: timestamp() }),
    updatedAt: field({ type: timestamp() }),
  });
};

