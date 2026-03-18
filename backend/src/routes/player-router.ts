import { Router, Request, Response } from "express";
import { playerController } from "../controllers";
import {
  createPlayerValidator,
  updatePlayerValidator,
  CreatePlayerRequest,
  UpdatePlayerRequest,
} from "../validators/player-validator";
import { handleValidationErrors } from "../validators/validator";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

/**
 * GET /api/players
 * Get all players
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const players = await playerController.findAllPlayers();
    res.status(200).json({ data: players });
  }),
);

/**
 * GET /api/players/seeded
 * Get seeded players for tournament draw generation
 */
router.get(
  "/seeded",
  asyncHandler(async (req: Request, res: Response) => {
    const players = await playerController.getSeededPlayers();
    res.status(200).json({ data: players });
  }),
);

/**
 * GET /api/players/tournament
 * Get players for tournament (with id, name, seed)
 */
router.get(
  "/tournament",
  asyncHandler(async (req: Request, res: Response) => {
    const players = await playerController.getPlayersForTournament();
    res.status(200).json({ data: players });
  }),
);

/**
 * POST /api/players
 * Create a new player
 */
router.post(
  "/",
  createPlayerValidator,
  handleValidationErrors,
  asyncHandler(
    async (req: Request<{}, {}, CreatePlayerRequest>, res: Response) => {
      const { name, status, rank } = req.body;

      const player = await playerController.createPlayer({
        name,
        status,
        rank,
      });

      res.status(201).json({ data: player });
    },
  ),
);

/**
 * GET /api/players/:id
 * Get player by ID
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const player = await playerController.findPlayer(req.params.id as string);
    res.status(200).json({ data: player });
  }),
);

/**
 * PATCH /api/players/:id
 * Update player
 */
router.patch(
  "/:id",
  updatePlayerValidator,
  handleValidationErrors,
  asyncHandler(
    async (
      req: Request<{ id: string }, {}, UpdatePlayerRequest>,
      res: Response,
    ) => {
      const { name, status, rank } = req.body;

      const player = await playerController.updatePlayer(
        req.params.id as string,
        {
          name,
          status,
          rank,
        },
      );

      res.status(200).json({ data: player });
    },
  ),
);

/**
 * DELETE /api/players/:id
 * Delete player
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await playerController.deletePlayer(req.params.id as string);
    res.status(204).send();
  }),
);

export const playerRouter = router;
