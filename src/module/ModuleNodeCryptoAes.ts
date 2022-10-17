import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

import * as crypto from "crypto";

export abstract class ModuleNodeCryptoAes extends SymmetricEncryptionBasedModule {

  private readonly _saltLen;
  private readonly _ivLen;
  private readonly _keyLen: number;
  private readonly _algo: string;
  private _encryptionKey: Buffer | null = null;

  /**
   * Creates a new ModuleNodeCryptoAes instance.
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
  }

  public async init(secret: string): Promise<void> {
    this._encryptionKey = Buffer.from(secret, "base64");
  }

  public createRandomEncryptionSecret(): Promise<string> {
    const key = crypto.randomBytes(this._keyLen);
    return Promise.resolve(key.toString("base64"));
    // const salt = crypto.randomBytes(this._saltLen);
    // return new Promise((resolve, reject) => {
    //   crypto.pbkdf2(password, salt, 100000, this._keyLen, "sha256",
    //       (err: Error | null, derivedKey: Buffer) => {
    //         if (err) {
    //           reject(err);
    //         } else {
    //
    //           resolve(derivedKey.toString("base64"));
    //         }
    //       });
    // })
  }

  protected _encryptSerializedDocument(plainText: Uint8Array): Promise<Uint8Array> {
    const salt = new Uint8Array(crypto.randomBytes(this._saltLen));
    const saltedData = new Uint8Array(plainText.length + salt.length);
    saltedData.set(salt);
    saltedData.set(plainText, salt.length);

    const iv = crypto.randomBytes(this._ivLen);
    const cipher = crypto.createCipheriv(this._algo, this._encryptionKey!, iv);
    const encryptedData = cipher.update(saltedData);
    cipher.final();

    const payload = new Uint8Array(Buffer.concat([iv, encryptedData]));
    return Promise.resolve(payload);
  }

  protected _decryptSerializedDocument(cipherText: Uint8Array): Promise<Uint8Array> {
    const iv = cipherText.slice(0, this._ivLen);
    const encryptedData = cipherText.slice(this._ivLen);
    const decipher = crypto.createDecipheriv(this._algo, this._encryptionKey!, iv);
    const decryptedContent = decipher.update(encryptedData);

    const saltedData = new Uint8Array(decryptedContent);
    const plainText = saltedData.slice(this._saltLen);

    return Promise.resolve(plainText)
  }
}
