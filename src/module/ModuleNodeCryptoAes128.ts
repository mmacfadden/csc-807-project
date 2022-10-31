import {ModuleNodeCrypto} from "./ModuleNodeCrypto";


/**
 * This module uses the CryptoJS library to implement  AES 128-bit
 * encryption.  More information on Node Crypto can be found at:
 *    https://nodejs.org/api/crypto.html
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleNodeCryptoAes128 extends ModuleNodeCrypto {
  static readonly MODULE_ID = "AES 128 (node-crypto)";

  /**
   * Creates a new ModuleNodeCryptoAes128 instance.
   */
  constructor() {
    super(ModuleNodeCryptoAes128.MODULE_ID, 'aes-128-gcm', 16);
  }
}
