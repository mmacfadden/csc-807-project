import {OpeEncryptor} from "../ope/OpeEncryptor";
import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";
import {encode, decode} from "@msgpack/msgpack"

export class OpeKeyEncryptor extends EIDBKeyEncryptor {
  private _opeEncryptor: OpeEncryptor;

  constructor(opeEncryptor: OpeEncryptor) {
    super();
    this._opeEncryptor = opeEncryptor;
  }

  public encryptSingleKey(key: number | string | Date | BufferSource): Int32Array {
    const encoded = encode(key);
    const encryptedKey: Int32Array = this._opeEncryptor.encryptBuffer(encoded);
    return encryptedKey;

    // if (typeof key === "string") {
    //   const encryptedKey: Int32Array = this._opeEncryptor.encryptString(key);
    //   return new Uint8Array(encryptedKey.buffer);
    // } else if (typeof key === "number") {
    //   const encryptedKey: Int32Array = this._opeEncryptor.encryptNumber(key);
    //   return new Uint8Array(encryptedKey.buffer);
    // } else if (key instanceof Date) {
    //   const encryptedKey: Int32Array = this._opeEncryptor.encryptDate(key);
    //   return new Uint8Array(encryptedKey.buffer);
    // } else if (key instanceof ArrayBuffer) {
    //   const encryptedKey: Int32Array = this._opeEncryptor.encryptBuffer(key);
    //   return new Uint8Array(encryptedKey.buffer);
    // } else if (key.buffer instanceof ArrayBuffer) {
    //   const encryptedKey: Int32Array = this._opeEncryptor.encryptBuffer(key.buffer);
    //   return new Uint8Array(encryptedKey.buffer);
    // } else {
    //   // FIXME handle other key types.
    //   throw Error("Unhandled key type: " + typeof key);
    // }
  }

  decryptSingleKey(key: Int32Array): any {
    const decryptedKey: Uint8Array = this._opeEncryptor.decryptBuffer(key);
    return decode(decryptedKey);
  }
}