import {OpeEncryptor} from "../ope/OpeEncryptor";
import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";
import {encode, decode} from "@msgpack/msgpack"

export class OpeKeyEncryptor extends EIDBKeyEncryptor {
  private _opeEncryptor: OpeEncryptor;

  constructor(opeEncryptor: OpeEncryptor) {
    super();
    this._opeEncryptor = opeEncryptor;
  }

  public encryptSingleKey(key: number | string | Date | BufferSource): ArrayBuffer {
    const encoded = encode(key);
    const encryptedKey = this._opeEncryptor.encryptBuffer(encoded);
    return encryptedKey.buffer;
  }

  decryptSingleKey(key: ArrayBuffer): any {
    const tmp = new Int32Array(key);
    const decryptedKey: Uint8Array = this._opeEncryptor.decryptBuffer(tmp);
    return decode(decryptedKey);
  }
}