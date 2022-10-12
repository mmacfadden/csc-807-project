import {EncryptionModule} from "./EncryptionModule";

/**
 * An abstract base class for symmetric key encryption.
 */
export abstract class SymmetricEncryptionBasedModule extends EncryptionModule {
  /**
   * The symmetric encryption key.
   */
  protected readonly _encryptionSecret: string;

  /**
   * Creates a new module.
   *
   * @param moduleId
   *   The unique module id for this type of encryption module.
   * @param secret
   *   The encryption secret to use for symmetric encryption.
   */
  protected constructor(moduleId: string, secret: string) {
    super(moduleId);
    this._encryptionSecret = secret;
  }

  /**
   * Asynchronously encrypts a JavaScript object.
   *
   * @param plainText
   *   The unencrypted data to encrypt.
   */
  public encrypt(plainText: any): Promise<Uint8Array> {
    const serialized = JSON.stringify(plainText);
    return this._encryptSerializedDocument(serialized);
  }

  /**
   * Asynchronously decrypts object data.
   *
   * @param cipherText
   *   The encrypted text to decrypt.
   */
  public decrypt(cipherText: Uint8Array): Promise<any> {
    return this._decryptSerializedDocumentString(cipherText).then(deserialized => JSON.parse(deserialized));
  }

  protected abstract _encryptSerializedDocument(plaintext: string): Promise<Uint8Array>;

  protected abstract _decryptSerializedDocumentString(ciphertext: Uint8Array): Promise<string>;
}
