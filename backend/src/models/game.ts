import { v4 as uuidv4 } from "uuid";
import { GameStatus } from "../types";

interface GameDataInput {
  id?: string;
  name?: string;
  status: GameStatus;
  startTime?: string;
  endTime?: string;
  playerOneId: string;
  playerTwoId: string;
  courtId: string;
}

export class GameModel {
  readonly #id: string | undefined;
  #name?: string;
  #status: GameStatus;
  #startTime?: string;
  #endTime?: string;
  #playerOneId: string;
  #playerTwoId: string;
  #courtId: string;

  constructor(data: GameDataInput) {
    const {
      id = uuidv4(),
      name,
      status = GameStatus.Scheduled,
      startTime,
      endTime,
      playerOneId,
      playerTwoId,
      courtId,
    } = data;

    this.#id = id;
    this.#name = name;
    this.#status = status;
    this.#startTime = startTime;
    this.#endTime = endTime;
    this.#playerOneId = playerOneId;
    this.#playerTwoId = playerTwoId;
    this.#courtId = courtId;
  }

  get id(): string | undefined {
    return this.#id;
  }

  get name(): string | undefined {
    return this.#name;
  }

  get status(): GameStatus {
    return this.#status;
  }

  get startTime(): string | undefined {
    return this.#startTime;
  }

  get endTime(): string | undefined {
    return this.#endTime;
  }

  get playerOneId(): string {
    return this.#playerOneId;
  }

  get playerTwoId(): string {
    return this.#playerTwoId;
  }

  get courtId(): string {
    return this.#courtId;
  }

  set name(name: string | undefined) {
    this.#name = name;
  }

  set status(status: GameStatus) {
    this.#status = status;
  }

  set startTime(startTime: string | undefined) {
    this.#startTime = startTime;
  }

  set endTime(endTime: string | undefined) {
    this.#endTime = endTime;
  }

  set playerOneId(playerOneId: string) {
    this.#playerOneId = playerOneId;
  }

  set playerTwoId(playerTwoId: string) {
    this.#playerTwoId = playerTwoId;
  }

  set courtId(courtId: string) {
    this.#courtId = courtId;
  }
}
