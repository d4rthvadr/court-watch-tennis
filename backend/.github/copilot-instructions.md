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

Services implement business logic, validate data, and coordinate repository operations.

```typescript
// src/services/entity-service.ts
import { EntityRepository } from "../models/repositories/EntityRepository";
import { EntityModel } from "../models/entity";
import { NotFoundError } from "../errors";

export interface CreateEntityData {
  name: string;
  status: EntityStatus;
}

class EntityService {
  /**
   * Get all entities
   */
  async findAllEntities(): Promise<Entity[]> {
    const entities = await entityRepository.findAll();
    return entities.map(toEntityDTO);
  }

  /**
   * Create entity with business logic
   */
  async createEntity(data: CreateEntityData): Promise<Entity> {
    // Business logic: validate data
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Entity name is required");
    }

    // Business logic: normalize name
    const normalizedName = data.name.trim().toUpperCase();

    const entity = await entityRepository.save(
      new EntityModel({
        name: normalizedName,
        status: data.status,
      }),
    );

    return toEntityDTO(entity);
  }

  /**
   * Business logic for status updates
   */
  async updateStatus(id: string, newStatus: EntityStatus): Promise<Entity> {
    const entity = await entityRepository.findById(id);
    if (!entity) {
      throw new NotFoundError(`Entity not found with id: ${id}`);
    }

    // Business logic: validate status transition
    this.validateStatusTransition(entity.status, newStatus);

    entity.status = newStatus;
    const updated = await entityRepository.save(entity);

    return toEntityDTO(updated);
  }

  /**
   * Private helper for business rules
   */
  private validateStatusTransition(
    current: EntityStatus,
    next: EntityStatus,
  ): void {
    const validTransitions: Record<EntityStatus, EntityStatus[]> = {
      [EntityStatus.Active]: [EntityStatus.Inactive],
      [EntityStatus.Inactive]: [EntityStatus.Active],
    };

    if (!validTransitions[current]?.includes(next)) {
      throw new Error(`Invalid transition from ${current} to ${next}`);
    }
  }
}

// Export singleton
export const entityService = new EntityService();
```

### Controller Pattern

Controllers handle HTTP concerns and delegate to services (thin layer).

```typescript
// src/controllers/entity-controller.ts
import { entityService, CreateEntityData } from "../services/entity-service";
import { Entity, EntityStatus } from "../types";

export interface CreateEntityRequest {
  name: string;
  status: EntityStatus;
}

class EntityController {
  /**
   * Get all entities
   */
  async findAllEntities(): Promise<Entity[]> {
    return await entityService.findAllEntities();
  }

  /**
   * Create entity
   */
  async createEntity(data: CreateEntityRequest): Promise<Entity> {
    return await entityService.createEntity(data);
  }

  /**
   * Update status
   */
  async updateStatus(id: string, status: EntityStatus): Promise<Entity> {
    return await entityService.updateStatus(id, status);
  }
}

// Export singleton
export const entityController = new EntityController();
```

### Validator Pattern

Validators use express-validator to validate incoming requests. Always use `Object.values()` with enums for type safety.

```typescript
// src/validators/entity-validator.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { EntityStatus, SomeEnum } from "../types";

/**
 * Type definition for create entity request body
 */
export interface CreateEntityRequest {
  name: string;
  status: EntityStatus;
}

/**
 * Validation rules for creating an entity
 */
export const createEntityValidator = [
  body("name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .trim()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  // ✅ ALWAYS use Object.values() with enums
  body("status")
    .exists()
    .withMessage("Status is required")
    .isIn(Object.values(EntityStatus))
    .withMessage(
      `Status must be one of: ${Object.values(EntityStatus).join(", ")}`,
    ),
];

/**
 * Validation rules for updating an entity
 */
export const updateEntityValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .trim()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  // ✅ ALWAYS use Object.values() with enums
  body("status")
    .optional()
    .isIn(Object.values(EntityStatus))
    .withMessage(
      `Status must be one of: ${Object.values(EntityStatus).join(", ")}`,
    ),
];

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
    return;
  }
  next();
};
```

#### Validation Best Practices

✅ **ALWAYS use `Object.values()` with enums** for `.isIn()` validation
✅ Create TypeScript enum in `src/types/` for all fixed value sets
✅ Import and use the enum in validators (never hardcode arrays)
✅ Dynamic error messages with `Object.values(Enum).join(", ")`
✅ Use `.optional()` for optional fields in update validators
✅ Export `handleValidationErrors` middleware for consistent error handling
✅ Define request interfaces matching validator rules

❌ **NEVER hardcode arrays** like `.isIn(["Active", "Inactive"])` - use enums
❌ Don't duplicate validation logic - use shared validators
❌ Don't skip validation middleware on routes
❌ Don't use magic strings anywhere - always define enums

**Example of what NOT to do:**

```typescript
// ❌ BAD - Hardcoded array
body("status")
  .isIn(["Active", "Inactive", "Retired"])
  .withMessage("Status must be one of: Active, Inactive, Retired");

// ✅ GOOD - Using enum with Object.values()
body("status")
  .isIn(Object.values(PlayerStatus))
  .withMessage(
    `Status must be one of: ${Object.values(PlayerStatus).join(", ")}`,
  );
```

## Quick Checklist for New Features

1. Define enums and interfaces in `src/types/`
2. Create domain model class in `src/models/` (e.g., `entity.ts`)
3. Create Prisma schema in `prisma/schema.prisma`
4. Run `npm run prisma:migrate` and `npm run prisma:generate`
5. Create mapper function in repository file
6. Create repository extending `Database` in `src/models/repositories/`
7. Create service if business logic needed in `src/services/`
8. Create validator in `src/validators/` (use `Object.values()` with enums)
9. Create controller in `src/controllers/`
10. Create routes in `src/routes/` (apply validators to routes)
11. Register routes in `src/routes/index.ts`

## Rules

✅ Controllers are thin - only handle HTTP concerns
✅ Business logic lives in services
✅ Services validate data and orchestrate operations
✅ Services call repositories for data access
✅ Repositories extend Database class
✅ Use domain model classes (with private fields) for complex entities
✅ Use mapper functions to convert Prisma entities to domain models
✅ Use `save()` method with upsert for create/update operations
✅ Access Prisma models via `this.entity` (from Database base class)
✅ Export singleton instances
✅ Use TypeScript types throughout
✅ Validate requests with express-validator
✅ **ALWAYS use `Object.values(EnumName)` in validators for `.isIn()` checks**
✅ Define enums for all fixed value sets (statuses, types, categories, etc.)
✅ Import enums in validators - never hardcode value arrays

❌ No direct PrismaClient usage (use Database base class)
❌ No business logic in controllers or routes
❌ No repository calls in controllers (use services)
❌ Don't expose private fields from domain models
❌ No database operations directly in services (use repositories)
❌ **NEVER use hardcoded arrays like `.isIn(["value1", "value2"])` - always use enums**
❌ No magic strings - define constants/enums instead
