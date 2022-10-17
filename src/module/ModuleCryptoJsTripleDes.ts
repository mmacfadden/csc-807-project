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
   * Creates a new ModuleCryptoJsTripleDes instance.
   */
  constructor() {
    super(ModuleCryptoJsTripleDes.MODULE_ID, 128);
  }


  protected _encrypt(plainText: CryptoJS.lib.WordArray,
                     key: CryptoJS.lib.WordArray,
                     iv: CryptoJS.lib.WordArray): CryptoJS.lib.CipherParams {
    return CryptoJS.TripleDES.encrypt(plainText, key, {iv: iv});
  }

  protected _decrypt(cipherText: CryptoJS.lib.CipherParams,
                     key: CryptoJS.lib.WordArray,
                     iv: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
    return CryptoJS.TripleDES.decrypt(cipherText, key, {iv: iv});
  }
}
