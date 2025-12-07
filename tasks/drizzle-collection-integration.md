# Drizzle Collection Integration - Architecture Analysis

## Current State Analysis

### Existing DSL Implementation (Partially Complete)

The project already has a working DSL implementation:

**Core Components:**
- ✅ `collection()` factory in `src/collections/define.ts`
- ✅ `field()` factory in `src/fields/field.ts`
- ✅ Type system with advanced TypeScript
- ✅ Automatic system fields (id, createdAt, updatedAt)
- ✅ Permissions and hooks system
- ✅ Field types: `text()`, `number()`, `uuid()`, `timestamp()`
- ✅ Constraints: `unique()`, `required()`, `optional()`

**Current DSL Usage:**
```typescript
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
  }
});
```

**Runtime Usage:**
```typescript
export const db = defineConfig({
  provider: process.env.DATABASE_URL,
  collections: [Posts]
});
```

### File Structure
```
packages/collections/
├── src/
│   ├── collections/     # DSL definition
│   ├── fields/          # Field types
│   ├── config/          # Runtime configuration
│   ├── database/        # Database operations
│   ├── plugins/         # Plugin system
│   ├── providers/       # Database providers
│   └── utils/           # Utility functions
```

## Architecture Deep Dive

### A. withDeesse Wrapper (Next.js Integration) - TODO

**Objective:** Wrap Next.js config to enable automatic database synchronization during development.

**Technical Questions:**
1. **Environment Detection:** How to detect Next.js development mode reliably?
2. **Worker Spawning:** Use child_process vs worker_threads vs dedicated service?
3. **Integration Point:** Where to hook into Next.js dev server lifecycle?

**Proposed Approach:**
- Create `withDeesse()` function that wraps `next.config.js`
- Detect development mode using `process.env.NODE_ENV === 'development'`
- Spawn independent worker process for file watching and DB sync
- Ensure worker is singleton and only runs in development

**Implementation Considerations:**
- Worker isolation from Next.js webpack compiler
- Graceful shutdown on dev server exit
- Error handling and logging integration

### B. Shadow Schema System - TODO

**Objective:** Generate hidden Drizzle schema files from Collections DSL.

**File Locations:**
- Shadow schema: `/.deesse/shadow/schema.ts`
- Drizzle config: `/.deesse/shadow/drizzle.config.ts`
- Migrations: `/.deesse/drizzle/`

**Technical Requirements:**
1. **Transpilation Engine:** Convert Collections DSL → Drizzle ORM schema
2. **Hidden Directory:** Exclude from git (`.gitignore`)
3. **Dynamic Config:** Generate temporary drizzle.config.ts pointing to shadow schema

**Challenges:**
- Maintaining schema consistency between DSL and Drizzle
- Handling complex field types and relationships
- Error mapping from generated schema back to DSL

### C. Reactive Sync Engine ("Predict & Apply") - TODO

**Workflow Analysis:**

1. **Debounced Watcher:**
   - Watch: `/src/collections/**`
   - Debounce delay: 15 seconds
   - Trigger: User stops typing to avoid partial generation

2. **Shadow Generation:**
   - Read all Collection files
   - Transpile to Drizzle schema at `/.deesse/shadow/schema.ts`
   - Generate ephemeral `drizzle.config.ts`

3. **Prediction (Dry Run):**
   - Execute: `drizzle-kit generate`
   - Target: Temporary folder `/.deesse/tmp_analysis`
   - Output: Migration SQL file with intent

4. **Risk Analysis (The Sentinel):**
   - Parse SQL using regex
   - Classify changes:
     - 🚨 **Destructive:** DROP TABLE, DROP COLUMN, TRUNCATE, incompatible type changes
     - ✅ **Safe:** CREATE TABLE, ADD COLUMN, INDEX

5. **Execution Strategy:**
   - **Safe Change:** Execute `drizzle-kit push --force`
   - **Destructive Change:** Intercept, prompt user, require confirmation

**Technical Implementation Questions:**

**File Watching:**
- Use `chokidar` for robust file watching
- Implement debounce mechanism (15s)
- Handle file system events (add, change, unlink)

**Worker Architecture:**
- Child process vs worker thread decision
- Communication between Next.js and worker
- Error handling and restart logic

**SQL Parsing:**
- Regex approach: simple but may miss edge cases
- SQL parser approach: more robust but heavier dependency
- Need to detect: DROP, TRUNCATE, ALTER COLUMN type changes

**TTY Interaction:**
- Intercept process.stdin in worker
- Clear terminal lines for clean UX
- Display warning box with SQL statements
- Handle user input (y/N)

**drizzle-kit Integration:**
- Execute CLI commands programmatically
- Parse migration SQL output
- Handle drizzle-kit errors and edge cases

### D. Runtime Usage (Current Implementation)

**Current Architecture:**
```typescript
// defineConfig creates typed database object
const db = defineConfig({
  provider: process.env.DATABASE_URL,
  collections: [Posts]
});

// Provides typed methods
db.posts.create(data)
db.posts.read(id)
db.posts.update(id, data)
db.posts.delete(id)
```

**Type Safety:**
- Uses TypeScript mapped types for inference
- No manual type generation required
- Runtime logic converts DSL to Drizzle Table instances

## Technical Challenges & Considerations

