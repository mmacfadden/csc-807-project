import {OpeEncryptor} from "../ope/OpeEncryptor";
import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";

export class OPEKeyEncryptor extends EIDBKeyEncryptor {
  private _opeEncryptor: OpeEncryptor;

  constructor(opeEncryptor: OpeEncryptor) {
    super();
    this._opeEncryptor = opeEncryptor;
  }

  public encryptSingleKey(key: number | string | Date | BufferSource): Uint8Array {
    if (typeof key === "string") {
      const encryptedKey: Int32Array = this._opeEncryptor.encryptString(key);
      return new Uint8Array(encryptedKey.buffer);
    } else {
      // FIXME handle other key types.
      throw Error("Unhandled key type");
    }
  }
}