// TODO update encryption API to perhaps return a Uint8Array instead of
//  a base64 encoded string.
/**
 * The base class of all Storage Encryption modules that facilitate
 * encrypted storage to the HTML5 WebStorage API.
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
   * Asynchronously encrypts string data.
   *
   * @param plainText
   *   The unencrypted text to encrypt.
   */
  public abstract encrypt(plainText: string): Promise<any>;

  /**
   * Asynchronously decrypts string data.
   *
   * @param cypherText
   *   The encrypted text to decrypt.
   */
  public abstract decrypt(cypherText: any): Promise<string>;

  /**
   * A helper method that subclasses can override if they need
   * to initialize any data asynchronously before being ready
   * to encrypt / decrypt data.
   */
  public async init(): Promise<void> {
    // no-op in this base class.
    return;
  }
}