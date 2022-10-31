import * as CryptoJS from "crypto-js";
import {ModuleCryptoJs} from "./ModuleCryptoJs";

/**
 * This class provides a base for modules that implement an AES
 * encryption scheme using CryptoJS.
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

  /**
   * @inheritDoc
   */
  protected _encrypt(plainText: CryptoJS.lib.WordArray,
                     key: CryptoJS.lib.WordArray,
                     iv: CryptoJS.lib.WordArray): CryptoJS.lib.CipherParams {
    return CryptoJS.AES.encrypt(plainText, key, {iv: iv});
  }

  /**
   * @inheritDoc
   */
  protected _decrypt(cipherText: CryptoJS.lib.CipherParams,
                     key: CryptoJS.lib.WordArray,
                     iv: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
    return CryptoJS.AES.decrypt(cipherText, key, {iv: iv});
  }
}
