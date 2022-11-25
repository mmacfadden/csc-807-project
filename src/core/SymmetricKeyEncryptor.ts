import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";
import * as CryptoJS from "crypto-js";
import {encode} from "@msgpack/msgpack";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

export class SymmetricKeyEncryptor extends EIDBKeyEncryptor {
  private readonly _key: string;
  private readonly _iv: CryptoJS.lib.WordArray;

  constructor(key?: string) {
    super();
    this._key = "x".repeat(32);
    this._iv = CryptoJS.lib.WordArray.random(12);
  }
  public encryptSingleKey(key: number | string | Date | BufferSource): any {
    const encodedKey = CryptoJsUtils.convertUint8ArrayToWordArray(encode(key));

    // const packedWords = CryptoJsUtils.convertUint8ArrayToWordArray(packed);
    // const ct = CryptoJS.AES.encrypt(packedWords, this._key, {iv: this._iv});
    // console.log(ct);
    // return CryptoJsUtils.convertWordArrayToUint8Array(ct.ciphertext);

    return CryptoJsUtils.convertWordArrayToUint8Array(CryptoJS.SHA512(encodedKey));
  }
}