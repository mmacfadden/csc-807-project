import {ModuleCryptoJsAes} from "./ModuleCryptoJsAes";

/**
 * This module uses the CryptoJS library to implement  AES 256-bit
 * encryption.  More information on CryptoJS can be found at:
 *    https://github.com/brix/crypto-js
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleCryptoJsAes256 extends ModuleCryptoJsAes {
  static readonly MODULE_ID = "AES 256 (Crypto JS)";

  /**
   * Creates a new ModuleCryptoJsAes256 instance.
   */
  constructor() {
    super(ModuleCryptoJsAes256.MODULE_ID, 256);
  }
}
