import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

import RC5  from "rc5";
import {RandomStringGenerator} from "../util";

// TODO evaluate the number of rounds.

/**
 * Implements the RC5 symmetric-key block cipher.
 *   https://en.wikipedia.org/wiki/RC5
 */
export class ModuleRC5 extends SymmetricEncryptionBasedModule {

  static readonly MODULE_ID = "RC5 (rc5 npm)";

  /**
   * The RC5 instance used to encrypt / decrypt data.
   * @private
   */
  private _rc5: RC5 | null;

  /**
   * The number of rounds of encryption.
   * @private
   */
  private readonly _rounds: number;

  /**
   * The encryption block size.
   * @private
   */
  private readonly _blockSize: 16 | 32 | 64;

  /**
   * Constructs a new ModuleRC5 instance.
   */
  constructor() {
    super(ModuleRC5.MODULE_ID);
    this._rounds = 255;
    this._blockSize = 64;
    this._rc5 = null;
  }

  /**
   * @inheritDoc
   */
  public createRandomEncryptionSecret(): string {
    return RandomStringGenerator.generate(255);
  }

  /**
   * @inheritDoc
   */
  public init(encryptionSecret: string, moduleParams?: any): void  {
    super.init(encryptionSecret, moduleParams);
    this._rc5 = new RC5(encryptionSecret, this._blockSize, this._rounds);
  }

  /**
   * @inheritDoc
   */
  protected _encryptSerializedDocument(plainText: Uint8Array): Uint8Array {
    const encrypted = this._rc5!.encrypt(Buffer.from(plainText));
    return new Uint8Array(encrypted);
  }

  /**
   * @inheritDoc
   */
  protected _decryptSerializedDocument(cipherText: Uint8Array): Uint8Array {
    const decrypted = this._rc5!.decrypt(Buffer.from(cipherText));
    return new Uint8Array(decrypted);
  }
}
