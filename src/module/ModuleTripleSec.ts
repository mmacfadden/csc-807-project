import {Decryptor, Encryptor} from "triplesec";
import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

/**
 * This module uses the TripleSec library to implement a multi-layer
 * encryption approach.  More information on TripleSec can be found at:
 *    https://keybase.io/triplesec
 */
export class ModuleTripleSec extends SymmetricEncryptionBasedModule {
  public static readonly MODULE_ID = "Triple Sec";
  private readonly _encryptor: Encryptor;
  private readonly _decryptor: Decryptor;

  /**
   * Creates a new ModuleBlowfish instance.
   *
   * @param secret
   *   The symmetric encryption secret to derive a key from.
   */
  constructor(secret: string) {
    super(ModuleTripleSec.MODULE_ID, secret);
    const k = Buffer.from(secret, "utf-8");
    this._encryptor = new Encryptor({key: k});
    this._decryptor = new Decryptor({key: k});
  }

  /**
   * @inheritDoc
   */
  public async encrypt(plainText: string): Promise<Uint8Array> {
    const data = Buffer.from(plainText, "utf-8");

    return new Promise((resolve, reject) => {
      this._encryptor.run({data}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(new Uint8Array(res));
        }
      });
    });
  }

  /**
   * @inheritDoc
   */
  public async decrypt(cypherText: any): Promise<string> {
    if (cypherText instanceof Uint8Array) {
      const data = Buffer.from(cypherText);
      return new Promise((resolve, reject) => {
        this._decryptor.run({data}, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res.toString());
          }
        });
      });
    } else {
      // FIXME
      throw new Error()
    }

  }
}