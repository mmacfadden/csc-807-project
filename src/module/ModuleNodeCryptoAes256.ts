import {ModuleNodeCryptoAes} from "./ModuleNodeCryptoAes";

/**
 * This module uses the HTML5 WebCrypto APT to implement an AES 128
 * encryption algorithm.  More information on the WebCrypto API can
 * be found at:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleNodeCryptoAes256 extends ModuleNodeCryptoAes {
  static readonly MODULE_ID = "AES 256 (node-crypto)";

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleNodeCryptoAes256.MODULE_ID, secret, 'aes-256-gcm', 32);
  }
}
