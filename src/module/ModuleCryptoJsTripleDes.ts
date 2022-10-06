import * as CryptoJS from "crypto-js";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

/**
 * This module uses the CryptoJS library to implement the TripleDES
 * encryption algorithm.  More information on CryptoJS can be found at:
 *    https://github.com/brix/crypto-js
 *
 * Information about the AES Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Triple_DES
 */
export class ModuleCryptoJsTripleDes extends SymmetricEncryptionBasedModule {
  static readonly MODULE_ID = "Triple DES (Crypto JS)";

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleCryptoJsTripleDes.MODULE_ID, secret);
  }

  /**
   * @inheritDoc
   */
  public async encrypt(plainText: string): Promise<string> {
    return CryptoJS.TripleDES.encrypt(plainText, this._encryptionSecret).toString();
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: string): Promise<string> {
    const bytes = CryptoJS.TripleDES.decrypt(cypherText, this._encryptionSecret);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
