import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

/**
 */
export abstract class ModuleCryptoJs extends SymmetricEncryptionBasedModule {

  /**
   * @inheritDoc
   */
   protected async _encryptSerializedDocument(plainText: string): Promise<Uint8Array> {
    const result =this._encrypt(plainText, this._encryptionSecret);
    const encoded = CryptoJS.enc.Base64.parse(result.toString());
    return CryptoJsUtils.convertWordArrayToUint8Array(encoded);;
  }

  /**
   * @inheritDoc
   */
  protected  async _decryptSerializedDocumentString(cipherText: Uint8Array): Promise<string> {
    const words = CryptoJsUtils.convertUint8ArrayToWordArray(cipherText);
    const encoded = CryptoJS.enc.Base64.stringify(words);
    const bytes = this._decrypt(encoded, this._encryptionSecret);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  protected abstract _encrypt(plainText: string, secret: string): CryptoJS.lib.CipherParams;

  protected abstract _decrypt(cipherText: string, secret: string): CryptoJS.lib.WordArray;

}
