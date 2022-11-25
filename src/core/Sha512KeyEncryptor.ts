import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";
import * as CryptoJS from "crypto-js";
import {encode} from "@msgpack/msgpack";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

export class Sha512KeyEncryptor extends EIDBKeyEncryptor {
  public encryptSingleKey(key: number | string | Date | BufferSource): any {
    const encodedKey = CryptoJsUtils.convertUint8ArrayToWordArray(encode(key));
    return CryptoJsUtils.convertWordArrayToUint8Array(CryptoJS.SHA512(encodedKey));
  }
}