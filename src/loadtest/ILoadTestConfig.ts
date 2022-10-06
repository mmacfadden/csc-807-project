import {IEncryptionConfig} from "../config";
import {IObjectStoreConfig} from "./IObjectStoreConfig";

/**
 * Represents a single load test configuration.
 */
export interface ILoadTestConfig {
  /**
   * The encryption configuration to use for the test.
   */
  encryptionConfig: IEncryptionConfig;

  /**
   * The number of read / write operations to conduct.
   */
  operationCount: number;

  objectStoreConfig: IObjectStoreConfig;
}

