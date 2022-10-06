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
  public async encrypt(plainText: string): Promise<string> {
    const ptBytes = [...Buffer.from(plainText, "utf-8")];
    const ctBytes = this._twofish.encrypt(this._key, ptBytes);
    // There seems to be an issue when decrypting that that decrypted
    // data gets put into an array of the same size as the encrypted
    // data, which leaves 0's at the end. So we push on the length
    // of the pt data so we can truncated it later.
    const b64 = Buffer.from(ctBytes).toString("base64");
    return `${ptBytes.length}:${b64}`
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: string): Promise<string> {
    const [ptLen, b64] = cypherText.split(":");
    const ctBytes = [...Buffer.from(b64, "base64")];
    const length = Number(ptLen);
    const ptBytes = this._twofish.decrypt(this._key, ctBytes);
    const truncated = ptBytes.slice(0, length);
    return Buffer.from(truncated).toString("utf-8");
  }
}
