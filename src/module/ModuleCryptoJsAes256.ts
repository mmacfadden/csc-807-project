import * as CryptoJS from "crypto-js";
import {ModuleCryptoJs} from "./ModuleCryptoJs";

/**
 * This module uses the CryptoJS library to implement  AES 256 bit
 * encryption.  More information on CryptoJS can be found at:
 *    https://github.com/brix/crypto-js
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleCryptoJsAes256 extends ModuleCryptoJs {
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

  protected _decrypt(cipherText: CryptoJS.lib.CipherParams, secret: string): CryptoJS.lib.WordArray {
    return CryptoJS.AES.decrypt(cipherText, secret);
  }

  protected _encrypt(plainText: CryptoJS.lib.WordArray, secret: string): CryptoJS.lib.CipherParams {
    return CryptoJS.AES.encrypt(plainText, secret);
  }
}
