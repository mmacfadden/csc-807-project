import {ModuleWebCryptoAes} from "./ModuleWebCryptoAes";

/**
 * This module uses the HTML5 WebCrypto APT to implement an AES 128
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
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(globalThis.crypto, ModuleWebCryptoAes128.MODULE_ID, secret, 128);
  }
}
