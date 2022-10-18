import {ModuleNodeCrypto} from "./ModuleNodeCrypto";


export class ModuleNodeCryptoAes256 extends ModuleNodeCrypto {
  static readonly MODULE_ID = "AES 256 (node-crypto)";

  /**
   * Creates a new ModuleNodeCryptoAes256 instance.
   */
  constructor() {
    super(ModuleNodeCryptoAes256.MODULE_ID, 'aes-256-gcm', 32);
  }
}
