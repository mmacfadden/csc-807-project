import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

/**
 * The ModuleCryptoJs class served as base class for all encryption modules
 * that are derived from the CryptoJS library.
 *
 * https://cryptojs.gitbook.io/docs/
 */
export abstract class ModuleCryptoJs extends SymmetricEncryptionBasedModule {
  /**
   * The number of bytes the key is.
   * @private
   */
  private readonly _keyBytes: number;

  /**
   * The number of bytes the initialization vector is.
   * @private
   */
  private readonly _ivBytes: number;

  /**
   * The encryption key represented as a Word Array.
   * @private
   */
  private _key: CryptoJS.lib.WordArray | null;

  /**
   * Creates a new ModuleCryptoJs instance.
   *
   * @param moduleId
   *   The unique id of the module.
   *
   * @param keyBits
   *   The length of the modules key in bits.
   */
  protected constructor(moduleId: string, keyBits: number) {
    super(moduleId);
    this._keyBytes = keyBits / 8;
    this._ivBytes = 12;
    this._key = null;
  }

  /**
   * @inheritDoc
   */
  public createRandomEncryptionSecret(): string {
    const key = CryptoJS.lib.WordArray.random(this._keyBytes);
    return CryptoJS.enc.Base64.stringify(key);
  }

  /**
   * @inheritDoc
   */
  public init(encryptionSecret: string, moduleParams?: any): void {
    super.init(encryptionSecret, moduleParams);
    this._key = CryptoJS.enc.Base64.parse(encryptionSecret);
  }

  /**
   * @inheritDoc
   */
  protected _encryptSerializedDocument(plainText: Uint8Array): Uint8Array {
    const ptWords = CryptoJsUtils.convertUint8ArrayToWordArray(plainText);
    const iv = CryptoJS.lib.WordArray.random(this._ivBytes);
    const result = this._encrypt(ptWords, this._key!, iv);
    const cipherText = CryptoJS.lib.WordArray.create().concat(iv).concat(result.ciphertext);
    return CryptoJsUtils.convertWordArrayToUint8Array(cipherText);
  }

  /**
   * @inheritDoc
   */
  protected _decryptSerializedDocument(cipherText: Uint8Array): Uint8Array {
    const ivLen = this._ivBytes / 4;
    const ciphertextWords = CryptoJsUtils.convertUint8ArrayToWordArray(cipherText);
    const iv = CryptoJS.lib.WordArray.create(ciphertextWords.words.slice(0, ivLen));
    ciphertextWords.words.splice(0, ivLen);
    ciphertextWords.sigBytes -= this._ivBytes;
    const params = CryptoJS.lib.CipherParams.create({ciphertext: ciphertextWords});
    const ptWords = this._decrypt(params, this._key!, iv);
    return CryptoJsUtils.convertWordArrayToUint8Array(ptWords);
  }

  /**
   * Perform the encryption of the binary plain text data.
   *
   * @param plainText
   *   The plain text data represented as a binary word array.
   * @param key
   *   The encryption key to use to encrypt the data.
   * @param iv
   *   The random initialization vector to use.
   *
   * @protected
   */
  protected abstract _encrypt(plainText: CryptoJS.lib.WordArray,
                              key: CryptoJS.lib.WordArray,
                              iv: CryptoJS.lib.WordArray): CryptoJS.lib.CipherParams;

  /**
   * Perform the decryption of the binary plain text data.
   *
   * @param cipherText
   *   The cipher text data represented as a binary word array.
   * @param key
   *   The encryption key that was used to encrypt the data.
   * @param iv
   *   The random initialization vector to used to encrypt the data.
   *
   * @protected
   */
  protected abstract _decrypt(cipherText: CryptoJS.lib.CipherParams,
                              key: CryptoJS.lib.WordArray,
                              iv: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray;
}
