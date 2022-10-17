import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

import RC5  from "rc5";
import {RandomStringGenerator} from "../util";


/**
 */
export class ModuleRC5 extends SymmetricEncryptionBasedModule {

  static readonly MODULE_ID = "RC5 (rc5 npm)";

  private _rc5: RC5 | null;
  private readonly _rounds: number;
  private readonly _blockSize: 16 | 32 | 64;

  constructor() {
    super(ModuleRC5.MODULE_ID);
    this._rounds = 255;
    this._blockSize = 64;
    this._rc5 = null;
  }

  public createRandomEncryptionSecret(): Promise<string> {
    return Promise.resolve(RandomStringGenerator.generate(255));
  }

  public init(encryptionSecret: string): Promise<void>  {
    this._rc5 = new RC5(encryptionSecret, this._blockSize, this._rounds);
    return Promise.resolve();
  }


  protected _encryptSerializedDocument(plainText: Uint8Array): Promise<Uint8Array> {
    const encrypted = this._rc5!.encrypt(Buffer.from(plainText));
    return Promise.resolve(new Uint8Array(encrypted));
  }

  protected _decryptSerializedDocument(cipherText: Uint8Array): Promise<Uint8Array> {
    const decrypted = this._rc5!.decrypt(Buffer.from(cipherText));
    return Promise.resolve(new Uint8Array(decrypted));
  }
}
