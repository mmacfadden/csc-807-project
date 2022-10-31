import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";
import {randomBytes} from "tweetnacl";
import {Chacha20} from "ts-chacha20";
import {Base64} from "js-base64";


/**
 * This module implements the ChaCha20 protocol using the ts-chacha20
 * package.
 *
 * https://www.npmjs.com/package/ts-chacha20
 */
export class ModuleChaCha20 extends SymmetricEncryptionBasedModule {

  static readonly MODULE_ID = "ChaCha20 (ts-chacha20)";

  /**
   * The encryption key
   * @private
   */
  private _key: Uint8Array | null;

  /**
   * The length of the nonce to use when encrypting data.
   * @private
   */
  private readonly _nonceLen: number;

  constructor() {
    super(ModuleChaCha20.MODULE_ID);
    this._key = null;
    this._nonceLen = 12;
  }

  /**
   * @inheritDoc
   */
  public createRandomEncryptionSecret(): string {
    return Base64.fromUint8Array(randomBytes(32));
  }

  /**
   * @inheritDoc
   */
  public init(encryptionSecret: string, moduleParams?: any): void {
    super.init(encryptionSecret, moduleParams);
    this._key = Base64.toUint8Array(encryptionSecret);
  }

  /**
   * @inheritDoc
   */
  protected _encryptSerializedDocument(plainText: Uint8Array): Uint8Array {
    const nonce = randomBytes(this._nonceLen);
    const encrypted = new Chacha20(this._key!, nonce).encrypt(plainText);

    // TODO this si very similar to XSalasa20 potentially refactor
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);

    return fullMessage;
  }

  /**
   * @inheritDoc
   */
  protected _decryptSerializedDocument(cipherText: Uint8Array): Uint8Array {
    const nonce = cipherText.slice(0, this._nonceLen);
    const message = cipherText.slice(this._nonceLen, cipherText.length);
    return new Chacha20(this._key!, nonce).decrypt(message);
  }
}
