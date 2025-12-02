import { describe, expect, it } from "vitest";
import { z } from "zod";
import { field, FieldTypeConfig } from "../../src/fields";

// Exemple de FieldType simple pour les tests
const textFieldType: FieldTypeConfig = {
  schema: z.object({ maxLength: z.number().optional() }),
  dsl: { kind: "text" },
  admin: { component: "TextInput" },
};

describe("field()", () => {
  it("creates a field with default permissions when none provided", async () => {
    const f = field({ type: textFieldType });

    expect(f.type).toBe(textFieldType);
    expect(typeof f.permissions.create).toBe("function");
    expect(await f.permissions.create({})).toBe(true);
    expect(await f.permissions.read({})).toBe(true);
    expect(await f.permissions.update({})).toBe(true);
    expect(await f.permissions.delete({})).toBe(true);
  });

  it("allows partial override of permissions", async () => {
    const f = field({
      type: textFieldType,
      permissions: {
        create: async () => false,
        read: async () => false,
      },
    });

    expect(await f.permissions.create({})).toBe(false);
    expect(await f.permissions.read({})).toBe(false);
    // defaults should still apply
    expect(await f.permissions.update({})).toBe(true);
    expect(await f.permissions.delete({})).toBe(true);
  });

  it("ensures permissions are functions", () => {
    const f = field({
      type: textFieldType,
      permissions: {
        create: async () => true,
      },
    });

    expect(typeof f.permissions.create).toBe("function");
    expect(typeof f.permissions.read).toBe("function");
    expect(typeof f.permissions.update).toBe("function");
    expect(typeof f.permissions.delete).toBe("function");
  });

  it("creates independent field instances", async () => {
    const f1 = field({ type: textFieldType });
    const f2 = field({
      type: textFieldType,
      permissions: { create: async () => false },
    });

    expect(f1).not.toBe(f2);
    expect(await f1.permissions.create({})).toBe(true);
    expect(await f2.permissions.create({})).toBe(false);
  });

  it("works with multiple different field types", async () => {
    const numberFieldType: FieldTypeConfig = {
      schema: z.object({ min: z.number().optional() }),
      dsl: { kind: "number" },
      admin: { component: "NumberInput" },
    };

    const f1 = field({ type: textFieldType });
    const f2 = field({ type: numberFieldType });

    expect(f1.type.dsl.kind).toBe("text");
    expect(f2.type.dsl.kind).toBe("number");
  });
});
