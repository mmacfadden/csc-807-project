import {EIDBValueMapper} from "./EIDBValueMapper";
import {EIDBEncryptor} from "./EIDBEncryptor";

export class EIDBCursor implements IDBCursor {
  protected readonly _cursor: IDBCursor;
  readonly request: IDBRequest;
  protected readonly _mapper: EIDBValueMapper;
  protected readonly _encryptor: EIDBEncryptor;

  constructor(cursor: IDBCursor, encryptor: EIDBEncryptor, mapper: EIDBValueMapper) {
    this._cursor = cursor;
    this.request = mapper.requestMapper.map(cursor.request);
    this._mapper = mapper;
    this._encryptor = encryptor;
  }

  get source(): IDBObjectStore | IDBIndex {
    return <IDBObjectStore | IDBIndex>this._mapper.mapSource(this._cursor.source);
  }

  get direction(): IDBCursorDirection {
    return this._cursor.direction;
  }

  get key(): IDBValidKey {
    return this._encryptor.decryptKey(this._cursor.key);
  }

  get primaryKey(): IDBValidKey {
    return this._encryptor.decryptKey(this._cursor.primaryKey);
  }

  advance(count: number): void {
    this._cursor.advance(count);
  }

  continue(key?: IDBValidKey): void {
    this._cursor.continue(key);
  }

  continuePrimaryKey(key: IDBValidKey, primaryKey: IDBValidKey): void {
    this._cursor.continuePrimaryKey(key, primaryKey);
  }

  delete(): IDBRequest<undefined> {
    const request = this._cursor.delete();
    return this._mapper.requestMapper.map(request);
  }

  update(value: any): IDBRequest<IDBValidKey> {
    const encryptedValue = this._encryptor.encrypt(value);
    const request = this._cursor.update(encryptedValue);
    return this._mapper.requestMapper.map(request);
  }
}