import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {CryptoJsUtils} from "../util/CryptoJsUtils";
import {RandomStringGenerator} from "../util";
import {ModuleCryptoJs} from "./ModuleCryptoJs";


interface CipherOption {
  /**
   * The IV to use for this operation.
   */
  iv?: CryptoJS.lib.WordArray | undefined;
}

/**
 */
export abstract class ModuleCryptoJsAes extends ModuleCryptoJs {


  /**
   * Creates a new ModuleCryptoJs instance.
   *
   * @param moduleId
   * @param keyLen
   */
  protected constructor(moduleId: string, keyLen: number) {
    super(moduleId, keyLen);
  }

  protected _encrypt(plainText: CryptoJS.lib.WordArray,
                     key: CryptoJS.lib.WordArray,
                     iv: CryptoJS.lib.WordArray): CryptoJS.lib.CipherParams {
    return CryptoJS.AES.encrypt(plainText, key, {iv: iv});
  }

  protected _decrypt(cipherText: CryptoJS.lib.CipherParams,
                     key: CryptoJS.lib.WordArray,
                     iv: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
    return CryptoJS.AES.decrypt(cipherText, key, {iv: iv});
  }

}
