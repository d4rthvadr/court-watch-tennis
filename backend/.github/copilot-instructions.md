# CourtWatch Backend - Architecture Patterns

## Layer Structure

```
Routes → Controllers → Services → Repositories (extends Database) → Prisma → Database
```

## Patterns

### Database Base Class

Repositories extend a Database class that wraps PrismaClient.

```typescript
// src/db/database.ts
export class Database extends PrismaClient {
  constructor() {
    super();
  }
}

export const db = new Database();
```

### Model Pattern (Domain Models)

Domain models encapsulate business entities with private fields and getters/setters.

```typescript
// src/models/entity.ts
export class EntityModel {
  readonly #id: string;
  #name: string;
  #status: EntityStatus;

  constructor(data: EntityDataInput) {
    this.#id = data.id ?? uuidv4();
    this.#name = data.name;
    this.#status = data.status ?? EntityStatus.Active;
  }

  get id(): string {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  set name(name: string) {
    this.#name = name;
  }

  // ... other getters/setters
}
```

### Repository Pattern

Repositories extend Database and handle data persistence with mapper functions.

```typescript
// src/models/repositories/EntityRepository.ts
import { Database } from "../../db/database";
import { EntityModel } from "../entity";

// Mapper function
function mapToEntity(dbEntity: PrismaEntity): EntityModel;
function mapToEntity(dbEntity: null): null;
function mapToEntity(dbEntity: PrismaEntity | null): EntityModel | null {
  if (!dbEntity) return null;

  return new EntityModel({
    id: dbEntity.id,
    name: dbEntity.name,
    status: convertToFamilyType(dbEntity.status, EntityStatus),
  });
}

export class EntityRepository extends Database {
  async findAll(): Promise<EntityModel[]> {
    const entities = await this.entity.findMany({
      orderBy: { createdAt: "desc" },
    });
    return entities
      .map(mapToEntity)
      .filter((e): e is EntityModel => e !== null);
  }

  async findById(id: string): Promise<EntityModel | null> {
    const entity = await this.entity.findUnique({ where: { id } });
    return mapToEntity(entity);
  }

  async save(data: EntityModel): Promise<EntityModel> {
    const entity = await this.entity.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        name: data.name,
        status: data.status,
      },
      update: {
        name: data.name,
        status: data.status,
      },
    });
    return mapToEntity(entity)!;
  }

  async delete(id: string): Promise<void> {
    await this.entity.delete({ where: { id } });
  }

  // Private mapper for simple cases
  private mapToEntity(dbEntity: any): Entity {
    return {
      id: dbEntity.id,
      name: dbEntity.name,
      status: dbEntity.status,
    };
  }
}

// Export singleton
export const entityRepository = new EntityRepository();
```

### Service Pattern

Services implement business logic and coordinate repository operations.

```typescript
export class EntityService {
  async performBusinessOperation(id: string, data: any): Promise<EntityModel> {
    // Fetch data
    const entity = await entityRepository.findById(id);
    if (!entity) {
      throw new Error("Entity not found");
    }

    // Apply business rules
    entity.name = this.processBusinessRules(data.name);

    // Save and return
    return await entityRepository.save(entity);
  }

  private processBusinessRules(name: string): string {
    // Business logic here
    return name.trim();
  }
}

// Export singleton
export const entityService = new EntityService();
```

## Quick Checklist for New Features

1. Define enums and interfaces in `src/types/`
2. Create domain model class in `src/models/` (e.g., `entity.ts`)
3. Create Prisma schema in `prisma/schema.prisma`
4. Run `npm run prisma:migrate` and `npm run prisma:generate`
5. Create mapper function in repository file
6. Create repository extending `Database` in `src/models/repositories/`
7. Create service if business logic needed in `src/services/`
8. Create validator in `src/validators/`
9. Create controller in `src/controllers/`
10. Create routes in `src/routes/`
11. Register routes in `src/routes/index.ts`

## Rules

✅ Repositories extend Database class
✅ Use domain model classes (with private fields) for complex entities
✅ Use mapper functions to convert Prisma entities to domain models
✅ Use `save()` method with upsert for create/update operations
✅ Access Prisma models via `this.entity` (from Database base class)
✅ Keep business logic in services and domain models
✅ Export singleton instances
✅ Use TypeScript types throughout
✅ Validate requests with express-validator

❌ No direct PrismaClient usage (use Database base class)
❌ No business logic in controllers or routes
❌ Don't expose private fields from domain models
❌ No database operations in services (use repositories)
