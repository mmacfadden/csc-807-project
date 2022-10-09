export interface IEncryptedDocument {
    key: any;
    indices: any[];
    value: string | Uint8Array;
}