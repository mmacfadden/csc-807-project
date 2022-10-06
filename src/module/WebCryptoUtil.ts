/**
 * A helper class that provides convenience methods to derive a Password
 * key from a user password using the WebCrypto API.
 */
export class WebCryptoUtil {

  /**
   * Derives a password key from a user password. This method takes the Crypto
   * object to use rather than using the global namespace since how to access
   * the WebCrypto API depends on which JavaScript environment you are in.
   *
   * @param crypto
   *   The Cyprto object to use.
   * @param password
   *   The password to derive the key from.
   * @param salt
   *   The salt to use to make the key more resistant to a dictionary attack.
   * @param keyLength
   *   The length of the key to generate.
   *
   * @returns A promise, resolved with the derived CryptoKey.
   */
  public static async deriveKey(crypto: Crypto, password: string, salt: Uint8Array, keyLength: number): Promise<CryptoKey> {
    const passwordAsBytes = Buffer.from(password, "utf-8");
    const passwordKey: CryptoKey = await crypto.subtle.importKey(
      "raw",
      passwordAsBytes,
      "PBKDF2",
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: {name: "SHA-256"}
      },
      passwordKey,
      {name: "AES-GCM", length: keyLength},
      false,
      ['encrypt', 'decrypt']
    );
  }
}