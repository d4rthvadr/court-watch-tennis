import { Response, Request, Router } from "express";
import { drawController } from "../controllers/draw-controller";
import { asyncHandler } from "../util";
import { TournamentStatus, SurfaceType, DrawSize, MatchType } from "../types";
import {
  createTournamentValidator,
  handleValidationErrors,
  CreateTournamentRequest,
  generateDrawValidator,
  GenerateDrawRequest,
} from "../validators/tournament-validator";
import { getMatchingPlayers, initialPlayers } from "../data/players.data";

const router = Router();

/**
 * GET /api/tournaments
 * Get all tournaments
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const tournaments = await drawController.findAllTournaments();
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

      const tournament = await drawController.createTournament({
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
    const tournament = await drawController.findTournament(req.params.id);
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

    const tournament = await drawController.updateTournamentStatus(
      req.params.id,
      status as TournamentStatus,
    );

    res.status(200).json({ data: tournament });
  }),
);

/**
 * POST /api/tournaments/:id/draw
 * Generate draw for tournament
 */
router.post(
  "/:id/draw",
  generateDrawValidator,
  handleValidationErrors,
  asyncHandler(
    async (
      req: Request<{ id: string }, {}, GenerateDrawRequest>,
      res: Response,
    ) => {
      const { players } = req.body;

      const matchedPlayers = getMatchingPlayers(players, initialPlayers);

      const draw = await drawController.generateDraw(req.params.id, {
        players: matchedPlayers,
      });

      res.status(201).json({ data: draw });
    },
  ),
);

/**
 * GET /api/tournaments/:id/draw
 * Get draw for tournament
 */
router.get(
  "/:id/draw",
  asyncHandler(async (req: Request, res: Response) => {
    const draw = await drawController.getDraw(req.params.id);
    res.status(200).json({ data: draw });
  }),
);

/**
 * GET /api/tournaments/:id/matches
 * Get all matches for tournament
 */
router.get(
  "/:id/matches",
  asyncHandler(async (req: Request, res: Response) => {
    const { round } = req.query;

    let matches;
    if (round) {
      matches = await drawController.getMatchesByRound(
        req.params.id,
        round as string,
      );
    } else {
      matches = await drawController.getMatches(req.params.id);
    }

    res.status(200).json({ data: matches });
  }),
);

/**
 * PATCH /api/tournaments/:tournamentId/matches/:matchId
 * Update match result
 */
router.patch(
  "/:tournamentId/matches/:matchId",
  asyncHandler(async (req: Request, res: Response) => {
    const { winnerId } = req.body;

    if (!winnerId) {
      return res.status(400).json({ error: "Winner ID is required" });
    }

    const match = await drawController.updateMatchResult(
      req.params.tournamentId,
      req.params.matchId,
      { winnerId },
    );

    res.status(200).json({ data: match });
  }),
);

export default router;
