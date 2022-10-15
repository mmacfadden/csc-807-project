import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

/**
 */
export abstract class ModuleCryptoJs extends SymmetricEncryptionBasedModule {

  /**
   * @inheritDoc
   */
  protected async _encryptSerializedDocument(plainText: Uint8Array): Promise<Uint8Array> {
    const wordArray = CryptoJsUtils.convertUint8ArrayToWordArray(plainText);
    const result = this._encrypt(wordArray, this._encryptionSecret);
    const cipherText = CryptoJS.lib.WordArray.create().concat(result.salt).concat(result.ciphertext);
    return CryptoJsUtils.convertWordArrayToUint8Array(cipherText);
  }

  /**
   * @inheritDoc
   */
  protected async _decryptSerializedDocumentString(cipherText: Uint8Array): Promise<Uint8Array> {
    const ciphertextWords = CryptoJsUtils.convertUint8ArrayToWordArray(cipherText);
    const salt = CryptoJS.lib.WordArray.create(ciphertextWords.words.slice(0, 2));
    ciphertextWords.words.splice(0, 2);
    ciphertextWords.sigBytes -= 16;
    const params =  CryptoJS.lib.CipherParams.create({ ciphertext: ciphertextWords, salt: salt });
    const bytes = this._decrypt(params, this._encryptionSecret);
    return CryptoJsUtils.convertWordArrayToUint8Array(bytes);
  }

  protected abstract _encrypt(plainText: CryptoJS.lib.WordArray, secret: string): CryptoJS.lib.CipherParams;

  protected abstract _decrypt(cipherText: CryptoJS.lib.CipherParams, secret: string): CryptoJS.lib.WordArray;

}
