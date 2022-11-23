export class RC6 {
  private static w = 32;
  private static r = 20;
  private static Pw = 0xB7E15163;
  private static Qw = 0x9E3779b9;
  private static S: number[] = [];
  static {
    RC6.S.length = RC6.r * 2 + 4
  }
  private static output: Uint8Array;
  private static counter = 0;


  private static rotateLeft(n: number, x: number): number {
    return ((n << x) | (n >>> (RC6.w - x)));
  }

  private static rotateRight(n: number, x: number): number {
    return ((n >>> x) | (n << (RC6.w - x)));
  }


  private static convertToHex(regA: number, regB: number, regC: number, regD: number): Uint8Array {
    const data: number[] = [];
    const text = new Uint8Array(RC6.w / 2);
    data[0] = regA;
    data[1] = regB;
    data[2] = regC;
    data[3] = regD;

    for (let i = 0; i < text.length; i++) {
      text[i] = ((data[i / 4] >>> (i % 4) * 8) & 0xff);
    }

    return text;
  }

  private static mergeArrays(array: Uint8Array): void {
    for (let i = 0; i < array.length; i++) {
      RC6.output[RC6.counter] = array[i];
      RC6.counter++;
    }
  }

  private static fillBufferZeroes(plainText: Uint8Array): Uint8Array {
    const length = 16 - plainText.length % 16;
    const block = new Uint8Array(plainText.length + length);
    for (let i = 0; i < plainText.length; i++) {
      block[i] = plainText[i];
    }

    for (let i = plainText.length; i < plainText.length + length; i++) {
      block[i] = 0;
    }

    return block;
  }

  private static clearPadding(cipherText: Uint8Array): Uint8Array {
    const answer = new Uint8Array(RC6.getBounds(cipherText));
    for (let i = 0; i < cipherText.length; i++) {
      if (cipherText[i] == 0) break;
      answer[i] = cipherText[i];
    }

    return answer;
  }

  private static getBounds(cipherText: Uint8Array): number {
    for (let i = 0; i < cipherText.length; i++) {
      if (cipherText[i] == 0) {
        return i;
      }
    }
    return cipherText.length;
  }

  private static encryptBlock(plainText: Uint8Array): Uint8Array {
    let regA, regB, regC, regD;
    let index = 0, temp1, temp2, swap;

    regA = ((plainText[index++] & 0xff) | (plainText[index++] & 0xff) << 8 | (plainText[index++] & 0xff) << 16 | (plainText[index++] & 0xff) << 24);
    regB = ((plainText[index++] & 0xff) | (plainText[index++] & 0xff) << 8 | (plainText[index++] & 0xff) << 16 | (plainText[index++] & 0xff) << 24);
    regC = ((plainText[index++] & 0xff) | (plainText[index++] & 0xff) << 8 | (plainText[index++] & 0xff) << 16 | (plainText[index++] & 0xff) << 24);
    regD = ((plainText[index++] & 0xff) | (plainText[index++] & 0xff) << 8 | (plainText[index++] & 0xff) << 16 | (plainText[index++] & 0xff) << 24);

    regB = regB + RC6.S[0];
    regD = regD + RC6.S[1];

    for (let i = 1; i <= RC6.r; i++) {
      temp1 = RC6.rotateLeft(regB * (regB * 2 + 1), 5);
      temp2 = RC6.rotateLeft(regD * (regD * 2 + 1), 5);
      regA = (RC6.rotateLeft(regA ^ temp1, temp2)) + RC6.S[i * 2];
      regC = (RC6.rotateLeft(regC ^ temp2, temp1)) + RC6.S[i * 2 + 1];

      swap = regA;
      regA = regB;
      regB = regC;
      regC = regD;
      regD = swap;
    }

    regA = regA + RC6.S[RC6.r * 2 + 2];
    regC = regC + RC6.S[RC6.r * 2 + 3];

    return RC6.convertToHex(regA, regB, regC, regD);
  }


  private static decryptBlock(cipherText: Uint8Array): Uint8Array {
    let regA, regB, regC, regD;
    let index = 0, temp1, temp2, swap;

    regA = ((cipherText[index++] & 0xff) | (cipherText[index++] & 0xff) << 8 | (cipherText[index++] & 0xff) << 16 | (cipherText[index++] & 0xff) << 24);
    regB = ((cipherText[index++] & 0xff) | (cipherText[index++] & 0xff) << 8 | (cipherText[index++] & 0xff) << 16 | (cipherText[index++] & 0xff) << 24);
    regC = ((cipherText[index++] & 0xff) | (cipherText[index++] & 0xff) << 8 | (cipherText[index++] & 0xff) << 16 | (cipherText[index++] & 0xff) << 24);
    regD = ((cipherText[index++] & 0xff) | (cipherText[index++] & 0xff) << 8 | (cipherText[index++] & 0xff) << 16 | (cipherText[index++] & 0xff) << 24);


    regC = regC - RC6.S[RC6.r * 2 + 3];
    regA = regA - RC6.S[RC6.r * 2 + 2];

    for (let i = RC6.r; i >= 1; i--) {
      swap = regD;
      regD = regC;
      regC = regB;
      regB = regA;
      regA = swap;

      temp2 = RC6.rotateLeft(regD * (regD * 2 + 1), 5);
      temp1 = RC6.rotateLeft(regB * (regB * 2 + 1), 5);
      regC = RC6.rotateRight(regC - RC6.S[i * 2 + 1], temp1) ^ temp2;
      regA = RC6.rotateRight(regA - +RC6.S[i * 2], temp2) ^ temp1;
    }

    regD = regD - RC6.S[1];
    regB = regB - RC6.S[0];
    return RC6.convertToHex(regA, regB, regC, regD);
  }

  public static encrypt(plainText: Uint8Array, userKey: Uint8Array): Uint8Array {
    let blocks_number = plainText.length / 16 + 1;
    let block_counter = 0;

    RC6.output = new Uint8Array(16 * blocks_number);
    RC6.keyShedule(userKey);

    for (let i = 0; i < blocks_number; i++) {
      if (blocks_number == i + 1) {
        RC6.mergeArrays(
            RC6.encryptBlock(RC6.fillBufferZeroes(RC6.arrayCopyOfRange(plainText, block_counter, plainText.length)))
        );
        break;
      }
      RC6.mergeArrays(RC6.encryptBlock(RC6.arrayCopyOfRange(plainText, block_counter, block_counter + 16)));
      block_counter += 16;
    }
    RC6.counter = 0;
    return RC6.output;
  }

  public static decrypt(cipherText: Uint8Array, userKey: Uint8Array): Uint8Array {
    let blocks_number = cipherText.length / 16 + 1;
    let block_counter = 0;
    RC6.output = new Uint8Array(16 * blocks_number);
    RC6.keyShedule(userKey);

    for (let i = 0; i < blocks_number; i++) {
      if (blocks_number == i + 1) {
        RC6.mergeArrays(
            RC6.decryptBlock(
                RC6.fillBufferZeroes(RC6.arrayCopyOfRange(cipherText, block_counter, cipherText.length))
            )
        );
        break;
      }
      RC6.mergeArrays(
          RC6.decryptBlock(RC6.arrayCopyOfRange(cipherText, block_counter, block_counter + 16))
      );
      block_counter += 16;
    }
    RC6.counter = 0;

    return RC6.clearPadding(RC6.output);
  }


  private static keyShedule(key: Uint8Array): void {
    let bytes = RC6.w / 8;
    let c = key.length / bytes;
    let L = [];
    L.length = c;
    let index = 0;

    for (let i = 0; i < c; i++) {
      L[i] = ((key[index++]) & 0xff | (key[index++] & 0xff) << 8 | (key[index++] & 0xff) << 16 | (key[index++] & 0xff) << 24);
    }
    RC6.S[0] = RC6.Pw;

    for (let i = 1; i <= 2 * RC6.r + 3; i++) {
      RC6.S[i] = RC6.S[i - 1] + RC6.Qw;
    }

    let A = 0, B = 0, i = 0, j = 0;
    let v = 3 * Math.max(c, 2 * RC6.r + 4);

    for (let k = 1; k <= v; k++) {
      A = RC6.S[i] = RC6.rotateLeft(RC6.S[i] + A + B, 3);
      B = L[j] = RC6.rotateLeft(L[j] + A + B, A + B);
      i = (i + 1) % (2 * RC6.r + 4);
      j = (j + 1) % c;
    }
  }

  private static arrayCopyOfRange(src: Uint8Array, from: number, to: number): Uint8Array {
    return Uint8Array.of(...src.slice(from, to));
  }
}