# Drizzle Translation System - Internal DSL Architecture

## Overview

This document details the internal DSL representation system and its translation to Drizzle ORM schema. The system allows us to maintain a database-agnostic Collections DSL internally, then translate it to Drizzle ORM when needed for database operations.

## Architecture

### 1. Internal DSL Representation

The Collections DSL maintains an internal representation of each collection that is database-agnostic:

#### 1.1 Collection Structure
```typescript
// Internal DSL Structure
interface InternalCollection {
  slug: string;                    // 'posts'
  name?: string;                   // 'Posts'
  fields: Record<string, InternalField>;
  systemFields: InternalField[];   // id, createdAt, updatedAt
  permissions?: CollectionPermissions;
  hooks?: CollectionHooks;
}

interface InternalField {
  key: string;                     // 'title'
  type: InternalFieldType;         // 'text', 'number', 'uuid', 'timestamp'
  constraints: FieldConstraints;   // unique, required, optional
  params?: FieldParams;            // type-specific parameters
  permissions?: FieldPermissions;
}

type InternalFieldType = 'text' | 'varchar' | 'char' | 'bytea' |
  'numeric' | 'decimal' | 'integer' | 'smallint' | 'bigint' |
  'real' | 'double precision' | 'serial' | 'bigserial' |
  'boolean' | 'date' | 'timestamp' | 'timestamptz' | 'time' | 'timetz' |
  'interval' | 'json' | 'jsonb' | 'uuid' | 'cidr' | 'inet' | 'macaddr' |
  'bit' | 'bit varying' | 'money' | 'point' | 'line' | 'lseg' | 'box' |
  'path' | 'polygon' | 'circle' | 'tsvector' | 'tsquery' | 'pg_lsn' |
  'txid_snapshot' | 'int4range' | 'int8range' | 'numrange' |
  'tsrange' | 'tstzrange' | 'daterange' | 'enum' | 'array' |
  'relation';

interface FieldConstraints {
  unique: boolean;
  required: boolean;
  optional: boolean;
  primaryKey: boolean;
}

interface FieldParams {
  min?: number;
  max?: number;
  relation?: {
    to: string;                    // collection slug
    onDelete?: 'cascade' | 'set null' | 'restrict';
  };
}
```

#### 1.2 Example DSL Representation
```typescript
// Collection DSL Input
export const Posts = collection({
  slug: 'posts',
  fields: {
    title: unique(
      required(
        field({
          type: text({ min: 1, max: 100 }),
        }),
      ),
    ),
    content: field({
      type: text({ min: 1, max: 1000 }),
    }),
    authorId: field({
      type: relation({ to: 'users' }),
    }),
  }
});

// Internal DSL Structure
const internalPosts: InternalCollection = {
  slug: 'posts',
  fields: {
    title: {
      key: 'title',
      type: 'text',
      constraints: {
        unique: true,
        required: true,
        optional: false,
        primaryKey: false,
      },
      params: {
        min: 1,
        max: 100,
      },
    },
    content: {
      key: 'content',
      type: 'text',
      constraints: {
        unique: false,
        required: false,
        optional: true,
        primaryKey: false,
      },
      params: {
        min: 1,
        max: 1000,
      },
    },
    authorId: {
      key: 'authorId',
      type: 'relation',
      constraints: {
        unique: false,
        required: false,
        optional: true,
        primaryKey: false,
      },
      params: {
        relation: {
          to: 'users',
          onDelete: 'cascade',
        },
      },
    },
  },
  systemFields: [
    {
      key: 'id',
      type: 'uuid',
      constraints: {
        unique: false,
        required: true,
        optional: false,
        primaryKey: true,
      },
    },
    {
      key: 'createdAt',
      type: 'timestamp',
      constraints: {
        unique: false,
        required: true,
        optional: false,
        primaryKey: false,
      },
    },
    {
      key: 'updatedAt',
      type: 'timestamp',
      constraints: {
        unique: false,
        required: true,
        optional: false,
        primaryKey: false,
      },
    },
  ],
};
```

### 2. Translation Engine

