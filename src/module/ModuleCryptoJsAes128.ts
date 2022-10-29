import {ModuleCryptoJsAes} from "./ModuleCryptoJsAes";

/**
 * This module uses the CryptoJS library to implement  AES 128 bit
 * encryption.  More information on CryptoJS can be found at:
 *    https://github.com/brix/crypto-js
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleCryptoJsAes128 extends ModuleCryptoJsAes {
  public static readonly MODULE_ID = "AES 128 (Crypto JS)";


  /**
   * Creates a new ModuleCryptoJsAes128 instance.
   */
  constructor() {
    super(ModuleCryptoJsAes128.MODULE_ID, 128);
  }
}
