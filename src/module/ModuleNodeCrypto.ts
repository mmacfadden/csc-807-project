import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

import * as crypto from "crypto";

// TODO look at the auth tag and associated data mentioned in the ChaCha
//  20 link.
//  https://www.derpturkey.com/chacha20poly1305-aead-with-node-js/
export abstract class ModuleNodeCrypto extends SymmetricEncryptionBasedModule {

  private readonly _saltLen;
  private readonly _ivLen;
  private readonly _keyLen: number;
  private readonly _algo: string;
  private _encryptionKey: Buffer | null = null;
  private readonly _cipherOptions: any;

  /**
   * Creates a new ModuleNodeCrypto instance.
   *
   * @param moduleId
   * @param algo
   * @param keyLen
   */
  protected constructor(moduleId: string, algo: string, keyLen: number) {
    super(moduleId);
    this._saltLen = 32;
    this._ivLen = 12;
    this._algo = algo;
    this._keyLen = keyLen;
    this._cipherOptions = { authTagLength: 16 };
  }

  public async init(secret: string): Promise<void> {
    this._encryptionKey = Buffer.from(secret, "base64");
  }

  public createRandomEncryptionSecret(): string {
    const key = crypto.randomBytes(this._keyLen);
    return key.toString("base64");
  }

  protected _encryptSerializedDocument(plainText: Uint8Array): Uint8Array {
    const salt = new Uint8Array(crypto.randomBytes(this._saltLen));
    const saltedData = new Uint8Array(plainText.length + salt.length);
    saltedData.set(salt);
    saltedData.set(plainText, salt.length);

    const iv = crypto.randomBytes(this._ivLen);
    const cipher = crypto.createCipheriv(this._algo, this._encryptionKey!, iv, this._cipherOptions);
    const encryptedData = cipher.update(saltedData);
    cipher.final();

    return new Uint8Array(Buffer.concat([iv, encryptedData]));
  }

  protected _decryptSerializedDocument(cipherText: Uint8Array): Uint8Array {
    const iv = cipherText.slice(0, this._ivLen);
    const encryptedData = cipherText.slice(this._ivLen);
    const decipher = crypto.createDecipheriv(this._algo, this._encryptionKey!, iv, this._cipherOptions);
    const decryptedContent = decipher.update(encryptedData);

    const saltedData = new Uint8Array(decryptedContent);

    return saltedData.slice(this._saltLen);
  }
}