The translation engine converts the internal DSL to Drizzle ORM schema and relations.

#### 2.1 Schema Translation
```typescript
import * as p from "drizzle-orm/pg-core";

interface DrizzleTranslationResult {
  schema: DrizzleSchema;
  relations: DrizzleRelations;
}

interface DrizzleSchema {
  tables: Record<string, any>;
}

interface DrizzleRelations {
  [collectionSlug: string]: {
    [fieldName: string]: DrizzleRelation;
  };
}

type DrizzleRelation = {
  type: 'one' | 'many';
  from: any;           // Drizzle column reference
  to: any;             // Drizzle column reference
  onDelete?: 'cascade' | 'set null' | 'restrict' | 'no action' | 'set default';
  onUpdate?: 'cascade' | 'set null' | 'restrict' | 'no action' | 'set default';
};

type DrizzleColumnConfig = {
  name?: string;
  length?: number;
  precision?: number;
  scale?: number;
  enumValues?: string[];
  array?: boolean;
  generated?: {
    as: string;
    stored?: boolean;
  };
};

type DrizzleConstraint = {
  primaryKey?: boolean;
  unique?: boolean;
  notNull?: boolean;
  default?: any;
  check?: string;
  references?: {
    table: string;
    column: string;
    onDelete?: 'cascade' | 'set null' | 'restrict' | 'no action' | 'set default';
    onUpdate?: 'cascade' | 'set null' | 'restrict' | 'no action' | 'set default';
  };
};
```

#### 2.2 Translation Functions

**Field Type Translation:**
```typescript
class DrizzleFieldTranslator {
  private static typeMap = {
    text: 'text',
    number: 'integer',
    uuid: 'uuid',
    timestamp: 'timestamp',
  };

  static translateFieldType(
    fieldType: InternalFieldType,
    params?: FieldParams,
  ): any {
    const p = drizzlePgCore;

    switch (fieldType) {
      case 'text':
        return p.text();

      case 'number':
        return p.integer();

      case 'uuid':
        return p.uuid();

      case 'timestamp':
        return p.timestamp();

      case 'relation':
        return p.integer(); // Relations use integer foreign keys

      default:
        throw new Error(`Unknown field type: ${fieldType}`);
    }
  }

  static applyConstraints(
    column: any,
    constraints: FieldConstraints,
  ): any {
    let result = column;

    // Apply constraints in order
    if (constraints.primaryKey) {
      result = result.primaryKey();
    }

    if (constraints.unique) {
      result = result.unique();
    }

    if (!constraints.required) {
      result = result.notNull();
    }

    return result;
  }
}
```

**Table Translation:**
```typescript
class DrizzleTableTranslator {
  static translateCollection(
    collection: InternalCollection,
  ): any {
    const p = drizzlePgCore;
    const tableName = collection.slug;

    // Build columns from fields + system fields
    const columns: Record<string, any> = {};

    // Add system fields first
    for (const systemField of collection.systemFields) {
      const column = DrizzleFieldTranslator.translateFieldType(
        systemField.type,
        systemField.params,
      );

      const constrainedColumn = DrizzleFieldTranslator.applyConstraints(
        column,
        systemField.constraints,
      );

      columns[systemField.key] = constrainedColumn;
    }

    // Add user-defined fields
    for (const [key, field] of Object.entries(collection.fields)) {
      const column = DrizzleFieldTranslator.translateFieldType(
        field.type,
        field.params,
      );

      const constrainedColumn = DrizzleFieldTranslator.applyConstraints(
        column,
        field.constraints,
      );

      columns[key] = constrainedColumn;
    }

    // Create Drizzle table
    return p.pgTable(tableName, columns);
  }
}
```

