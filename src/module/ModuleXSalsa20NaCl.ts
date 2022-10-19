import {SymmetricEncryptionBasedModule} from "./SymmetricEncryptionBasedModule";

import {secretbox, randomBytes} from "tweetnacl";
import {encodeBase64, decodeBase64} from "tweetnacl-util";


/**
 */
export class ModuleXSalsa20NaCl extends SymmetricEncryptionBasedModule {

  static readonly MODULE_ID = "XSalsa20 (tweetnacl)";

  private _key: Uint8Array | null;


  constructor() {
    super(ModuleXSalsa20NaCl.MODULE_ID);
    this._key = null;
  }

  public createRandomEncryptionSecret(): Promise<string> {
    const key = encodeBase64(randomBytes(secretbox.keyLength));
    return Promise.resolve(key);
  }

  public init(encryptionSecret: string): Promise<void> {
    this._key = decodeBase64(encryptionSecret);
    return Promise.resolve();
  }

  protected _encryptSerializedDocument(plainText: Uint8Array): Promise<Uint8Array> {
    const nonce = randomBytes(secretbox.nonceLength);
    const box = secretbox(plainText, nonce, this._key!);

    const fullMessage = new Uint8Array(nonce.length + box.length);
    fullMessage.set(nonce);
    fullMessage.set(box, nonce.length);

    return Promise.resolve(fullMessage);
  }

  protected _decryptSerializedDocument(cipherText: Uint8Array): Promise<Uint8Array> {
    const nonce = cipherText.slice(0, secretbox.nonceLength);
    const message = cipherText.slice(secretbox.nonceLength, cipherText.length);
    const decrypted = secretbox.open(message, nonce, this._key!);

    if (!decrypted) {
      throw new Error("Could not decrypt message");
    }

    return Promise.resolve(decrypted);
  }
}