### 1. **Worker Isolation**
- Next.js dev server runs webpack compiler
- Sync worker must be independent to avoid conflicts
- Need communication channel between processes
- Graceful shutdown when dev server exits

### 2. **Schema Transpilation**
- Collections DSL → Drizzle ORM is non-trivial
- Need to handle all field types and constraints
- Maintain type information for runtime
- Error reporting from generated code back to DSL

### 3. **Migration Safety**
- drizzle-kit may not detect all destructive changes
- Need robust SQL parsing for risk analysis
- User confirmation flow must be reliable
- Rollback strategy for failed migrations

### 4. **Development Experience**
- Fast feedback loop (15s debounce may be long)
- Clear error messages and warnings
- Integration with Next.js console output
- Minimal configuration required

## Implementation Strategy

### Phase 1: Core Infrastructure
1. Implement `withDeesse()` wrapper
2. Create shadow schema generation
3. Basic file watching and debouncing

### Phase 2: Sync Engine
1. drizzle-kit integration
2. SQL parsing and risk analysis
3. Safe change auto-push
4. Destructive change detection

### Phase 3: UX Polish
1. TTY interaction for confirmations
2. Error handling and logging
3. Performance optimization
4. Documentation and examples

## Dependencies & Tools

**Required:**
- `chokidar` - File watching
- `drizzle-kit` - Database migrations
- `child_process` or `worker_threads` - Worker isolation
- `ansi-escapes` - Terminal manipulation

**Optional:**
- SQL parser library for robust analysis
- Logging library for better DX
- Configuration management for dev/prod

## Next Steps

1. **Decision Points:**
   - Worker architecture (child_process vs worker_threads)
   - SQL parsing approach (regex vs parser)
   - Integration depth with Next.js

2. **Implementation Order:**
   - Start with `withDeesse()` wrapper
   - Build shadow schema generation
   - Implement sync engine
   - Add UX polish

This architecture provides a solid foundation for PayloadCMS-like DX in Next.js while maintaining the power of Drizzle ORM underneath.

## Updated Understanding: Drizzle ORM v1.0.0 Integration

After further clarification, the goal is to integrate with Drizzle ORM v1.0.0-beta and return a standard Drizzle database instance that provides the full `db.query` API.

### Key Changes to Architecture

#### 1. **Runtime Object Transformation**

The `defineConfig` function should:
1. Read Collections DSL definitions
2. Translate them to Drizzle PostgreSQL Core schema (using `drizzle-orm/pg-core`)
3. Generate schema in memory (no physical file needed)
4. Return a Drizzle database instance with the standard API

#### 2. **Target API**

The returned `db` object should provide the standard Drizzle v1.0.0 API:

```typescript
// Standard Drizzle query API
const users = await db.query.users.findMany({
  with: {
    posts: {
      with: {
        comments: true,
      },
    },
  },
});

// Including all features:
// - findMany / findFirst
// - with relations
// - partial select (columns)
// - where filters
// - order by
// - limit/offset
// - custom fields (extras)
// - subqueries
// - prepared statements
```

#### 3. **Schema Translation**

Collections DSL → Drizzle Schema:

```typescript
// Input: Collections DSL
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
  }
});

// Output: Drizzle Schema (in memory)
import * as p from "drizzle-orm/pg-core";

export const posts = p.pgTable("posts", {
  id: p.integer().primaryKey(),
  title: p.text().notNull().unique(),
  content: p.text(),
  createdAt: p.timestamp().notNull(),
  updatedAt: p.timestamp().notNull(),
});

// With relations
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations({ users, posts }, (r) => ({
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  },
  users: {
    posts: r.many.users(),
  },
}));
```

#### 4. **Implementation Approach**

**In-memory Schema Generation:**
- No need to generate physical `.deesse/shadow/schema.ts` files
- Generate Drizzle schema objects directly in memory
- Create Drizzle instance with the generated schema
- Return the instance with full query API

**Benefits:**
- No file system operations needed
- Cleaner architecture
- Direct integration with Drizzle
- Standard API for developers

#### 5. **Updated File Structure**

```
packages/collections/
├── src/
│   ├── collections/     # DSL definition
│   ├── fields/          # Field types
│   ├── config/          # Runtime configuration
│   ├── drizzle/         # DSL → Drizzle translation
│   │   ├── schema.ts    # Generate Drizzle schema
│   │   ├── relations.ts # Generate relations
│   │   └── instance.ts  # Create Drizzle instance
│   ├── database/        # Database operations
│   ├── plugins/         # Plugin system
│   ├── providers/       # Database providers
│   └── utils/           # Utility functions
```

#### 6. **Updated Implementation Strategy**

**Phase 1: Schema Translation**
1. Create DSL → Drizzle schema translator
2. Handle field types conversion
3. Support relations between collections
4. Generate in-memory schema objects

**Phase 2: Drizzle Instance Creation**
1. Create Drizzle instance with generated schema
2. Support all database providers (PostgreSQL, SQLite, MySQL)
3. Return standard `db.query` API

**Phase 3: Sync Engine (Optional)**
1. Shadow schema generation (if needed for migrations)
2. drizzle-kit integration for dev-time sync
3. Risk analysis and user prompts

This approach simplifies the architecture by focusing on in-memory schema generation and direct Drizzle integration, providing developers with the familiar and powerful Drizzle query API.