**Relations Translation:**
```typescript
class DrizzleRelationsTranslator {
  static translateRelations(
    collections: InternalCollection[],
  ): DrizzleRelations {
    const relations: DrizzleRelations = {};

    for (const collection of collections) {
      const collectionRelations: { [key: string]: DrizzleRelation } = {};

      for (const [key, field] of Object.entries(collection.fields)) {
        if (field.type === 'relation' && field.params?.relation) {
          const relationConfig = field.params.relation;

          // Find the target collection
          const targetCollection = collections.find(
            c => c.slug === relationConfig.to,
          );

          if (!targetCollection) {
            throw new Error(`Target collection not found: ${relationConfig.to}`);
          }

          // Determine relation type based on target field
          const targetField = targetCollection.fields[key] ||
                            targetCollection.systemFields.find(f => f.key === key) ||
                            { type: 'uuid' }; // default

          // Create relation definition
          collectionRelations[key] = {
            type: 'one',
            from: `${collection.slug}.${key}`,
            to: `${targetCollection.slug}.id`,
            onDelete: relationConfig.onDelete,
          };

          // Also create reverse many relation on target
          if (!relations[targetCollection.slug]) {
            relations[targetCollection.slug] = {};
          }

          relations[targetCollection.slug][`${collection.slug}List`] = {
            type: 'many',
            from: `${targetCollection.slug}.id`,
            to: `${collection.slug}.${key}`,
          };
        }
      }

      relations[collection.slug] = {
        ...relations[collection.slug],
        ...collectionRelations,
      };
    }

    return relations;
  }
}
```

### 3. Schema Generation Pipeline

#### 3.1 Complete Translation Process
```typescript
class DrizzleSchemaGenerator {
  static generateSchema(
    collections: Collection[],
  ): DrizzleTranslationResult {
    // Step 1: Convert Collections DSL to Internal DSL
    const internalCollections = this.convertToInternalDSL(collections);

    // Step 2: Translate to Drizzle schema
    const drizzleTables = this.translateToDrizzleTables(internalCollections);

    // Step 3: Translate relations
    const drizzleRelations = DrizzleRelationsTranslator.translateRelations(
      internalCollections,
    );

    return {
      schema: {
        tables: drizzleTables,
      },
      relations: drizzleRelations,
    };
  }

  private static convertToInternalDSL(
    collections: Collection[],
  ): InternalCollection[] {
    return collections.map(collection => ({
      slug: collection.slug,
      name: collection.name,
      fields: this.convertFieldsToInternal(collection.fields),
      systemFields: this.generateSystemFields(),
      permissions: collection.permissions,
      hooks: collection.hooks,
    }));
  }

  private static convertFieldsToInternal(
    fields: Record<string, Field>,
  ): Record<string, InternalField> {
    const result: Record<string, InternalField> = {};

    for (const [key, field] of Object.entries(fields)) {
      result[key] = {
        key,
        type: this.extractFieldType(field.type),
        constraints: this.extractConstraints(field.type.dsl),
        params: this.extractFieldParams(field.type.params),
        permissions: field.permissions,
      };
    }

    return result;
  }

  private static generateSystemFields(): InternalField[] {
    return [
      {
        key: 'id',
        type: 'uuid',
        constraints: {
          unique: false,
          required: true,
          optional: false,
          primaryKey: true,
        },
      },
      {
        key: 'createdAt',
        type: 'timestamp',
        constraints: {
          unique: false,
          required: true,
          optional: false,
          primaryKey: false,
        },
      },
      {
        key: 'updatedAt',
        type: 'timestamp',
        constraints: {
          unique: false,
          required: true,
          optional: false,
          primaryKey: false,
        },
      },
    ];
  }

  private static translateToDrizzleTables(
    internalCollections: InternalCollection[],
  ): Record<string, any> {
    const tables: Record<string, any> = {};

    for (const collection of internalCollections) {
      tables[collection.slug] = DrizzleTableTranslator.translateCollection(
        collection,
      );
    }

    return tables;
  }
}
```

#### 3.2 Integration with defineConfig
```typescript
// In config/index.ts
export const defineConfig = <C extends Config>(config: Exact<C, Config>) => {
  // Step 1: Generate Drizzle schema from Collections DSL
  const { schema, relations } = DrizzleSchemaGenerator.generateSchema(
    config.collections,
  );

  // Step 2: Create Drizzle instance with generated schema
  const drizzleInstance = drizzle(
    config.provider.connection,
    {
      schema: schema.tables,
      relations,
    },
  );

  // Step 3: Return standard Drizzle query API
  return drizzleInstance.query;
};
```

