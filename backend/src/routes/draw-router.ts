import { Response, Request, Router } from "express";
import { drawController } from "../controllers/draw-controller";
import { asyncHandler } from "../util";
import {
  generateDrawValidator,
  handleValidationErrors,
  GenerateDrawRequest,
} from "../validators/tournament-validator";
import { getMatchingPlayers, initialPlayers } from "../data/players.data";

const router = Router();

/**
 * POST /api/tournaments/:tournamentId/draw
 * Generate draw for tournament
 */
router.post(
  "/:tournamentId/draw",
  generateDrawValidator,
  handleValidationErrors,
  asyncHandler(
    async (
      req: Request<{ tournamentId: string }, {}, GenerateDrawRequest>,
      res: Response,
    ) => {
      const { players } = req.body;

      const matchedPlayers = getMatchingPlayers(players, initialPlayers);

      const draw = await drawController.generateDraw(req.params.tournamentId, {
        players: matchedPlayers,
      });

      res.status(201).json({ data: draw });
    },
  ),
);

/**
 * GET /api/tournaments/:tournamentId/draw
 * Get draw for tournament
 */
router.get(
  "/:tournamentId/draw",
  asyncHandler(async (req: Request, res: Response) => {
    const draw = await drawController.getDraw(req.params.tournamentId);
    res.status(200).json({ data: draw });
  }),
);

/**
 * GET /api/tournaments/:tournamentId/matches
 * Get all matches for tournament
 */
router.get(
  "/:tournamentId/matches",
  asyncHandler(async (req: Request, res: Response) => {
    const { round } = req.query;

    let matches;
    if (round) {
      matches = await drawController.getMatchesByRound(
        req.params.tournamentId,
        round as string,
      );
    } else {
      matches = await drawController.getMatches(req.params.tournamentId);
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
