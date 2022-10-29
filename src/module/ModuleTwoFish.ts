import {twofish, ITwoFish} from "twofish";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {RandomStringGenerator} from "../util";


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
  private _key: number[] | null;

  /**
   * Creates a new ModuleBlowfish instance.
   */
  constructor() {
    super(ModuleTwoFish.MODULE_ID);
    this._twofish = twofish();
    this._key = null;
  }

  public createRandomEncryptionSecret(): string {
    return RandomStringGenerator.generate(32);
  }

  public init(encryptionSecret: string): void {
    this._key = this._twofish.stringToByteArray(encryptionSecret);
  }

  /**
   * @inheritDoc
   */
  protected _encryptSerializedDocument(plainText: Uint8Array): Uint8Array {
    const ptBytes = [...plainText];
    const ctBytes = this._twofish.encrypt(this._key!, ptBytes);
    const data = Uint8Array.from(ctBytes);

    // There seems to be an issue when decrypting that that decrypted
    // data gets put into an array of the same size as the encrypted
    // data, which leaves 0's at the end. So we push on the length
    // of the pt data so we can truncate it later.
    const len32BitArray = Int32Array.of(ptBytes.length);
    const ptLenBytes = new Uint8Array(len32BitArray.buffer);

    const result = new Uint8Array(len32BitArray.byteLength + data.length);
    result.set(ptLenBytes);
    result.set(data, len32BitArray.byteLength);

    return result;
  }

  /**
   * @inheritDoc
   */
  protected _decryptSerializedDocument(cipherText: Uint8Array): Uint8Array {
    const ptLen = new Int32Array(cipherText.buffer);
    const ctBytes = cipherText.slice(4);
    const ptBytes = this._twofish.decrypt(this._key!, [...ctBytes]);
    const truncated = ptBytes.slice(0, ptLen[0]);
    return new Uint8Array(truncated);
  }
}
