import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

/**
 */
export abstract class ModuleCryptoJs extends SymmetricEncryptionBasedModule {


  /**
   * @inheritDoc
   */
  public async encrypt(plainText: string): Promise<Uint8Array> {
    const result =this._encrypt(plainText, this._encryptionSecret);
    const encoded = CryptoJS.enc.Base64.parse(result.toString());
    return CryptoJsUtils.convertWordArrayToUint8Array(encoded);;
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: any): Promise<string> {
    if (cypherText instanceof Uint8Array) {
      const words = CryptoJsUtils.convertUint8ArrayToWordArray(cypherText);
      const encoded = CryptoJS.enc.Base64.stringify(words);
      const bytes = this._decrypt(encoded, this._encryptionSecret);
      return bytes.toString(CryptoJS.enc.Utf8);
    } else {
      throw new Error("unexpected ciphertext type");
    }
  }

  protected abstract _encrypt(plainText: string, secret: string): CryptoJS.lib.CipherParams;

  protected abstract _decrypt(cypherText: string, secret: string): CryptoJS.lib.WordArray;

}
