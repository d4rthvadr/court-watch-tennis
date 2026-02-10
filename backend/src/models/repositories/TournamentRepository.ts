import {
  Tournament,
  TournamentStatus,
  DrawSize,
  MatchType,
  SurfaceType,
} from "../../types";
import {
  MatchType as EntityMatchType,
  Tournament as TournamentEntity,
} from "../../../generated/prisma";
import { Database } from "../../db/database";
import { convertToFamilyType } from "../util";
import { TournamentModel } from "../tournament";

function mapToTournament(entity: TournamentEntity): TournamentModel;
function mapToTournament(entity: null): null;
function mapToTournament(
  entity: TournamentEntity | null,
): TournamentModel | null;
function mapToTournament(
  entity: TournamentEntity | null,
): TournamentModel | null {
  if (!entity) {
    return null;
  }
  return new TournamentModel({
    id: entity.id,
    name: entity.name,
    location: entity.location,
    startDate: entity.startDate,
    endDate: entity.endDate,
    surfaceType: convertToFamilyType(entity.surfaceType, SurfaceType),
    drawSize: convertToFamilyType(entity.drawSize, DrawSize),
    status: convertToFamilyType(entity.status, TournamentStatus),
    matchType: convertToFamilyType(entity.matchType, MatchType),
  });
}

export class TournamentRepository extends Database {
  async findAll(): Promise<TournamentModel[]> {
    const tournaments = await this.tournament.findMany({
      orderBy: { createdAt: "desc" },
    });

    return tournaments
      .map(mapToTournament)
      .filter((t): t is TournamentModel => t !== null);
  }

  async findById(id: string): Promise<TournamentModel | null> {
    const tournament = await this.tournament.findUnique({
      where: { id },
    });

    return mapToTournament(tournament);
  }

  async save(data: TournamentModel): Promise<TournamentModel> {
    const tournament = await this.tournament.upsert({
      where: { id: data.id },
      create: {
        id: data.id!,
        name: data.name,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        surfaceType: data.surfaceType,
        drawSize: data.drawSize,
        status: data.status,
        matchType: convertToFamilyType(data.matchType, EntityMatchType),
      },
      update: {
        name: data.name,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        surfaceType: data.surfaceType,
        drawSize: data.drawSize,
        status: data.status,
        matchType: convertToFamilyType(data.matchType, EntityMatchType),
      },
    });

    return mapToTournament(tournament);
  }

  async delete(id: string): Promise<void> {
    await this.tournament.delete({
      where: { id },
    });
  }
}
