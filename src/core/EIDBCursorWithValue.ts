import {EIDBCursor} from "./EIDBCursor";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {IEncryptedObject} from "./IEncryptedObject";
import {EIDBEncryptor} from "./EIDBEncryptor";

export class EIDBCursorWithValue extends EIDBCursor implements IDBCursorWithValue {
  constructor(cursor: IDBCursorWithValue, mapper: EIDBValueMapper, encryptor: EIDBEncryptor) {
    super(cursor, encryptor, mapper);
  }

  get value(): any {
    const encryptedValue = <IEncryptedObject>(<IDBCursorWithValue>this._cursor).value
    return this._encryptor.decrypt(encryptedValue);
  }
}