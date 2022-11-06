import RC5  from "rc5";

const key = "a key";

const plainText = Uint8Array.from([1, 2, 3, 4, 5, 0, 0]);
console.log(plainText);

const encrypted = encrypt(plainText, key);
console.log(encrypted);

const decrypted = decrypt(encrypted, key);
console.log(decrypted);

function encrypt(plainText: Uint8Array, key: string) {
  const rc5 = new RC5(key, 64, 255);
  const cipherText = rc5.encrypt(Buffer.from(plainText));

  const result = new Uint8Array(cipherText.byteLength + 4);
  new DataView(result.buffer).setInt32(0, plainText.length);
  result.set(cipherText, 4);

  return result;
}

function decrypt(cipherText: Uint8Array, key: string) {
  const ptLen = new DataView(cipherText.buffer).getInt32(0);
  const encryptedData = new Uint8Array(cipherText.subarray(4));

  const rc5 = new RC5(key, 64, 255);
  const plainText = rc5.decrypt(Buffer.from(encryptedData), {trim: false});

  return new Uint8Array(plainText.subarray(0, ptLen));
}
