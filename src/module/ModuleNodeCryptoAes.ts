import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

const ALGO = 'aes-256-gcm';
import * as crypto from "crypto";

/**
 * This module uses the HTML5 WebCrypto APT to implement an AES 128
 * encryption algorithm.  More information on the WebCrypto API can
 * be found at:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export abstract class ModuleNodeCryptoAes extends SymmetricEncryptionBasedModule {

  private readonly _saltLen;
  private readonly _ivLen;
  private _derivedKey: Buffer | null = null;
  private readonly _keyLen: number;
  private readonly _algo: string;

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(moduleId: string, secret: string, algo: string, keyLen: number) {
    super(moduleId, secret);
    this._saltLen = 32;
    this._ivLen = 12;
    this._algo = algo;
    this._keyLen = keyLen;
  }

  public init(): Promise<void> {
    const salt = crypto.randomBytes(this._saltLen);
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(this._encryptionSecret, salt, 100000, this._keyLen, "sha256",
          (err: Error | null, derivedKey: Buffer) => {
            if (err) {
              reject(err);
            } else {
              this._derivedKey = derivedKey;
              resolve();
            }
          });
    })
  }

  protected _encryptSerializedDocument(plainText: Uint8Array): Promise<Uint8Array> {
    const salt = new Uint8Array(crypto.randomBytes(this._saltLen));
    const saltedData = new Uint8Array(plainText.length + salt.length);
    saltedData.set(salt);
    saltedData.set(plainText, salt.length);

    const iv = crypto.randomBytes(this._ivLen);
    const cipher = crypto.createCipheriv(this._algo, this._derivedKey!, iv);
    const encryptedData = cipher.update(saltedData);
    cipher.final();

    const payload = new Uint8Array(Buffer.concat([iv, encryptedData]));
    return Promise.resolve(payload);
  }

  protected _decryptSerializedDocument(cipherText: Uint8Array): Promise<Uint8Array> {
    const iv = cipherText.slice(0, this._ivLen);
    const encryptedData = cipherText.slice(this._ivLen);
    const decipher = crypto.createDecipheriv(this._algo, this._derivedKey!, iv);
    const decryptedContent = decipher.update(encryptedData);

    const saltedData = new Uint8Array(decryptedContent);
    const plainText = saltedData.slice(this._saltLen);

    return Promise.resolve(plainText)

  }
}
