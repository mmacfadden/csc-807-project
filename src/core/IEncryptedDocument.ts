export interface IEncryptedDocument {
  keys: any;
  indices: any[];
  value: string | Uint8Array;
}