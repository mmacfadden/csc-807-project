import {ModuleNodeCrypto} from "./ModuleNodeCrypto";

/**
 * This module uses the CryptoJS library to implement AES 256-bit
 * encryption.  More information on Node Crypto can be found at:
 *    https://nodejs.org/api/crypto.html
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleNodeCryptoAes256 extends ModuleNodeCrypto {
  static readonly MODULE_ID = "AES 256 (node-crypto)";

  /**
   * Creates a new ModuleNodeCryptoAes256 instance.
   */
  constructor() {
    super(ModuleNodeCryptoAes256.MODULE_ID, 'aes-256-gcm', 32);
  }
}
