import RC5  from "rc5";

const rc5 = new RC5("a key", 64, 255);

const ptBinary = Uint8Array.from([1, 2, 3, 4, 5, 0, 0]);
console.log(ptBinary);

const encrypted = rc5.encrypt(Buffer.from(ptBinary));
console.log(new Uint8Array(encrypted));

const decrypted = rc5.decrypt(encrypted);
const decryptedBinary = new Uint8Array(decrypted);

console.log(decryptedBinary);