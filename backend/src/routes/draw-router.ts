import { Response, Request, Router } from "express";
import { drawController } from "../controllers/draw-controller";
import {
  generateDrawValidator,
  GenerateDrawRequest,
} from "../validators/tournament-validator";

import { playerService } from "../services/player-service";
import { asyncHandler } from "../utils/async-handler";
import { handleValidationErrors } from "../validators";

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

      // Fetch all players from DB and match by ID, preserving seed if provided
      const allPlayers = await playerService.findAllPlayers();
      const matchedPlayers = players
        .map((entry: { id: string; seed?: number }) => {
          const player = allPlayers.find((p) => p.id === entry.id);
          if (!player) return null;
          return {
            id: player.id,
            name: player.name,
            seed: entry.seed,
          };
        })
        .filter((p) => p !== null);

      if (matchedPlayers.length !== players.length) {
        return res.status(400).json({ error: "One or more players not found" });
      }

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
    const draw = await drawController.getDraw(
      req.params.tournamentId as string,
    );
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
        req.params.tournamentId as string,
        round as string,
      );
    } else {
      matches = await drawController.getMatches(
        req.params.tournamentId as string,
      );
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
      req.params.tournamentId as string,
      req.params.matchId as string,
      { winnerId },
    );

    res.status(200).json({ data: match });
  }),
);

export default router;
