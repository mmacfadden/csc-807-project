/**
 * Represents a single load tests result.
 */
export interface ILoadTestResult {
  /**
   * The id of the EncryptionModule used in the test.
   */
  moduleId: string;

  /**
   * The number of read/write operations performed.
   */
  operationCount: number;

  averageDocumentSize: number;

  /**
   * The total time reading and writing in milliseconds.
   */
  totalTimeMs: number;

  /**
   * The average time of a read operation in milliseconds.
   */
  averageReadTimeMs: number;

  /**
   * The average time of a write operation in milliseconds.
   */
  averageWriteTimeMs: number;

  /**
   * The average time of for a write followed by a read in milliseconds.
   */
  averageReadWriteTimeMs: number;

  /**
   * The average read throughput in kBps.
   */
  avgReadThroughputKbps: number;

  /**
   * The average write throughput in kBps.
   */
  avgWriteThroughputKbps: number;
}