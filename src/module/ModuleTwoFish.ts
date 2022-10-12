import {twofish, ITwoFish} from "twofish";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";


/**
 * This module uses the twofish npm module to implement the Twofish
 * encryption algorithm.  More information on the twofish library can be
 * found at:
 *    https://github.com/wouldgo/twofish
 *
 * Information about the Twofish Cypher can be found here:
 *    https://en.wikipedia.org/wiki/Twofish
 */
export class ModuleTwoFish extends SymmetricEncryptionBasedModule {
  public static readonly MODULE_ID = "TwoFish (wouldgo)";

  private readonly _twofish: ITwoFish;
  private readonly _key: number[];

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleTwoFish.MODULE_ID, secret);
    this._twofish = twofish();
    this._key = this._twofish.stringToByteArray(secret);
  }

  /**
   * @inheritDoc
   */
  protected async _encryptSerializedDocument(plainText: string): Promise<Uint8Array> {
    const ptBytes = [...Buffer.from(plainText, "utf-8")];
    const ctBytes = this._twofish.encrypt(this._key, ptBytes);
    const data = Uint8Array.from(ctBytes);
    // There seems to be an issue when decrypting that that decrypted
    // data gets put into an array of the same size as the encrypted
    // data, which leaves 0's at the end. So we push on the length
    // of the pt data so we can truncate it later.
    const len32BitArray = Int32Array.of(ptBytes.length);
    const result = new Uint8Array(len32BitArray.byteLength + data.length);
    result.set(len32BitArray);
    result.set(data, len32BitArray.byteLength);

    return result;
  }

  /**
   * @inheritDoc
   */
  protected async _decryptSerializedDocumentString(cipherText: Uint8Array): Promise<string> {
    const ptLenBytes = cipherText.slice(0, 4);
    const ptLen = (new Int32Array(ptLenBytes))[0];
    const ctBytes = cipherText.slice(4, cipherText.length);
    const ptBytes = this._twofish.decrypt(this._key, [...ctBytes]);
    const truncated = ptBytes.slice(0, ptLen);
    return Buffer.from(truncated).toString("utf-8");
  }
}
