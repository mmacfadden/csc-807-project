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
  public static readonly MODULE_ID = "Blowfish CBC (egoroof)";
  public static readonly _IV_LEN = 8;
  public static readonly _KEY_LEN = 32;

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

  /**
   * @inheritDoc
   */
  public createRandomEncryptionSecret(): string {
    const key = RandomStringGenerator.generate(ModuleBlowfish._KEY_LEN);
    const iv = RandomStringGenerator.generate(ModuleBlowfish._IV_LEN);
    return iv + key;
  }

  /**
   * @inheritDoc
   */
  public init(encryptionSecret: string, moduleParams?: any): void {
    super.init(encryptionSecret, moduleParams);
    const iv = encryptionSecret.slice(0, ModuleBlowfish._IV_LEN);
    const key = encryptionSecret.slice(ModuleBlowfish._IV_LEN);
    this._bf = new Blowfish(key, Blowfish.MODE.CBC, Blowfish.PADDING.LAST_BYTE);
    this._bf.setIv(iv);
  }
}
