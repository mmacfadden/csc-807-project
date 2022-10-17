import {ModuleNodeCryptoAes} from "./ModuleNodeCryptoAes";


export class ModuleNodeCryptoAes128 extends ModuleNodeCryptoAes {
  static readonly MODULE_ID = "AES 128 (node-crypto)";

  /**
   * Creates a new ModuleNodeCryptoAes128 instance.
   */
  constructor() {
    super(ModuleNodeCryptoAes128.MODULE_ID, 'aes-128-gcm', 16);
  }
}
