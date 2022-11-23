import * as CryptoJS from "crypto-js";

export class CryptoJsUtils {

  public static convertUint8ArrayToWordArray(u8Array: Uint8Array): CryptoJS.lib.WordArray {
    const words = [];
    const len = u8Array.length;
    let i = 0;
    while (i < len) {
      words.push(
          (u8Array[i++] << 24) |
          (u8Array[i++] << 16) |
          (u8Array[i++] << 8) |
          (u8Array[i++])
      );
    }

    return CryptoJS.lib.WordArray.create(words, u8Array.length);
  }

  public static convertWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const dataArray = new Uint8Array(wordArray.sigBytes);
    for (let i = 0x0; i < wordArray.sigBytes; i++) {
      dataArray[i] = wordArray.words[i >>> 0x2] >>> 0x18 - i % 0x4 * 0x8 & 0xff;
    }
    return dataArray;
  }
}