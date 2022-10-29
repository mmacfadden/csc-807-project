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

  private _bf: Blowfish | null;

  /**
   * Creates a new ModuleBlowfish instance.
   */
  constructor() {
    super(ModuleBlowfish.MODULE_ID);
    this._bf = null

  }

  /**
   * @inheritDoc
   */
  public _encryptSerializedDocument(plainText: Uint8Array): Uint8Array {
    return this._bf!.encode(plainText);
  }

  /**
   * @inheritDoc
   */
  public _decryptSerializedDocument(cipherText: Uint8Array): Uint8Array {
    return this._bf!.decode(cipherText, Blowfish.TYPE.UINT8_ARRAY);
  }

  public createRandomEncryptionSecret(): string {
    const key = RandomStringGenerator.generate(32);
    const iv = RandomStringGenerator.generate(8);
    return iv + key;
  }

  public init(encryptionSecret: string): void {
    const iv = encryptionSecret.slice(0, 8);
    const key = encryptionSecret.slice(8);
    this._bf = new Blowfish(key, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
    this._bf.setIv(iv);
  }
}