### 4. Benefits of Internal DSL Approach

#### 4.1 Database Agnostic
- Collections DSL is independent of database choice
- Can support multiple database providers (PostgreSQL, SQLite, MySQL)
- Easy to add new database backends

#### 4.2 Extensibility
- Easy to add new field types
- Easy to add new constraints
- Easy to extend with custom field parameters

#### 4.3 Type Safety
- Full TypeScript support throughout the pipeline
- Type inference from Collections DSL to Drizzle query API
- Compile-time validation of field types and constraints

#### 4.4 Performance
- Schema generation happens once at initialization
- No runtime overhead during queries
- Direct Drizzle query API for maximum performance

#### 4.5 Maintainability
- Clear separation between DSL and database-specific code
- Easy to debug and test individual translation steps
- Centralized schema generation logic

### 5. Example Translation Flow

#### 5.1 Input: Collections DSL
```typescript
const Posts = collection({
  slug: 'posts',
  fields: {
    title: unique(required(field({ type: text({ min: 1, max: 100 }) }))),
    content: field({ type: text({ min: 1, max: 1000 }) }),
    authorId: field({ type: relation({ to: 'users' }) }),
  },
});

const Users = collection({
  slug: 'users',
  fields: {
    name: required(field({ type: text({ max: 50 }) })),
    email: unique(required(field({ type: text() }))),
  },
});
```

#### 5.2 Internal DSL
```typescript
[
  {
    slug: 'posts',
    fields: {
      title: {
        type: 'text',
        constraints: { unique: true, required: true },
        params: { min: 1, max: 100 },
      },
      content: {
        type: 'text',
        constraints: { unique: false, required: false },
        params: { min: 1, max: 1000 },
      },
      authorId: {
        type: 'relation',
        constraints: { unique: false, required: false },
        params: { relation: { to: 'users' } },
      },
    },
    systemFields: [...],
  },
  {
    slug: 'users',
    fields: {
      name: {
        type: 'text',
        constraints: { unique: false, required: true },
        params: { max: 50 },
      },
      email: {
        type: 'text',
        constraints: { unique: true, required: true },
        params: {},
      },
    },
    systemFields: [...],
  },
]
```

#### 5.3 Generated Drizzle Schema
```typescript
// Schema Tables
{
  posts: pgTable('posts', {
    id: uuid().primaryKey(),
    title: text().notNull().unique(),
    content: text(),
    authorId: integer().notNull(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp().notNull(),
  }),

  users: pgTable('users', {
    id: uuid().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp().notNull(),
  }),
}

// Relations
{
  posts: {
    author: {
      type: 'one',
      from: 'posts.authorId',
      to: 'users.id',
    },
  },
  users: {
    postsList: {
      type: 'many',
      from: 'users.id',
      to: 'posts.authorId',
    },
  },
}
```

#### 5.4 Result: Drizzle Query API
```typescript
const db = defineConfig({
  provider: process.env.DATABASE_URL,
  collections: [Posts, Users],
});

// Standard Drizzle API
const postsWithAuthors = await db.posts.findMany({
  with: {
    author: {
      with: {
        postsList: true,
      },
    },
  },
});
```

### 6. Implementation Considerations

#### 6.1 Error Handling
- Validate field types and constraints during translation
- Provide clear error messages with field and collection context
- Handle circular references in relations

#### 6.2 Performance Optimization
- Cache generated schemas to avoid re-generation
- Use memoization for expensive translation operations
- Lazy-load relations when needed

#### 6.3 Testing Strategy
- Unit tests for each translation function
- Integration tests for complete translation pipeline
- Type checking tests to ensure type safety
- Performance tests for large schema generation

This internal DSL approach provides a clean, maintainable, and extensible way to bridge the gap between the Collections DSL and Drizzle ORM, while maintaining the familiar and powerful Drizzle query API for developers.