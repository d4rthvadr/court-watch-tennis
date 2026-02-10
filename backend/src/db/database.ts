import { PrismaClient } from "@prisma/client";

export class Database extends PrismaClient {
  constructor() {
    super();
  }
}

export const db = new Database();
