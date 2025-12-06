import { Field } from "../fields";
import { Collection } from "./types";

export const extendFields = <
  const Slug extends string,
  const Fields extends Record<string, Field>,
  const NewFields extends Record<string, Field>,
>(
  base: Collection<Slug, Fields>,
  newFields: NewFields,
): Collection<Slug, Fields & NewFields> => {
  return {
    ...base,
    fields: {
      ...base.fields,
      ...newFields,
    },
  } satisfies Collection<Slug, Fields & NewFields>;
};
