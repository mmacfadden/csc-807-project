import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";
import * as CryptoJS from "crypto-js";
import {encode} from "@msgpack/msgpack";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

export class SymmetricKeyEncryptor extends EIDBKeyEncryptor {
  private readonly _key: CryptoJS.lib.WordArray;
  private readonly _iv: CryptoJS.lib.WordArray;

  public static generateConfig(): string {
    const key = CryptoJS.lib.WordArray.random(32);
    const iv = CryptoJS.lib.WordArray.random(16);
    key.concat(iv);
    return CryptoJS.enc.Base64.stringify(key);
  }

  constructor(config: string) {
    super();

    const parsed = CryptoJS.enc.Base64.parse(config);
    this._key = CryptoJS.lib.WordArray.create(parsed.words.slice(0, 32));
    this._iv = CryptoJS.lib.WordArray.create(parsed.words.slice(32));
  }
  public encryptSingleKey(key: number | string | Date | BufferSource): any {
    const encodedKey = CryptoJsUtils.convertUint8ArrayToWordArray(encode(key));
    const ct = CryptoJS.AES.encrypt(encodedKey, this._key, {iv: this._iv});
    return CryptoJsUtils.convertWordArrayToUint8Array(ct.ciphertext);
  }
}