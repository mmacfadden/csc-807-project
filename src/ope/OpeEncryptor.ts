import {OPE} from "./OPE";
import CryptoJS from "crypto-js";
import {CryptoJsUtils} from "../util/CryptoJsUtils";

// TODO see if there is a more compact, yet order preserving encoding.
// TODO push a byte or something into the array to signify the type
//   of data.
export class OpeEncryptor {
  public static DEFAULT_KEY_BLOCK_SIZE = 32;

  public static generateKey(block_size: number = OpeEncryptor.DEFAULT_KEY_BLOCK_SIZE): string {
    const key = OPE.generate_key(block_size);
    const textDecoder = new TextDecoder();
    return textDecoder.decode(key);
  }

  private _textEncoder: TextEncoder;
  private _textDecoder: TextDecoder;
  private _ope: OPE;

  /**
   *
   * @param key
   *      A base64 encoded key.
   */
  constructor(key: string) {
    if (!key) {
      throw new Error("key must be a non-empty string");
    }

    this._textEncoder = new TextEncoder();
    this._textDecoder = new TextDecoder();

    const wordArray = CryptoJS.enc.Base64.parse(key);
    const keyBytes = CryptoJsUtils.convertWordArrayToUint8Array(wordArray);
    this._ope = new OPE(keyBytes);
  }

  public encryptNumber(num: number): Int32Array {
    const encrypted: Int32Array = new Int32Array(1);
    encrypted[0] = this._ope.encrypt(num);
    return encrypted;
  }

  public decryptNumber(cipherText: Int32Array): number {
    return this._ope.decrypt(cipherText[0]);
  }


  public encryptString(str: string): Int32Array {
    const bytes = this._textEncoder.encode(str);
    return this._encryptBytes(bytes)
  }

  public encryptBuffer(buffer: ArrayBuffer): Int32Array {
    const bytes = new Uint8Array(buffer);
    return this._encryptBytes(bytes)
  }

  public decryptString(cipherText: Int32Array): string {
    const bytes = this._decryptBytes(cipherText);
    return this._textDecoder.decode(bytes);
  }

  public decryptBuffer(cipherText: Int32Array): Uint8Array {
    return this._decryptBytes(cipherText);
  }

  private _encryptBytes(bytes: Uint8Array): Int32Array {
    const encrypted: Int32Array = new Int32Array(bytes.byteLength);
    const view = new DataView(encrypted.buffer);
    bytes.forEach((b, i) => {
      const encryptedValue = this._ope.encrypt(b);
      view.setInt32(i * 4, encryptedValue, false);
    });
    return encrypted;
  }

  public _decryptBytes(cipherText: Int32Array): Uint8Array {
    const encryptedNumbers = new Int32Array(cipherText.buffer);
    const view = new DataView(encryptedNumbers.buffer);
    const bytes = new Uint8Array(encryptedNumbers.length);
    for (let i = 0; i < encryptedNumbers.length; i++) {
      const encNum = view.getInt32(i * 4, false);
      bytes[i] = this._ope.decrypt(encNum);
    }
    return bytes;
  }
}