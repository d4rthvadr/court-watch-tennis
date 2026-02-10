import { DrawSize, MatchType, SurfaceType, TournamentStatus } from "../types";
import { v4 as uuidv4 } from "uuid";

interface TournamentDataInput {
  id?: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  surfaceType: SurfaceType;
  drawSize: DrawSize;
  status: TournamentStatus;
  matchType: MatchType;
}

export class TournamentModel {
  readonly #id: string | undefined;
  #name: string;
  #location: string;
  #startDate: string;
  #endDate: string;
  #surfaceType: SurfaceType;
  #status: TournamentStatus;
  #drawSize: DrawSize;
  #matchType: MatchType;

  constructor(data: TournamentDataInput) {
    const {
      id = uuidv4(),
      name,
      location,
      startDate,
      endDate,
      surfaceType = SurfaceType.Hard,
      drawSize,
      status = TournamentStatus.Upcoming,
      matchType = MatchType.Singles,
    } = data;
    this.#id = id;
    this.#name = name;
    this.#location = location;
    this.#startDate = startDate;
    this.#status = status;
    this.#endDate = endDate;
    this.#surfaceType = surfaceType;
    this.#drawSize = drawSize;
    this.#matchType = matchType;
  }

  get id(): string | undefined {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  get location(): string {
    return this.#location;
  }

  get status(): TournamentStatus {
    return this.#status;
  }

  get startDate(): string {
    return this.#startDate;
  }

  get endDate(): string {
    return this.#endDate;
  }

  get surfaceType(): SurfaceType {
    return this.#surfaceType;
  }

  get drawSize(): DrawSize {
    return this.#drawSize;
  }

  get matchType(): MatchType {
    return this.#matchType;
  }

  set name(name: string) {
    this.#name = name;
  }

  set location(location: string) {
    this.#location = location;
  }

  set startDate(startDate: string) {
    this.#startDate = startDate;
  }

  set endDate(endDate: string) {
    this.#endDate = endDate;
  }

  set status(status: TournamentStatus) {
    this.#status = status;
  }

  set surfaceType(surfaceType: SurfaceType) {
    this.#surfaceType = surfaceType;
  }

  set drawSize(drawSize: DrawSize) {
    this.#drawSize = drawSize;
  }

  set matchType(matchType: MatchType) {
    this.#matchType = matchType;
  }
}
