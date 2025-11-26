// tests/fieldType.test.ts
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Ajuste le chemin selon l'emplacement réel de ton implémentation
import { fieldType } from "../../src/fields";

describe("fieldType", () => {
  it("creates a FieldType with validated params", () => {
    const number = fieldType({
      schema: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }),
      dsl: { kind: "number" },
      admin: { component: "NumberInput" },
    });

    const ft = number({ min: 5 });
    expect(ft).toBeTypeOf("object");
    expect(ft.kind).toBe("number");
    expect(ft.params).toEqual({ min: 5 });
    expect(ft.dsl.kind).toBe("number");
    expect(ft.admin.component).toBe("NumberInput");
  });

  it("preserves dsl and admin information exactly", () => {
    const text = fieldType({
      schema: z.object({
        length: z.number().optional(),
      }),
      dsl: { kind: "text", config: { sqlType: "varchar" } },
      admin: { component: "TextInput" },
    });

    const ft = text({ length: 255 });
    expect(ft.dsl).toEqual({ kind: "text", config: { sqlType: "varchar" } });
    expect(ft.admin).toEqual({ component: "TextInput" });
  });

  it("throws when params do not match the Zod schema", () => {
    const number = fieldType({
      schema: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }),
      dsl: { kind: "number" },
      admin: { component: "NumberInput" },
    });

    // invalid: min must be a number
    expect(() => number({ min: "not-a-number" as any })).toThrow();
  });

  it("accepts omitted optional params", () => {
    const toggle = fieldType({
      schema: z.object({
        default: z.boolean().optional(),
      }),
      dsl: { kind: "boolean" },
      admin: { component: "Toggle" },
    });

    const ft = toggle({});
    // params should be an object (Zod will parse to {})
    expect(ft.params).toEqual({});
  });

  it("returns independent FieldType objects for distinct calls", () => {
    const number = fieldType({
      schema: z.object({
        min: z.number().optional(),
      }),
      dsl: { kind: "number" },
      admin: { component: "NumberInput" },
    });

    const a = number({ min: 1 });
    const b = number({ min: 2 });

    expect(a).not.toBe(b); // different references
    expect(a.params).toEqual({ min: 1 });
    expect(b.params).toEqual({ min: 2 });
  });

  it("works with multiple different field types side-by-side", () => {
    const number = fieldType({
      schema: z.object({ min: z.number().optional() }),
      dsl: { kind: "number" },
      admin: { component: "NumberInput" },
    });

    const text = fieldType({
      schema: z.object({ maxLength: z.number().optional() }),
      dsl: { kind: "text" },
      admin: { component: "TextInput" },
    });

    const n = number({ min: 0 });
    const t = text({ maxLength: 100 });

    expect(n.kind).toBe("number");
    expect(n.params).toEqual({ min: 0 });
    expect(t.kind).toBe("text");
    expect(t.params).toEqual({ maxLength: 100 });
  });
});
