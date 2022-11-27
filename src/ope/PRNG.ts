/**
 * A pseudorandom number generator that
 * generates a value between 0 and 1.
 */
export class PRNG {
  public coins: Iterator<number>;

  /**
   * Creates a new random number generator using a coin
   * iterator.
   *
   * @param coins
   *   A iterator that supplies bits.
   */
  constructor(coins: Iterator<number>) {
    this.coins = coins;
  }

  /**
   * Draws a random number.
   *
   * @returns
   *  A number between 0 and 1.
   */
  public draw(): number {
    const bits: number[] = [];
    bits.length = 32;

    for (let i = 0; i < 32; i++) {
      const next = this.coins.next();
      if (next.done) {
        break;
      } else {
        bits[i] = next.value;
      }
    }

    // assert(bits.length == 32);

    let out: number = 0;
    for (const b of bits) {
      // Differences in python and javscript bitwise operators.
      // https://stackoverflow.com/questions/54030623/left-shift-results-in-negative-numbers-in-javascript
      out = ((out << 1) | b) >>> 0;
    }

    const res = out / (2 ** 32 - 1);
    // assert(res >= 0 && res <= 1, "result must be between 0 and 1: " + res);
    return res;
  }
}