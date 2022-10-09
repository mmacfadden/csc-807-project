import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {WebCryptoUtil} from "./WebCryptoUtil";

/**
 * This module uses the HTML5 WebCrypto APT to implement an AES 256
 * encryption algorithm. This module creates a uniquely salted
 * symmetric key for each value to be encrypted. More information on the
 * WebCrypto API can be found at:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 */
// FIXME this whole class looks like it is out of date or something.
//  It doesn't inherit from the abstract AES class and therefore it has
//  duplicate code.
export class ModuleWebCryptoAes256SaltedKey extends SymmetricEncryptionBasedModule {
  static readonly MODULE_ID = "AES 256 (WebCrypto API w/ Salted Key)";

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleWebCryptoAes256SaltedKey.MODULE_ID, secret);
  }

  /**
   * @inheritDoc
   */
  public async encrypt(plainText: string): Promise<string> {
    const dataAsBytes = Buffer.from(plainText, "utf-8");
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const aesKey = await WebCryptoUtil.deriveKey(globalThis.crypto, this._encryptionSecret, salt, 256);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await crypto.subtle.encrypt({name: "AES-GCM", iv}, aesKey, dataAsBytes);
    const encryptedBytes = new Uint8Array(encryptedContent);
    const payload = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
    payload.set(salt)
    payload.set(iv, salt.length);
    payload.set(encryptedBytes, salt.length + iv.length);

    return Buffer.from(payload).toString("base64");
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: string): Promise<string> {
    const encryptedBytes = Uint8Array.from(Buffer.from(cypherText, "base64"));
    const salt = encryptedBytes.slice(0, 32);
    const iv = encryptedBytes.slice(32, 32 + 12);
    const data = encryptedBytes.slice(32 + 12);

    const aesKey = await WebCryptoUtil.deriveKey(globalThis.crypto, this._encryptionSecret, salt, 256);

    const decryptedContent = await crypto.subtle.decrypt(
      {name: "AES-GCM", iv},
      aesKey,
      data
    );

    const decryptedBytes = new Uint8Array(decryptedContent);
    return Buffer.from(decryptedBytes).toString("utf-8");
  }
}
