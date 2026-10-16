# prisma — usage docs (source: Context7, fetched 2026-10-16)


## schema.prisma models and relations

### Define complete schema with relations in prisma/schema.prisma

Source: https://github.com/prisma/web/blob/main/apps/blog/content/blog/backend-prisma-typescript-orm-with-postgresql-data-modeling-tsjs1ps7kip1/index.mdx

Defines the full data model in `prisma/schema.prisma` for PostgreSQL, including User, Course, CourseEnrollment, Test, TestResult models, and a UserRole enum. Uses the `name` argument on `@relation` attributes to disambiguate multiple relations pointing to the same User model.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  firstName String
  lastName  String
  social    Json?

  // Relation fields
  courses     CourseEnrollment[]
  testResults TestResult[]       @relation(name: "results")
  testsGraded TestResult[]       @relation(name: "graded")
}

model Course {
  id            Int     @id @default(autoincrement())
  name          String
  courseDetails String?

  // Relation fields
  members CourseEnrollment[]
  tests   Test[]
}

model CourseEnrollment {
  createdAt DateTime @default(now())
  role      UserRole

  // Relation fields
  userId   Int
  courseId Int
  user     User   @relation(fields: [userId], references: [id])
  course   Course @relation(fields: [courseId], references: [id])

  @@id([userId, courseId])
  @@index([userId, role])
}

model Test {
  id        Int      @id @default(autoincrement())
  updatedAt DateTime @updatedAt
  name      String
  date      DateTime

  // Relation fields
  courseId    Int
  course      Course       @relation(fields: [courseId], references: [id])
  testResults TestResult[]
}

model TestResult {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  result    Int // Percentage precise to one decimal point represented as `result * 10^-1`

  // Relation fields
  studentId Int
  student   User @relation(name: "results", fields: [studentId], references: [id])
  graderId  Int
  gradedBy  User @relation(name: "graded", fields: [graderId], references: [id])
  testId    Int
  test      Test @relation(fields: [testId], references: [id])
}

enum UserRole {
  STUDENT
  TEACHER
}
```

--------------------------------

### Add author and recipient relations to User and Kudo models in schema.prisma

Source: https://github.com/prisma/web/blob/main/apps/blog/content/blog/fullstack-remix-prisma-mongodb-3-By5pmN5Nzo1v/index.mdx

Adds 1:n relations connecting User to Kudo as both author and recipient. After saving these changes, execute npx prisma db push to sync the database and regenerate PrismaClient.

```prisma
diff // prisma/schema.prisma

model User {
  // ...
+  authoredKudos Kudo[]  @relation("AuthoredKudos")
+  kudos         Kudo[]  @relation("RecievedKudos")
}

model Kudo {
  // ...
+  author      User       @relation(references: [id], fields: [authorId], "AuthoredKudos")
+  authorId    String     @db.ObjectId
+  recipient   User       @relation(references: [id], fields: [recipientId], "RecievedKudos")
+  recipientId String     @db.ObjectId
}
```

--------------------------------

### Define a one-to-one relation in Prisma schema

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/orm/data-modeling/relational-databases.mdx

Models a 1:1 relation between User and Profile by placing a `@unique` attribute on the foreign key field (`userId`). The `@relation` attribute is defined on the dependent model (`Profile`).

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  userId Int    @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

--------------------------------

### Define implicit many-to-many relation in Prisma schema

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/guides/upgrade-prisma-orm/v6.mdx

Example data model showing an implicit many-to-many relation between Post and Tag models.

```prisma
model Post {
  id         Int    @id @default(autoincrement())
  title      String
  categories Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}
```

--------------------------------

### Multi-Tenant Membership Join Table — @@unique and @@index Pattern

Source: https://github.com/prisma/web/blob/main/apps/blog/content/blog/prisma-schema-as-llm-context/index.mdx

Canonical join table model for multi-tenant SaaS apps. Shows `@@unique([userId, organizationId])` to prevent duplicate memberships, `@@index([organizationId])` to optimize tenant-scoped lookups, `@map("user_id")` for snake_case column naming, and `onDelete: Cascade` on both relations.

```prisma
model Membership {
  id             String       @id @default(uuid())
  role           Role         @default(MEMBER)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String       @map("user_id")
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String       @map("organization_id")

  @@unique([userId, organizationId])
  @@index([organizationId])
  @@map("memberships")
}
```


## Prisma Client CRUD queries

### Test CRUD Operations

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/guides/upgrade-prisma-orm/v1.mdx

Tests create, read, update, and delete queries using Prisma Client to verify data operations and consistency.

```typescript
// Test create
const user = await prisma.user.create({
  data: { name: 'Test', email: 'test@example.com' }
});

// Test read
const foundUser = await prisma.user.findUnique({
  where: { id: user.id }
});

// Test update
const updatedUser = await prisma.user.update({
  where: { id: user.id },
  data: { name: 'Updated Name' }
});

// Test delete
await prisma.user.delete({
  where: { id: user.id }
});
```

--------------------------------

### Perform basic CRUD operations in Prisma ORM v6

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/guides/upgrade-prisma-orm/mongodb.mdx

Prisma ORM v6 CRUD operations use single options objects passed directly to client model methods.

```typescript
import { prisma } from './db';

