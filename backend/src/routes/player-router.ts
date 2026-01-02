import { Router, Request, Response } from "express";
import { playerController } from "../player-controller";

const router = Router();

router.get("/", (_, res: Response) => {
  const players = playerController.findAll();
  res.status(200).json({ data: players });
});

router.post("/players", (req: Request, res: Response) => {
  try {
    const { name, status, rank, gameStatus, court } = req.body;

    if (!name || !status || !rank || !gameStatus || !court) {
      return res.status(400).json({
        error: "Missing required fields: name, status, rank, gameStatus, court",
      });
    }

    const newPlayer = {
      name,
      status,
      rank,
      gameStatus,
      court,
    };

    playerController.create(newPlayer);

    res.status(201).json({
      message: "Player created successfully",
      player: newPlayer,
    });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ error: "Failed to create player" });
  }
});

export const playerRouter = router;
