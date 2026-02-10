import { MatchType } from "../../generated/prisma";

const toMatchType = (type: string): MatchType => {
  switch (type) {
    case "Singles":
      return MatchType.Singles;
    case "Doubles":
      return MatchType.Doubles;
    default:
      throw new Error(`Invalid match type: ${type}`);
  }
};

export default toMatchType;

/**
 * Converts a value that may be `null` to `undefined`.
 *
 * This utility function is useful when you want to normalize values
 * that can be either `null` or `undefined` to always use `undefined`
 * instead of `null`.
 *
 * @typeParam T - The type of the value being converted.
 * @param value - The value to convert, which may be `null`.
 * @returns The original value if it is not `null`, otherwise `undefined`.
 */
export const convertNullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

/**
 * Converts a given string to a specific family type value from the provided enum-like object.
 *
 * @template P - A record type whose values are strings or numbers representing valid family types.
 * @param type - The type string to convert. Must be a value present in the `FamilyType` object.
 * @param FamilyType - An object representing the valid family types (enum-like).
 * @returns The corresponding value from `FamilyType` that matches the provided `type`.
 * @throws {Error} If `type` is undefined or not a valid value in `FamilyType`.
 */
export const convertToFamilyType = <P extends Record<string, string | number>>(
  type: unknown | undefined,
  FamilyType: P,
): P[keyof P] => {
  if (!type) {
    throw new Error("Type cannot be undefined");
  }

  if (typeof type === "string") {
    if (!Object.values(FamilyType).includes(type)) {
      throw new Error(
        `Invalid type: ${type}. Valid types are: ${Object.values(FamilyType).join(", ")}`,
      );
    }
  }

  return type as P[keyof P];
};
