import * as CryptoJS from "crypto-js";
import {ModuleCryptoJs} from "./ModuleCryptoJs";

/**
 * This module uses the CryptoJS library to implement the TripleDES
 * encryption algorithm.  More information on CryptoJS can be found at:
 *    https://github.com/brix/crypto-js
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Triple_DES
 */
export class ModuleCryptoJsTripleDes extends ModuleCryptoJs {
  static readonly MODULE_ID = "Triple DES (Crypto JS)";

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleCryptoJsTripleDes.MODULE_ID, secret);
  }

  protected _decrypt(cipherText: string, secret: string): CryptoJS.lib.WordArray {
    return CryptoJS.TripleDES.decrypt(cipherText, this._encryptionSecret);
  }

  protected _encrypt(plainText: string, secret: string): CryptoJS.lib.CipherParams {
    return CryptoJS.TripleDES.encrypt(plainText, this._encryptionSecret);
  }
}
