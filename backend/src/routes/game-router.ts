import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { gameController } from "../controllers/game-controller";
import {
  createGameValidator,
  updateGameValidator,
  updateGameStatusValidator,
  handleValidationErrors,
} from "../validators";

const router = Router();

/**
 * GET /api/games
 * Get all games
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const games = await gameController.findAll();
    res.json(games);
  }),
);

/**
 * GET /api/games/:id
 * Get game by ID
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const game = await gameController.find(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  }),
);

/**
 * POST /api/games
 * Create a new game
 */
router.post(
  "/",
  createGameValidator,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const game = await gameController.save(req.body);
    res.status(201).json(game);
  }),
);

/**
 * PATCH /api/games/:id
 * Update game
 */
router.patch(
  "/:id",
  updateGameValidator,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const game = await gameController.update(req.params.id, req.body);
    res.json(game);
  }),
);

/**
 * PATCH /api/games/:id/status
 * Update game status
 */
router.patch(
  "/:id/status",
  updateGameStatusValidator,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const game = await gameController.updateStatus(req.params.id, status);
    res.json(game);
  }),
);

/**
 * DELETE /api/games/:id
 * Delete game
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await gameController.delete(req.params.id);
    res.status(204).send();
  }),
);

export default router;
