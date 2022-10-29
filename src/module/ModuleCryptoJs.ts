import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

/**
 */
export abstract class ModuleCryptoJs extends SymmetricEncryptionBasedModule {
  private readonly _keyBytes: number;
  private readonly _ivBytes: number;
  private _key: CryptoJS.lib.WordArray | null;

  /**
   * Creates a new ModuleCryptoJs instance.
   *
   * @param moduleId
   * @param keyBits
   */
  protected constructor(moduleId: string, keyBits: number) {
    super(moduleId);
    this._keyBytes = keyBits / 8;
    this._ivBytes = 12;
    this._key = null;
  }

  public createRandomEncryptionSecret(): string {
    const key = CryptoJS.lib.WordArray.random(this._keyBytes);
    return CryptoJS.enc.Base64.stringify(key);
  }

  public init(encryptionSecret: string): void {
    this._key = CryptoJS.enc.Base64.parse(encryptionSecret);
  }

  /**
   * @inheritDoc
   */
  protected _encryptSerializedDocument(plainText: Uint8Array): Uint8Array {
    const wordArray = CryptoJsUtils.convertUint8ArrayToWordArray(plainText);
    const iv = CryptoJS.lib.WordArray.random(this._ivBytes);
    const result = this._encrypt(wordArray, this._key!, iv);
    const cipherText = CryptoJS.lib.WordArray.create().concat(iv).concat(result.ciphertext);
    return CryptoJsUtils.convertWordArrayToUint8Array(cipherText);
  }

  /**
   * @inheritDoc
   */
  protected _decryptSerializedDocument(cipherText: Uint8Array): Uint8Array {
    const ciphertextWords = CryptoJsUtils.convertUint8ArrayToWordArray(cipherText);
    const iv = CryptoJS.lib.WordArray.create(ciphertextWords.words.slice(0, 4));
    ciphertextWords.words.splice(0, this._ivBytes / 4);
    ciphertextWords.sigBytes -= this._ivBytes;
    const params =  CryptoJS.lib.CipherParams.create({ ciphertext: ciphertextWords });
    const ptWords = this._decrypt(params, this._key!, iv);
    return CryptoJsUtils.convertWordArrayToUint8Array(ptWords);
  }

  protected abstract _encrypt(plainText: CryptoJS.lib.WordArray,
                              key: CryptoJS.lib.WordArray,
                              iv: CryptoJS.lib.WordArray): CryptoJS.lib.CipherParams;

  protected abstract _decrypt(cipherText: CryptoJS.lib.CipherParams,
                              key: CryptoJS.lib.WordArray,
                              iv: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray;

}
