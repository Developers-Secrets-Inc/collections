import z from "zod";
import {
  Field,
  FieldConfig,
  FieldPermissions,
  FieldTypeConfig,
  FieldTypeFinal,
} from "./types";

export const fieldType =
  <TParams extends z.ZodType>(config: FieldTypeConfig<TParams>) =>
  (params: z.infer<TParams>): FieldTypeFinal<TParams> => {
    const validated = config.schema.parse(params);

    return {
      kind: config.dsl.kind,
      params: validated,
      dsl: config.dsl,
      admin: config.admin,
    };
  };

const defaultPermissions: FieldPermissions = {
  create: async () => true,
  read: async () => true,
  update: async () => true,
  delete: async () => true,
};

export const field = <TType extends FieldTypeConfig>(
  config: FieldConfig<TType>,
): Field<TType> => {
  return {
    type: config.type,
    permissions: {
      ...defaultPermissions,
      ...config.permissions,
    },
  };
};
