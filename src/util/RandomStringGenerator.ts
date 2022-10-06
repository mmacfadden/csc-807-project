/**
 * A utility class to generate pseudo random strings of varied lengths.
 */
export class RandomStringGenerator {

  /**
   * The alphabet of characters to include in generated strings.
   */
  private static readonly _CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  /**
   * Generates a random string of a specified length.
   *
   * @param length
   *   The length of string to generate. Must be >= 1.
   *
   * @returns The generated string.
   */
  public static generate(length: number): string {
    if (length <= 0) {
      throw new Error("length must be >= 1");
    }

    let result = '';

    for (let i = 0; i < length; i++) {
      const char = Math.floor(Math.random() * RandomStringGenerator._CHARACTERS.length);
      result += RandomStringGenerator._CHARACTERS.charAt(char);
    }

    return result;
  }
}