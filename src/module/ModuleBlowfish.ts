import Blowfish from "egoroof-blowfish";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {RandomStringGenerator} from "../util";

/**
 * Implements the Blowfish encryption algorithm using the 'egoroof-blowfish'
 * npm module.  The source code can be found at:
 *    https://github.com/egoroof/blowfish
 *
 * More information on the Blowfish Cypher can be found her:
 *    https://en.wikipedia.org/wiki/Blowfish_(cipher)
 */
export class ModuleBlowfish extends SymmetricEncryptionBasedModule {
  public static readonly MODULE_ID = "Blowfish (egoroof)";

  private readonly _bf: Blowfish;

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleBlowfish.MODULE_ID, secret);
    this._bf = new Blowfish(this._encryptionSecret, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
    this._bf.setIv(RandomStringGenerator.generate(8));
  }

  /**
   * @inheritDoc
   */
  public async encrypt(plainText: string): Promise<string> {
    return Buffer.from(this._bf.encode(plainText)).toString("base64");
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: string): Promise<string> {
    const data = Uint8Array.from(Buffer.from(cypherText, "base64"))
    return this._bf.decode(data, Blowfish.TYPE.STRING);
  }
}
