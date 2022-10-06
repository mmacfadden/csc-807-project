/**
 * Represents the configuration that defines how data will be encrypted
 * in storage.
 */
export interface IEncryptionConfig {
  /**
   * The module id of the encryption module to use.
   */
  moduleId: string;

  /**
   * The symmetric secret used for the encryption.
   */
  secret: string;
}