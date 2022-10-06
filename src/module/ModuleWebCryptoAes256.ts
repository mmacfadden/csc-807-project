import {ModuleWebCryptoAes} from "./ModuleWebCryptoAes";

/**
 * This module uses the HTML5 WebCrypto APT to implement an AES 256
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
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(globalThis.crypto, ModuleWebCryptoAes256.MODULE_ID, secret, 256);
  }
}
