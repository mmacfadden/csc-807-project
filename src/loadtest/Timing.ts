/**
 * A helper class that uses the HTML UserTiming API to record performance
 * data for load testing the EncryptedStorageFramework.
 */
export class Timing {

  private static _READ = "read";
  private static _WRITE = "write";

  private static _READ_START = "read_start_";
  private static _READ_END = "read_end_";

  private static _WRITE_START = "write_start_";
  private static _WRITE_END = "write_end_";


  /**
   * Indicates that a read operation has begun.
   *
   * @param i
   *   The unique sequential id of the read operation.
   */
  public static readStart(i: number): void {
    globalThis.performance.mark(Timing._READ_START + i);
  }

  /**
   * Indicates that a read operation has ended.
   *
   * @param i
   *   The unique sequential id of the read operation.
   */
  public static readEnd(i: number): number {
    const endMark = Timing._READ_END + i;
    globalThis.performance.mark(Timing._READ_END + i);
    const measure = globalThis.performance.measure(
      Timing._READ, Timing._READ_START + i, endMark);

    return measure.duration;
  }

  /**
   * Indicates that a write operation has begun.
   *
   * @param i
   *   The unique sequential id of the write operation.
   */
  public static writeStart(i: number): void {
    globalThis.performance.mark(Timing._WRITE_START + i);
  }


  /**
   * Indicates that a write operation has ended.
   *
   * @param i
   *   The unique sequential id of the write operation.
   */
  public static writeEnd(i: number): number {
    const endMark = Timing._WRITE_END + i;
    globalThis.performance.mark(Timing._WRITE_END + i);
    const measure = globalThis.performance.measure(
      Timing._WRITE, Timing._WRITE_START + i, endMark);

    return measure.duration;
  }

  /**
   * Get the total amount of time that has been used for read
   * operations.
   *
   * @returns The total time spent reading in milliseconds.
   */
  public static getTotalReadTime(): number {
    return this._getTotal(Timing._READ);
  }

  /**
   * Get the total amount of time that has been used for write
   * operations.
   *
   * @returns The total time spent writing in milliseconds.
   */
  public static getTotalWriteTime(): number {
    return this._getTotal(Timing._WRITE);
  }

  /**
   * Starts a new measurement session, clearing any previous results.
   */
  public static startMeasurementSession(): void {
    globalThis.performance.clearMarks();
    globalThis.performance.clearMeasures();
  }

  private static _getTotal(name: string): number {
    let total = 0;
    const entries = globalThis.performance.getEntriesByName(name);
    for(const e of entries) {
      total += e.duration
    }

    return total;
  }
}