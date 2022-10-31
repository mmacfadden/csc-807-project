import {ModuleNodeCrypto} from "./ModuleNodeCrypto";




/**
 * This module uses the CryptoJS library to implement ChaCha20
 * encryption.  More information on Node Crypto can be found at:
 *    https://nodejs.org/api/crypto.html
 *
 * Information about the ChaCha20 Cypher can be found here:
 *    https://www.derpturkey.com/chacha20poly1305-aead-with-node-js/
 *    https://nordpass.com/blog/xchacha20-encryption-vs-aes-256/
 */
export class ModuleNodeCryptoChaCha20 extends ModuleNodeCrypto {
  static readonly MODULE_ID = "ChaCha20 (node-crypto)";

  /**
   * Creates a new ModuleNodeCryptoChaCha20 instance.
   */
  constructor() {
    super(ModuleNodeCryptoChaCha20.MODULE_ID, 'chacha20-poly1305', 32);
  }
}
