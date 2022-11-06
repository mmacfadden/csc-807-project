import RC5  from "rc5";

const key = "a key";

const plainText = Buffer.of(1, 2, 3, 4, 5, 0, 0);
console.log(plainText);

const encrypted = encrypt(plainText, key);
console.log(encrypted);

const decrypted = decrypt(encrypted, key);
console.log(decrypted);

function encrypt(plainText: Buffer, key: string): Buffer {
  const rc5 = new RC5(key, 64, 255);
  const cipherText = rc5.encrypt(plainText);

  const result = Buffer.alloc(cipherText.byteLength + 4);
  new DataView(result.buffer).setInt32(0, plainText.length);
  result.set(cipherText, 4);

  return result;
}

function decrypt(cipherText: Buffer, key: string): Buffer {
  const ptLen = new DataView(cipherText.buffer).getInt32(0);
  const encryptedData = Buffer.from(cipherText.subarray(4));

  const rc5 = new RC5(key, 64, 255);
  const plainText = rc5.decrypt(encryptedData, {trim: false});

  return Buffer.from(plainText.subarray(0, ptLen));
}
