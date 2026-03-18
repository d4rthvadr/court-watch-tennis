import { v4 as uuidv4 } from "uuid";

interface PlayerDataInput {
  id?: string;
  name: string;
  status: string;
  rank: number;
}

export class PlayerModel {
  readonly #id: string | undefined;
  #name: string;
  #status: string;
  #rank: number;

  constructor(data: PlayerDataInput) {
    const { id = uuidv4(), name, status, rank } = data;
    this.#id = id;
    this.#name = name;
    this.#status = status;
    this.#rank = rank;
  }

  get id(): string | undefined {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  get status(): string {
    return this.#status;
  }

  get rank(): number {
    return this.#rank;
  }

  set name(name: string) {
    this.#name = name;
  }

  set status(status: string) {
    this.#status = status;
  }

  set rank(rank: number) {
    this.#rank = rank;
  }
}
