import { Response, Request, Router } from "express";
import { tournamentController } from "../controllers/tournament-controller";
import { TournamentStatus, SurfaceType, DrawSize, MatchType } from "../types";
import {
  createTournamentValidator,
  CreateTournamentRequest,
} from "../validators/tournament-validator";
import { handleValidationErrors } from "../validators/validator";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

/**
 * GET /api/tournaments
 * Get all tournaments
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const tournaments = await tournamentController.findAllTournaments();
    res.status(200).json({ data: tournaments });
  }),
);

/**
 * POST /api/tournaments
 * Create a new tournament
 */
router.post(
  "/",
  createTournamentValidator,
  handleValidationErrors,
  asyncHandler(
    async (req: Request<{}, {}, CreateTournamentRequest>, res: Response) => {
      const {
        name,
        location,
        startDate,
        endDate,
        surfaceType,
        drawSize,
        matchType,
      } = req.body;

      const tournament = await tournamentController.createTournament({
        name,
        location,
        startDate,
        endDate,
        surfaceType: surfaceType as SurfaceType,
        drawSize: drawSize as DrawSize,
        matchType: (matchType as MatchType) || MatchType.Singles,
      });

      res.status(201).json({ data: tournament });
    },
  ),
);

/**
 * GET /api/tournaments/:id
 * Get tournament by ID
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const tournament = await tournamentController.findTournament(req.params.id);
    res.status(200).json({ data: tournament });
  }),
);

/**
 * PATCH /api/tournaments/:id/status
 * Update tournament status
 */
router.patch(
  "/:id/status",
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const tournament = await tournamentController.updateTournamentStatus(
      req.params.id,
      status as TournamentStatus,
    );

    res.status(200).json({ data: tournament });
  }),
);

export default router;
