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
    console.log(result.salt);
    const cipherText = CryptoJS.lib.WordArray.create().concat(result.salt).concat(result.ciphertext);
    const bytes =  CryptoJsUtils.convertWordArrayToUint8Array(cipherText);
    return bytes
  }

  /**
   * @inheritDoc
   */
  protected async _decryptSerializedDocument(cipherText: Uint8Array): Promise<Uint8Array> {
    const ciphertextWords = CryptoJsUtils.convertUint8ArrayToWordArray(cipherText);
    const salt = CryptoJS.lib.WordArray.create(ciphertextWords.words.slice(0, 2));
    ciphertextWords.words.splice(0, 2);
    ciphertextWords.sigBytes -= 8;
    const params =  CryptoJS.lib.CipherParams.create({ ciphertext: ciphertextWords, salt: salt });
    const ptWords = this._decrypt(params, this._encryptionSecret);
    const ptBytes =  CryptoJsUtils.convertWordArrayToUint8Array(ptWords);
    return ptBytes;
  }

  protected abstract _encrypt(plainText: CryptoJS.lib.WordArray, secret: string): CryptoJS.lib.CipherParams;

  protected abstract _decrypt(cipherText: CryptoJS.lib.CipherParams, secret: string): CryptoJS.lib.WordArray;

}
