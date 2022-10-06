import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

/**
 * This module uses the CryptoJS library to implement  AES 128 bit
 * encryption.  More information on CryptoJS can be found at:
 *    https://github.com/brix/crypto-js
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleCryptoJsAes128 extends SymmetricEncryptionBasedModule {
  public static readonly MODULE_ID = "AES 128 (Crypto JS)";

  private readonly _derivedKey: CryptoJS.lib.WordArray;
  private readonly _iv: CryptoJS.lib.WordArray;

  /**
   * Creates a new ModuleCryptoJsAes128 instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleCryptoJsAes128.MODULE_ID, secret);
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    this._iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
    this._derivedKey = CryptoJS.PBKDF2(secret, salt, {keySize: 128 / 32});
  }

  /**
   * @inheritDoc
   */
  public async encrypt(plainText: string): Promise<string> {
    return CryptoJS.AES.encrypt(plainText, this._derivedKey, {iv: this._iv}).toString();
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: string): Promise<string> {
    const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(cypherText, this._derivedKey, {iv: this._iv});
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
