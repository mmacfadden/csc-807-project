import {ILoadTestResult} from "./ILoadTestResult";

/**
 * A helper class that will generate a CSV file from the results of
 * the load tester.
 */
export class CsvGenerator {

  /**
   * The header line for the CSV output.
   */
  public static Columns = [
    {field: "moduleId", title: "Encryption Module"},
    {field: "schemaName", title: "Object Schema"},
    {field: "averageDocumentSize", title: "Average Object Size"},
    {field: "operationCount", title: "Operation Count"},
    {field: "totalTimeMs", title: "Cumulative Time (ms)"},
    {field: "averageReadWriteTimeMs", title: "Average Read/Write Time (ms)"},
    {field: "averageReadTimeMs", title: "Average Read Time (ms)"},
    {field: "averageWriteTimeMs", title: "Average Write Time (ms)"},
    {field: "avgReadThroughputKbps", title: "Average Read Throughput (kBps)"},
    {field: "avgWriteThroughputKbps", title: "Average Write Throughput (kBps)"}
  ];

  /**
   * Generates a CSV file from load testers results.
   *
   * @param results
   *   The results of the load testing run.
   * @returns
   *   A string representation of the CVS containing the results.
   */
  public static generateCsv(results: ILoadTestResult[]): string {
    if (!Array.isArray(results)) {
      throw new Error("results must be an array");
    }

    const data = results
        .map((result: any) => {
          const row: any[] = [];
          CsvGenerator.Columns.forEach(col => {
            row.push(result[col.field]);
          })
         return row.join(",");
        });

    data.unshift(CsvGenerator.Columns.join(","));

    return data.join("\n");
  }
}