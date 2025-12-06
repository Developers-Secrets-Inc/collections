import z from "zod";
import { fieldType } from "./field";

export const number = fieldType<
  number,
  z.ZodObject<{
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
  }>
>({
  schema: z.object({ min: z.number().optional(), max: z.number().optional() }),
  dsl: { kind: "number" },
  admin: { component: undefined },
});

export const text = fieldType<
  string,
  z.ZodObject<{
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
  }>
>({
  schema: z.object({ min: z.number().optional(), max: z.number().optional() }),
  dsl: { kind: "text" },
  admin: { component: undefined },
});

export const uuid = fieldType<string, z.ZodVoid>({
  schema: z.void(),
  dsl: { kind: "uuid" },
  admin: { component: undefined },
});

export const timestamp = fieldType<string, z.ZodVoid>({
  schema: z.void(),
  dsl: { kind: "timestamp" },
  admin: { component: undefined },
});
