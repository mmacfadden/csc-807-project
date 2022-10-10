import {EndianUtils} from "../util/EndianUtils";
import {OpeEncryptor} from "../ope/OpeEncryptor";

export class EIDBKeyEncryptor {
    private _opeEncryptor: OpeEncryptor;

    constructor(opeEncryptor: OpeEncryptor) {
        this._opeEncryptor = opeEncryptor;
    }

    public encryptKeyOrRange(query?: IDBValidKey | IDBKeyRange | null): IDBValidKey | IDBKeyRange | undefined {
        if (query === null || query === undefined) {
            return undefined;
        } else if (query instanceof IDBKeyRange) {
            return this.encryptKeyRange(query);
        } else {
            return this.encryptKey(query);
        }
    }

    public encryptKeyRange(keyRange: IDBKeyRange): IDBKeyRange {
        let encryptedRange;

        if (keyRange.lower !== undefined && keyRange.upper === undefined) {
            const lower = this.encryptKey(keyRange.lower);
            encryptedRange = IDBKeyRange.lowerBound(lower, keyRange.lowerOpen);
        } else if (keyRange.lower === undefined && keyRange.upper !== undefined) {
            const upper = this.encryptKey(keyRange.upper);
            encryptedRange = IDBKeyRange.upperBound(upper, keyRange.upperOpen);
        } else if (keyRange.lower !== undefined && keyRange.upper !== undefined) {
            const lower = this.encryptKey(keyRange.lower);
            const upper = this.encryptKey(keyRange.upper);
            encryptedRange = IDBKeyRange.bound(lower, upper, keyRange.lowerOpen, keyRange.upperOpen);
        } else {
            encryptedRange = keyRange;
        }

        return encryptedRange;
    }

    public encryptKey(key: IDBValidKey): IDBValidKey {
        if (Array.isArray(key)) {
            return key.map((k: IDBValidKey) => {
                if (Array.isArray(k)) {
                    return this.encryptKey(k);
                } else {
                    return this.encryptSingleKey(k);
                }
            });
        } else {
            return this.encryptSingleKey(key);
        }
    }

    public encryptSingleKey(key: number | string | Date | BufferSource): Uint8Array {
        if (typeof key === "string") {
            const encryptedKey: Int32Array = this._opeEncryptor.encryptString(key);
            const bigEndianBuffer = EndianUtils.ensureBigEndian(encryptedKey.buffer);
            return new Uint8Array(bigEndianBuffer);
        } else {
            throw Error("Unhandled key type");
        }

    }
}