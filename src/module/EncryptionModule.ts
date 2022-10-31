/**
 * The base class of all IndexedDB Encryption modules that facilitate
 * encrypted storage to the HTML5 IndexedDB API.
 */
export abstract class EncryptionModule {
  private readonly _id: string;

  /**
   * Creates a new instance.
   *
   * @param moduleId
   *   The unique id of this encryption module.
   */
  protected constructor(moduleId: string) {
    this._id = moduleId;
  }

  /**
   * The unique module id.
   */
  public moduleId(): string {
    return this._id;
  }

  /**
   * Creates a random encryption secret that this module will use to encrypt
   * and decrypt data.
   *
   * @param moduleParams
   *   Module specific parameters used to create the encryption secret.
   */
  public abstract createRandomEncryptionSecret(moduleParams?: any): string;

  /**
   * A helper method that subclasses can override if they need
   * to initialize any data asynchronously before being ready
   * to encrypt / decrypt data.
   */
  public abstract init(encryptionSecret: string, moduleParams?: any): void;

  /**
   * Asynchronously encrypts a JavaScript object.
   *
   * @param document
   *   The unencrypted data to encrypt.
   */
  public abstract encrypt(document: any): any;

  /**
   * Asynchronously decrypts object data.
   *
   * @param cipherText
   *   The encrypted text to decrypt.
   */
  public abstract decrypt(cipherText: any): any;
}