import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {WebCryptoUtil} from "./WebCryptoUtil";

/**
 * This module uses the HTML5 WebCrypto API to implement an AES
 * encryption algorithm.  The class is abstract because subclasses
 * must supply the length of AES encryption key (e.g. 128, 256, etc.).
 *
 * More information on the WebCrypto API can be found at:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export abstract class ModuleWebCryptoAes extends SymmetricEncryptionBasedModule {

  private _derivedKey: CryptoKey | null;
  private readonly _aesLength;
  private readonly _crypto: Crypto;

  /**
   * Creates a new ModuleBlowfish instance.
   * @param crypto
   *   The crypto instance to use to perform encryption.
   * @param moduleId
   *   The unique module id for this type of encryption module.
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   * @param aesLength
   *   The length of the AES encryption key.
   */
  protected constructor(crypto: Crypto, moduleId: string, secret: string, aesLength: number) {
    super(moduleId, secret);
    this._aesLength = aesLength;
    this._derivedKey = null;
    this._crypto = crypto;
  }

  /**
   * @inheritDoc
   */
  public async init(): Promise<void> {
    const salt = this._crypto.getRandomValues(new Uint8Array(32));
    this._derivedKey = await WebCryptoUtil.deriveKey(this._crypto, this._encryptionSecret, salt, this._aesLength);
  }

  /**
   * @inheritDoc
   */
  public async encrypt(plainText: string): Promise<Uint8Array> {
    const dataAsBytes = Buffer.from(plainText, "utf-8");
    const salt = this._crypto.getRandomValues(new Uint8Array(32));

    const saltedData = new Uint8Array(dataAsBytes.length + salt.length);
    saltedData.set(salt)
    saltedData.set(dataAsBytes, salt.length);

    const iv = this._crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await this._crypto.subtle.encrypt({name: "AES-GCM", iv}, this._derivedKey!, saltedData);
    const encryptedBytes = new Uint8Array(encryptedContent);

    const payload = new Uint8Array(iv.length + encryptedBytes.length);
    payload.set(iv);
    payload.set(encryptedBytes, iv.length);

    return payload;
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: any): Promise<string> {
    if (cypherText instanceof Uint8Array) {
      const iv = cypherText.slice(0, 12);
      const data = cypherText.slice(12);

      const decryptedContent = await this._crypto.subtle.decrypt(
          {name: "AES-GCM", iv},
          this._derivedKey!,
          data
      );

      const saltedData = new Uint8Array(decryptedContent);
      const decryptedData = saltedData.slice(32);
      return Buffer.from(decryptedData).toString("utf-8");
    } else {
      // FIXME message
      throw new Error();
    }
  }
}