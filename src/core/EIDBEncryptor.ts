import {IEncryptedObject} from "./IEncryptedObject";
import {KeyPathUtil} from "../util";
import {EncryptionModule} from "../module";
import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";

export class EIDBEncryptor {
  private readonly _encryptionModule: EncryptionModule;
  private readonly _keyPath: string | string[] | null;
  private readonly _keyEncryptor: EIDBKeyEncryptor;

  constructor(encryptionModule: EncryptionModule,
              keyPath: string | string[] | null,
              keyEncryptor: EIDBKeyEncryptor) {
    this._encryptionModule = encryptionModule;
    this._keyPath = keyPath;
    this._keyEncryptor = keyEncryptor;
  }

  public encryptKey(query?: IDBValidKey): IDBValidKey | undefined {
    return query ? this._keyEncryptor.encryptKey(query) : undefined;
  }

  public encryptKeyOrRange(query?: IDBValidKey | IDBKeyRange | null): IDBValidKey | IDBKeyRange | undefined {
    return this._keyEncryptor.encryptKeyOrRange(query);
  }

  public decryptKey(cipherText: any): IDBValidKey {
    return this._keyEncryptor.decryptSingleKey(cipherText);
  }

  public decrypt(value: IEncryptedObject): any {
    return this._encryptionModule.decrypt(value.value);
  }

  public encrypt(value: any): IEncryptedObject {
    const keys = this._extractAndEncryptKeys(value, this._keyPath);
    const encryptedValue = this._encryptionModule.encrypt(value);
    return {
      keys,
      indices: [],
      value: encryptedValue
    };
  }

  private _extractAndEncryptKeys(source: any, path: string | string[] | null): any {
    if (path === null) {
      return null;
    }

    if (!Array.isArray(path)) {
      path = [path];
    }

    const target: any = {};

    path.forEach((p, k) => {
      const pathComponents = p.split(".");
      let curSourceVal = source;

      for (let i = 0; i < pathComponents.length; i++) {
        const prop = pathComponents[i];
        curSourceVal = source[prop];

        if (i === pathComponents.length - 1) {
          target[KeyPathUtil.getKey(k)] = this._keyEncryptor.encryptKey(curSourceVal);
          break;
        }

        if (curSourceVal === undefined || curSourceVal === null) {
          throw new Error("Unable to extract key from document");
        }
      }
    });

    return target;
  }
}