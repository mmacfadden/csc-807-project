import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";

export class SymmetricKeyEncryptor extends EIDBKeyEncryptor {
  public encryptSingleKey(key: number | string | Date | BufferSource): any {
    return key;
  }
}