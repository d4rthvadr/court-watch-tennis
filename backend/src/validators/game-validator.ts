import { body } from "express-validator";
import { GameStatus } from "../types";

/**
 * Type definition for create game request body
 */
export interface CreateGameRequest {
  name?: string;
  status?: GameStatus;
  startTime?: string;
  endTime?: string;
  playerOneId: string;
  playerTwoId: string;
  courtId: string;
}

/**
 * Type definition for update game request body
 */
export interface UpdateGameRequest {
  name?: string;
  status?: GameStatus;
  startTime?: string;
  endTime?: string;
  playerOneId?: string;
  playerTwoId?: string;
  courtId?: string;
}

/**
 * Validation rules for creating a game
 */
export const createGameValidator = [
  body("name")
    .optional()
    .trim()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("status")
    .optional()
    .isIn(Object.values(GameStatus))
    .withMessage(
      `Status must be one of: ${Object.values(GameStatus).join(", ")}`,
    ),

  body("startTime")
    .optional()
    .isISO8601()
    .withMessage("Start time must be a valid ISO8601 date"),

  body("endTime")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid ISO8601 date"),

  body("playerOneId")
    .exists()
    .withMessage("Player one ID is required")
    .isUUID()
    .withMessage("Player one ID must be a valid UUID"),

  body("playerTwoId")
    .exists()
    .withMessage("Player two ID is required")
    .isUUID()
    .withMessage("Player two ID must be a valid UUID"),

  body("courtId")
    .exists()
    .withMessage("Court ID is required")
    .isString()
    .withMessage("Court ID must be a string")
    .notEmpty()
    .withMessage("Court ID cannot be empty"),
];

/**
 * Validation rules for updating a game
 */
export const updateGameValidator = [
  body("name")
    .optional()
    .trim()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("status")
    .optional()
    .isIn(Object.values(GameStatus))
    .withMessage(
      `Status must be one of: ${Object.values(GameStatus).join(", ")}`,
    ),

  body("startTime")
    .optional()
    .isISO8601()
    .withMessage("Start time must be a valid ISO8601 date"),

  body("endTime")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid ISO8601 date"),

  body("playerOneId")
    .optional()
    .isUUID()
    .withMessage("Player one ID must be a valid UUID"),

  body("playerTwoId")
    .optional()
    .isUUID()
    .withMessage("Player two ID must be a valid UUID"),

  body("courtId")
    .optional()
    .isString()
    .withMessage("Court ID must be a string")
    .notEmpty()
    .withMessage("Court ID cannot be empty"),
];

/**
 * Validation rules for updating game status
 */
export const updateGameStatusValidator = [
  body("status")
    .exists()
    .withMessage("Status is required")
    .isIn(Object.values(GameStatus))
    .withMessage(
      `Status must be one of: ${Object.values(GameStatus).join(", ")}`,
    ),
];
