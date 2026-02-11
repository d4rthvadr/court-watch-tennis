import { RoundTypeEnum, GameStatus } from "../types";

export interface DrawEntryDataInput {
  id?: string;
  tournamentId: string;
  position: number;
  playerId?: string;
  seed?: number;
  round: RoundTypeEnum;
  matchId?: string;
}

export class DrawEntryModel {
  readonly #id: string;
  readonly #tournamentId: string;
  #position: number;
  #playerId?: string;
  #seed?: number;
  #round: RoundTypeEnum;
  #matchId?: string;

  constructor(data: DrawEntryDataInput) {
    this.#id = data.id || crypto.randomUUID();
    this.#tournamentId = data.tournamentId;
    this.#position = data.position;
    this.#playerId = data.playerId;
    this.#seed = data.seed;
    this.#round = data.round;
    this.#matchId = data.matchId;
  }

  get id(): string {
    return this.#id;
  }

  get tournamentId(): string {
    return this.#tournamentId;
  }

  get position(): number {
    return this.#position;
  }

  get playerId(): string | undefined {
    return this.#playerId;
  }

  get seed(): number | undefined {
    return this.#seed;
  }

  get round(): RoundTypeEnum {
    return this.#round;
  }

  get matchId(): string | undefined {
    return this.#matchId;
  }

  set position(position: number) {
    this.#position = position;
  }

  set playerId(playerId: string | undefined) {
    this.#playerId = playerId;
  }

  set seed(seed: number | undefined) {
    this.#seed = seed;
  }

  set round(round: RoundTypeEnum) {
    this.#round = round;
  }

  set matchId(matchId: string | undefined) {
    this.#matchId = matchId;
  }
}

export interface DrawMatchDataInput {
  id?: string;
  tournamentId: string;
  round: RoundTypeEnum;
  position: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  nextMatchId?: string;
  status: GameStatus;
  courtId?: string;
  startTime?: string;
  endTime?: string;
}

export class DrawMatchModel {
  readonly #id: string;
  readonly #tournamentId: string;
  #round: RoundTypeEnum;
  #position: number;
  #player1Id?: string;
  #player2Id?: string;
  #winnerId?: string;
  #nextMatchId?: string;
  #status: GameStatus;
  #courtId?: string;
  #startTime?: string;
  #endTime?: string;

  constructor(data: DrawMatchDataInput) {
    this.#id = data.id || crypto.randomUUID();
    this.#tournamentId = data.tournamentId;
    this.#round = data.round;
    this.#position = data.position;
    this.#player1Id = data.player1Id;
    this.#player2Id = data.player2Id;
    this.#winnerId = data.winnerId;
    this.#nextMatchId = data.nextMatchId;
    this.#status = data.status;
    this.#courtId = data.courtId;
    this.#startTime = data.startTime;
    this.#endTime = data.endTime;
  }

  get id(): string {
    return this.#id;
  }

  get tournamentId(): string {
    return this.#tournamentId;
  }

  get round(): RoundTypeEnum {
    return this.#round;
  }

  get position(): number {
    return this.#position;
  }

  get player1Id(): string | undefined {
    return this.#player1Id;
  }

  get player2Id(): string | undefined {
    return this.#player2Id;
  }

  get winnerId(): string | undefined {
    return this.#winnerId;
  }

  get nextMatchId(): string | undefined {
    return this.#nextMatchId;
  }

  get status(): GameStatus {
    return this.#status;
  }

  get courtId(): string | undefined {
    return this.#courtId;
  }

  get startTime(): string | undefined {
    return this.#startTime;
  }

  get endTime(): string | undefined {
    return this.#endTime;
  }

  set round(round: RoundTypeEnum) {
    this.#round = round;
  }

  set position(position: number) {
    this.#position = position;
  }

  set player1Id(player1Id: string | undefined) {
    this.#player1Id = player1Id;
  }

  set player2Id(player2Id: string | undefined) {
    this.#player2Id = player2Id;
  }

  set winnerId(winnerId: string | undefined) {
    this.#winnerId = winnerId;
  }

  set nextMatchId(nextMatchId: string | undefined) {
    this.#nextMatchId = nextMatchId;
  }

  set status(status: GameStatus) {
    this.#status = status;
  }

  set courtId(courtId: string | undefined) {
    this.#courtId = courtId;
  }

  set startTime(startTime: string | undefined) {
    this.#startTime = startTime;
  }

  set endTime(endTime: string | undefined) {
    this.#endTime = endTime;
  }
}
