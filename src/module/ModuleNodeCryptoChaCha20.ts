import {ModuleNodeCrypto} from "./ModuleNodeCrypto";


// https://www.derpturkey.com/chacha20poly1305-aead-with-node-js/
// https://nordpass.com/blog/xchacha20-encryption-vs-aes-256/

export class ModuleNodeCryptoChaCha20 extends ModuleNodeCrypto {
  static readonly MODULE_ID = "ChaCha20 (node-crypto)";

  /**
   * Creates a new ModuleNodeCryptoAes256 instance.
   */
  constructor() {
    super(ModuleNodeCryptoChaCha20.MODULE_ID, 'chacha20-poly1305', 32);
  }
}
