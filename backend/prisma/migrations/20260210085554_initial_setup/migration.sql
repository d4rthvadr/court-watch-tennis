-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('Upcoming', 'Active', 'Completed');

-- CreateEnum
CREATE TYPE "SurfaceType" AS ENUM ('Hard', 'Clay', 'Grass', 'Carpet');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('Singles', 'Doubles');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('Scheduled', 'Ongoing', 'Completed', 'Cancelled');

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "surfaceType" "SurfaceType" NOT NULL DEFAULT 'Hard',
    "drawSize" INTEGER NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'Upcoming',
    "matchType" "MatchType" NOT NULL DEFAULT 'Singles',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "player_one_id" TEXT NOT NULL,
    "player_two_id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draw_entries" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "player_id" TEXT,
    "seed" INTEGER,
    "round" TEXT NOT NULL,
    "match_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draw_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draw_matches" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "player1_id" TEXT,
    "player2_id" TEXT,
    "winner_id" TEXT,
    "next_match_id" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'Scheduled',
    "court_id" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draw_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "draw_entries_tournament_id_idx" ON "draw_entries"("tournament_id");

-- CreateIndex
CREATE INDEX "draw_entries_player_id_idx" ON "draw_entries"("player_id");

-- CreateIndex
CREATE INDEX "draw_matches_tournament_id_idx" ON "draw_matches"("tournament_id");

-- CreateIndex
CREATE INDEX "draw_matches_player1_id_idx" ON "draw_matches"("player1_id");

-- CreateIndex
CREATE INDEX "draw_matches_player2_id_idx" ON "draw_matches"("player2_id");

-- CreateIndex
CREATE INDEX "draw_matches_winner_id_idx" ON "draw_matches"("winner_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player_one_id_fkey" FOREIGN KEY ("player_one_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_player_two_id_fkey" FOREIGN KEY ("player_two_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_entries" ADD CONSTRAINT "draw_entries_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_entries" ADD CONSTRAINT "draw_entries_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_matches" ADD CONSTRAINT "draw_matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_matches" ADD CONSTRAINT "draw_matches_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_matches" ADD CONSTRAINT "draw_matches_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_matches" ADD CONSTRAINT "draw_matches_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
