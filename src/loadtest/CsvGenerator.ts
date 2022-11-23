import {ILoadTestResult} from "./ILoadTestResult";

/**
 * A helper class that will generate a CSV file from the results of
 * the load tester.
 */
export class CsvGenerator {

  /**
   * The header line for the CSV output.
   */
  public static HEADERS = [
    "Encryption Module",
    "Operation Count",
    "Cumulative Time (ms)",
    "Average Read/Write Time (ms)",
    "Average Read Time (ms)",
    "Average Write Time (ms)",
    "Average Read Throughput (kBps)",
    "Average Write Throughput (kBps)",
  ];

  /**
   * Generates a CSV file from load testers results.
   *
   * @param results
   *   The results of the load testing run.
   * @returns A string representation of the CVS containing the restuls.
   */
  public static generateCsv(results: ILoadTestResult[]): string {
    if (!Array.isArray(results)) {
      throw new Error("results must be an array");
    }

    const data = results
        .map(row => {
          const {
            moduleId,
            operationCount,
            totalTimeMs,
            averageReadTimeMs,
            averageWriteTimeMs,
            averageReadWriteTimeMs,
            avgReadThroughputKbps,
            avgWriteThroughputKbps
          } = row
          return [
            moduleId,
            operationCount,
            totalTimeMs,
            averageReadTimeMs,
            averageWriteTimeMs,
            averageReadWriteTimeMs,
            avgReadThroughputKbps,
            avgWriteThroughputKbps
          ].join(",");
        });

    data.unshift(CsvGenerator.HEADERS.join(","));

    return data.join("\n");
  }
}