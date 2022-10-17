import {EncryptionModule} from "./EncryptionModule";
import {encode, decode} from "@msgpack/msgpack";

/**
 * An abstract base class for symmetric key encryption.
 */
export abstract class SymmetricEncryptionBasedModule extends EncryptionModule {

  /**
   * Creates a new module.
   *
   * @param moduleId
   *   The unique module id for this type of encryption module.
   */
  protected constructor(moduleId: string) {
    super(moduleId);
  }

  /**
   * Asynchronously encrypts a JavaScript object.
   *
   * @param plainText
   *   The unencrypted data to encrypt.
   */
  public encrypt(plainText: any): Promise<Uint8Array> {
    const serialized = encode(plainText);
    return this._encryptSerializedDocument(serialized);
  }

  /**
   * Asynchronously decrypts object data.
   *
   * @param cipherText
   *   The encrypted text to decrypt.
   */
  public decrypt(cipherText: Uint8Array): Promise<any> {
    return this._decryptSerializedDocument(cipherText)
        .then(deserialized => {
          return decode(deserialized);
        });
  }

  protected abstract _encryptSerializedDocument(plaintext: Uint8Array): Promise<Uint8Array>;

  protected abstract _decryptSerializedDocument(ciphertext: Uint8Array): Promise<Uint8Array>;
}
