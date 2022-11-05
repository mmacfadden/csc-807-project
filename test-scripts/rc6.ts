import {RC6} from "../src/ciphers/rc6";
import CryptoJS from "crypto-js";
import {CryptoJsUtils} from "../src/util/CryptoJsUtils";

const value = "test";
const ptBinary = new TextEncoder().encode(value);
const key = new TextEncoder().encode("secret15");

console.log(ptBinary);

const encrypted = RC6.encrypt(ptBinary, key);
console.log(encrypted);
console.log(CryptoJS.enc.Base64.stringify(CryptoJsUtils.convertUint8ArrayToWordArray(encrypted)));

const decrypted = RC6.decrypt(encrypted, key);
const decryptedBinary = new Uint8Array(decrypted);

console.log(decryptedBinary);