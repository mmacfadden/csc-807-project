import {OPE} from "./OPE";

// TODO see if there is a more compact, yet order preserving encoding.
export class OpeEncryptor {
    private _textEncoder: TextEncoder;
    private _textDecoder: TextDecoder;
    private _ope: OPE;

    private static _BASE = 36;

    constructor(key: string) {
        this._textEncoder = new TextEncoder();
        this._textDecoder = new TextDecoder();

        const keyBytes = new TextEncoder().encode(key);
        this._ope = new OPE(keyBytes);
    }

    encryptString(str: string): any {
        const bytes = this._textEncoder.encode(str)
        const encrypted: string[] = [];
        bytes.forEach(b => {
            const e = this._ope.encrypt(b);
            encrypted.push(e.toString(OpeEncryptor._BASE));
        });

        return encrypted.join(",");
    }

    decryptString(cypherText: string): string {

        const encryptedNumbers = cypherText.split(",").map(n => Number.parseInt(n, OpeEncryptor._BASE));
        const bytes = new Uint8Array(encryptedNumbers.length);
        for (let i = 0; i < encryptedNumbers.length; i++) {
            const encNum = encryptedNumbers[i];
            const d = this._ope.decrypt(encNum);
            bytes[i] = d;
        }

        const decrypted =this._textDecoder.decode(bytes);
        return decrypted;
    }
}