import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

/**
 * This module uses the CryptoJS library to implement  AES 256 bit
 * encryption.  More information on CryptoJS can be found at:
 *    https://github.com/brix/crypto-js
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleCryptoJsAes256 extends SymmetricEncryptionBasedModule {
  static readonly MODULE_ID = "AES 256 (Crypto JS)";

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleCryptoJsAes256.MODULE_ID, secret);
  }

  /**
   * @inheritDoc
   */
  public async encrypt(plainText: string): Promise<string> {
    return CryptoJS.AES.encrypt(plainText, this._encryptionSecret).toString();
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: string): Promise<string> {
    const bytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(cypherText, this._encryptionSecret);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
