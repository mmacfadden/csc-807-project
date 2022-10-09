import {OPE} from "./OPE";

// TODO see if there is a more compact, yet order preserving encoding.
export class OpeEncryptor {
    public static generateKey(block_size: number = 32): string {
        const key = OPE.generate_key();
        const textDecoder = new TextDecoder();
        return textDecoder.decode(key);
    }

    private _textEncoder: TextEncoder;
    private _textDecoder: TextDecoder;
    private _ope: OPE;

    constructor(key: string) {
        this._textEncoder = new TextEncoder();
        this._textDecoder = new TextDecoder();

        const keyBytes = this._textEncoder.encode(key);
        this._ope = new OPE(keyBytes);
    }

    encryptString(str: string): Int32Array {
        const bytes = this._textEncoder.encode(str);
        const encrypted: Int32Array = new Int32Array(bytes.length);
        bytes.forEach((b, i) => {
            const e = this._ope.encrypt(b);
            encrypted[i] = e;
        });
        return encrypted;
    }

    decryptString(cypherText: Int32Array): string {
        const encryptedNumbers = new Int32Array(cypherText.buffer);
        const bytes = new Uint8Array(encryptedNumbers.length);
        for (let i = 0; i < encryptedNumbers.length; i++) {
            const encNum = encryptedNumbers[i];
            const d = this._ope.decrypt(encNum);
            bytes[i] = d;
        }
        return this._textDecoder.decode(bytes);
    }
}