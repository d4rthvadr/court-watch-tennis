import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { SurfaceType, DrawSize, MatchType } from "../types";

/**
 * Type definition for create tournament request body
 */
export interface CreateTournamentRequest {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  surfaceType: SurfaceType;
  drawSize: DrawSize;
  matchType?: MatchType;
}

/**
 * Validation rules for creating a tournament
 */
export const createTournamentValidator = [
  body("name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .trim()
    .isString()
    .withMessage("Name must be a string"),

  body("location")
    .exists()
    .withMessage("Location is required")
    .notEmpty()
    .withMessage("Location cannot be empty")
    .trim()
    .isString()
    .withMessage("Location must be a string"),

  body("startDate")
    .exists()
    .withMessage("Start date is required")
    .notEmpty()
    .withMessage("Start date cannot be empty")
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .exists()
    .withMessage("End date is required")
    .notEmpty()
    .withMessage("End date cannot be empty")
    .isISO8601()
    .withMessage("End date must be a valid date"),

  body("surfaceType")
    .exists()
    .withMessage("Surface type is required")
    .notEmpty()
    .withMessage("Surface type cannot be empty")
    .isString()
    .withMessage("Surface type must be a string"),

  body("drawSize")
    .exists()
    .withMessage("Draw size is required")
    .notEmpty()
    .withMessage("Draw size cannot be empty"),
];

/**
 * Type definition for generate draw request body
 */
export interface GenerateDrawRequest {
  players: Array<{ id: string; seed?: number }>;
}

/**
 * Validation rules for generating tournament draw
 */
export const generateDrawValidator = [
  body("players")
    .exists()
    .withMessage("Players array is required")
    .isArray({ min: 1 })
    .withMessage("Players must be a non-empty array"),

  body("players.*.id")
    .exists()
    .withMessage("Player id is required")
    .isString()
    .withMessage("Player id must be a string")
    .notEmpty()
    .withMessage("Player id cannot be empty"),

  body("players.*.seed")
    .optional()
    .isNumeric()
    .withMessage("Player seed must be a number"),
];

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};
