import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

async function main(size = 16) {
  const players = Array.from({ length: size }, (_, i) => ({
    name: `Player ${i + 1}`,
    status: "Active",
    rank: i + 1,
  }));

  for (const player of players) {
    await prisma.player.create({ data: player });
  }

  console.log(`Seeded ${size} players`, players);
}

const playerSize = process.argv[2] ? parseInt(process.argv[2], 10) : 16;

main(playerSize)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
