import {ModuleWebCryptoAes} from "./ModuleWebCryptoAes";

/**
 * This module uses the HTML5 WebCrypto API to implement an AES 256
 * encryption algorithm.  More information on the WebCrypto API can
 * be found at:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
export class ModuleWebCryptoAes256 extends ModuleWebCryptoAes {
  static readonly MODULE_ID = "AES 256 (WebCrypto API)";

  /**
   * Creates a new ModuleWebCryptoAes256 instance.
   *
   */
  constructor() {
    super(globalThis.crypto, ModuleWebCryptoAes256.MODULE_ID, 256);
  }
}
