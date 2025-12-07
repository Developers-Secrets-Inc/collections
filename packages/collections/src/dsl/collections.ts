import { Collection } from "../collections/types";

export const dsl = (collection: Collection) => {
  const { slug, fields } = collection;

  return {
    slug,
    fields: Object.entries(fields).map(([name, field]) => ({
      name,
      dsl: field.type.dsl,
    })),
  };
};
