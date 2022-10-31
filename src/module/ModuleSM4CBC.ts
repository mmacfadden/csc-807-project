import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import * as crypto from "crypto";
import {SM4} from 'gm-crypto';


/**
 * Implements the ShangMi 4 (SM4) block cipher provided by the gm-crypto
 * npm.  Information on the gm-crypto npm can be found here:
 *   https://github.com/byte-fe/gm-crypto
 *
 * Information on the SM4 cipher can be found here:
 *   https://en.wikipedia.org/wiki/SM4_(cipher)
 */
export class ModuleSM4CBC extends SymmetricEncryptionBasedModule {

  static readonly MODULE_ID = "SM4 CBC (gm-crypto npm)";

  /**
   * A helper method to create a random hex string.
   * @param digits
   *   The number of digits to generate.
   * @private
   */
  private static _randomHex(digits: number): string {
    return crypto.randomBytes(digits).toString("hex");
  }

  /**
   * The encryption key to use.
   * @private
   */
  private _key: string | null;

  constructor() {
    super(ModuleSM4CBC.MODULE_ID);
    this._key = null;
  }

  /**
   * @inheritDoc
   */
  public createRandomEncryptionSecret(): string {
    return ModuleSM4CBC._randomHex(16);
  }

  /**
   * @inheritDoc
   */
  public init(encryptionSecret: string, moduleParams?: any): void {
    super.init(encryptionSecret, moduleParams);
    this._key = encryptionSecret;
  }

  /**
   * @inheritDoc
   */
  protected _encryptSerializedDocument(plainText: Uint8Array): Uint8Array {
    const ivHex = ModuleSM4CBC._randomHex(16);
    const encryptedData =
        SM4.encrypt(plainText.buffer, this._key!, {iv: ivHex, mode: SM4.constants.CBC});

    const encryptedBytes = new Uint8Array(encryptedData);
    const ivBytes = Uint8Array.from(Buffer.from(ivHex, 'hex'));

    // This module seems to add zeros onto the end of the decrypted
    // data. So we have to push on a value that tells us how big the
    // data is.
    const len32BitArray = Int32Array.of(plainText.length);
    const ptLenBytes = new Uint8Array(len32BitArray.buffer);

    const result = new Uint8Array(ptLenBytes.length + encryptedBytes.length + ivBytes.length);
    result.set(ptLenBytes);
    result.set(ivBytes, ptLenBytes.length);
    result.set(encryptedBytes, ptLenBytes.length + ivBytes.length)

    return result;
  }

  /**
   * @inheritDoc
   */
  protected _decryptSerializedDocument(cipherText: Uint8Array): Uint8Array {
    const ptLen = (new Int32Array(cipherText.slice(0, 4).buffer))[0];
    const ivLen = 16;
    const ivBytes = cipherText.slice(4, 4 + ivLen);
    const ivHex = Buffer.from(ivBytes).toString('hex');

    const encryptedBytes = cipherText.slice(4 + ivLen);
    const decryptedData =
        SM4.decrypt(encryptedBytes.buffer, this._key!, {iv: ivHex, mode: SM4.constants.CBC});

    return new Uint8Array(decryptedData).slice(0, ptLen);
  }
}
