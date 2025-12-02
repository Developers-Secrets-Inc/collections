import { Field, FieldChain, FieldTypeFinal } from "./types";

export const unique = <TType extends FieldTypeFinal>(
  field: Field<TType>,
): Field<TType> => {
  return {
    ...field,
    type: {
      ...field.type,
      dsl: {
        ...field.type.dsl,
        isUnique: true,
      },
    },
  };
};

export const required = <TType extends FieldTypeFinal>(
  field: Field<TType>,
): Field<TType> => ({
  ...field,
  type: {
    ...field.type,
    dsl: {
      ...field.type.dsl,
      canBeNull: false,
    },
  },
});

export const optional = <TType extends FieldTypeFinal>(
  field: Field<TType>,
): Field<TType> => ({
  ...field,
  type: {
    ...field.type,
    dsl: {
      ...field.type.dsl,
      canBeNull: true,
    },
  },
});

export const attachChain = <TType extends FieldTypeFinal>(
  f: Field<TType>,
): FieldChain<TType> => {
  return {
    ...f,

    unique() {
      return attachChain(unique(f));
    },

    required() {
      return attachChain(required(f));
    },

    optional() {
      return attachChain(optional(f));
    },
  };
};
