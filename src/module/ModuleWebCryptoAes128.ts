import {ModuleWebCryptoAes} from "./ModuleWebCryptoAes";

/**
 * This module uses the HTML5 WebCrypto API to implement an AES 128
 * encryption algorithm.  More information on the WebCrypto API can
 * be found at:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleWebCryptoAes128 extends ModuleWebCryptoAes {
  static readonly MODULE_ID = "AES 128 (WebCrypto API)";

  /**
   * Creates a new ModuleWebCryptoAes128 instance.
   *
   */
  constructor() {
    super(globalThis.crypto, ModuleWebCryptoAes128.MODULE_ID, 128);
  }
}
