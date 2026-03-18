import { body } from "express-validator";
import { PlayerStatus } from "../types";

/**
 * Type definition for create player request body
 */
export interface CreatePlayerRequest {
  name: string;
  status: string;
  rank: number;
}

/**
 * Type definition for update player request body
 */
export interface UpdatePlayerRequest {
  name?: string;
  status?: string;
  rank?: number;
}

/**
 * Validation rules for creating a player
 */
export const createPlayerValidator = [
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

  body("status")
    .exists()
    .withMessage("Status is required")
    .notEmpty()
    .withMessage("Status cannot be empty")
    .trim()
    .isString()
    .withMessage("Status must be a string")
    .isIn(Object.values(PlayerStatus))
    .withMessage(
      `Status must be one of: ${Object.values(PlayerStatus).join(", ")}`,
    ),

  body("rank")
    .exists()
    .withMessage("Rank is required")
    .isInt({ min: 1 })
    .withMessage("Rank must be a positive integer"),
];

/**
 * Validation rules for updating a player
 */
export const updatePlayerValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .trim()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("status")
    .optional()
    .notEmpty()
    .withMessage("Status cannot be empty")
    .trim()
    .isString()
    .withMessage("Status must be a string")
    .isIn(Object.values(PlayerStatus))
    .withMessage(
      `Status must be one of: ${Object.values(PlayerStatus).join(", ")}`,
    ),

  body("rank")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Rank must be a positive integer"),
];