// Find one
await prisma.user.findFirst({ where: { email } });

// Create
const user = await prisma.user.create({ data: { email, role: 'author' } });

// Update one
await prisma.user.update({ where: { id }, data: { role: 'author' } });

// Update many
await prisma.user.updateMany({ where: { role: 'reader' }, data: { role: 'author' } });

// Delete one
await prisma.user.delete({ where: { id } });
```

--------------------------------

### Execute queries in Prisma ORM

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/guides/switch-to-prisma-orm/from-sql-orms.mdx

Shows rewritten CRUD operations, relations, aggregations, and transactions using Prisma ORM.

```typescript
import { db } from "./prisma/db.ts";

// Create
const carol = await db.orm.public.User.create({ email: "carol@prisma.io", name: "Carol" });
console.log("created", carol);

// Transaction
const result = await db.transaction(async (tx) => {
  const dave = await tx.orm.public.User.create({ email: "dave@prisma.io", name: "Dave" });
  const post = await tx.orm.public.Post.create({ title: "Hello from Prisma 8", authorId: dave.id });
  return { dave, post };
});
console.log("transaction", result);

// Find many
const users = await db.orm.public.User
  .where({ active: true })
  .orderBy((u) => u.createdAt.desc())
  .limit(10)
  .all();
console.log("users", users);

// Find one with relation
const bobWithPosts = await db.orm.public.User
  .where({ email: "bob@prisma.io" })
  .include("posts")
  .first();
console.log("bobWithPosts", bobWithPosts);

// Update
const updated = await db.orm.public.User.where({ id: carol.id }).update({ name: "Caroline" });
console.log("updated", updated);

// Delete
const deleted = await db.orm.public.User.where({ id: carol.id }).delete();
console.log("deleted", deleted);

const totals = await db.orm.public.User.aggregate((a) => ({ users: a.count() }));
console.log("totals", totals);
await db.close();
```

--------------------------------

### Perform basic CRUD operations in Prisma ORM 8

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/guides/upgrade-prisma-orm/mongodb.mdx

Prisma ORM 8 uses a chained API starting from a collection (addressed by storage name) followed by filters and query execution methods. Every mutation except create requires a .where() filter first.

```typescript
import { db } from './db';

// Find one
await db.orm.users.where({ email: 'alice@example.com' }).first();

// Create
const user = await db.orm.users.create({ email: 'a@e.com', role: 'author', address: null });

// Update one
await db.orm.users.where({ _id: user._id }).update({ role: 'author' });

// Update many
await db.orm.users.where({ role: 'reader' }).updateAll({ role: 'author' });

// Delete one
await db.orm.users.where({ _id: user._id }).delete();
```

--------------------------------

### Execute create and select queries in src/index.ts

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/orm/middleware/authoring-custom-middleware.mdx

Writes a new user record and fetches users using Prisma Client to trigger query middleware. Make sure to import db from the client file configured with the middleware.

```ts
import { db } from "./prisma/db";

await db.orm.public.User.create({
  email: `mia+${Date.now()}@prisma.io`,
  name: "Mia",
});

const users = await db.orm.public.User.select("id", "email").limit(5).all();
console.log(`fetched ${users.length} users`);

await db.close();
```


## prisma migrate dev and deploy

### Create and apply migration with prisma migrate dev

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/ai/prompts/astro.mdx

Creates and applies a new database migration in the development environment.

```npm
npx prisma migrate dev --name X  # Create and apply migration
```

--------------------------------

### Deploy migrations using prisma migrate deploy

Source: https://github.com/prisma/web/blob/main/apps/blog/content/blog/from-local-to-production-with-prisma-postgres/index.mdx

Apply committed migration files to the target production database via the direct connection without generating schema drafts or prompting.

```bash
npx prisma@7 migrate deploy
```

```text
2 migrations found in prisma/migrations

All migrations have been successfully applied.
```

--------------------------------

### Apply migrations with prisma migrate dev

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/local-development/postgres.mdx

Run migrations in a separate terminal to create the database schema on the running local Prisma Postgres instance. Ensure the local Prisma Postgres server is already active before running.

```npm
npx prisma@7 migrate dev
```

--------------------------------

### Migrate database with Prisma Migrate

Source: https://github.com/prisma/web/blob/main/apps/blog/content/blog/backend-prisma-typescript-orm-with-postgresql-data-modeling-tsjs1ps7kip1/index.mdx

Creates and runs a new migration using `prisma migrate dev` with a specified migration name, saving SQL files to `prisma/migrations`.

```sh
npx prisma migrate dev --name init
```

```text
migrations/
  └─ 20260703110127_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

--------------------------------

### Run migrations via Fly SSH console

Source: https://github.com/prisma/web/blob/main/apps/docs/content/docs/guides/postgres/flyio.mdx

Execute prisma migrate deploy directly on the deployed Fly.io instance using the Fly SSH console.

```bash
fly ssh console -C "npx prisma migrate deploy"
```
