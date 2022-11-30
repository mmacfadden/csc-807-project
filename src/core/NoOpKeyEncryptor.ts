import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";

export class NoOpKeyEncryptor extends EIDBKeyEncryptor {
  public encryptSingleKey(key: number | string | Date | BufferSource): any {
    return key;
  }

  public decryptSingleKey(key: any): any {
    return key;
  }
}