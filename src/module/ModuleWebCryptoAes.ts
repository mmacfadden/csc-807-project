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
  private readonly _saltLen: number;
  private readonly _ivLen: number;

  /**
   * Creates a new ModuleWebCryptoAes instance.
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
    this._saltLen = 32;
    this._ivLen = 12;
  }

  /**
   * @inheritDoc
   */
  public async init(): Promise<void> {
    const salt = this._crypto.getRandomValues(new Uint8Array(this._saltLen));
    this._derivedKey = await WebCryptoUtil.deriveKey(this._crypto, this._encryptionSecret, salt, this._aesLength);
  }

  /**
   * @inheritDoc
   */
  protected async _encryptSerializedDocument(plainText: Uint8Array): Promise<Uint8Array> {
    const salt = this._crypto.getRandomValues(new Uint8Array(this._saltLen));

    const saltedData = new Uint8Array(plainText.length + salt.length);
    saltedData.set(salt)
    saltedData.set(plainText, salt.length);

    const iv = this._crypto.getRandomValues(new Uint8Array(this._ivLen));
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
  protected async _decryptSerializedDocument(cipherText: Uint8Array): Promise<Uint8Array> {
    const iv = cipherText.slice(0, this._ivLen);
    const data = cipherText.slice(this._ivLen);

    const decryptedContent = await this._crypto.subtle.decrypt(
        {name: "AES-GCM", iv},
        this._derivedKey!,
        data
    );

    const saltedData = new Uint8Array(decryptedContent);
    const decryptedData = saltedData.slice(this._saltLen);
    return decryptedData;
  }
}
