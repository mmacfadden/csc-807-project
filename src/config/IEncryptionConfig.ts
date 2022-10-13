/**
 * Represents the configuration that defines how data will be encrypted
 * within IndexedDB.
 */
export interface IEncryptionConfig {
  /**
   * The module id of the encryption module to use.
   */
  moduleId: string;

  /**
   * Option module specific parameters.
   */
  moduleParams?: any;

  /**
   * The symmetric secret used for encrypting the documents within IndexedDB.
   */
  dataSecret: string;

  /**
   * The key used for Order Preserving Encryption that is used for encrypting
   * keys and indices that need to support range queries.
   */
  opeKey: string;
}