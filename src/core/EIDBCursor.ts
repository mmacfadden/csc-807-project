import {EIDBRequest} from "./EIDBRequest";
import {EIDBValueMapper} from "./EIDBValueMapper";

export class EIDBCursor implements IDBCursor {
  protected readonly _cursor: IDBCursor;
  readonly request: IDBRequest;
  private readonly _mapper: EIDBValueMapper;

  constructor(cursor: IDBCursor, mapper: EIDBValueMapper) {
    this._cursor = cursor;
    // FIXME remove the OR when the PR is merged and released:
    //  https://github.com/dumbmatter/fakeIndexedDB/pull/79
    const request = cursor.request || (cursor as any)._request;
    this.request = new EIDBRequest(request, mapper);
    this._mapper = mapper;
  }

  get source(): IDBObjectStore | IDBIndex {
    return <IDBObjectStore | IDBIndex>this._mapper.mapSource(this._cursor.source);
  }

  get direction(): IDBCursorDirection {
    return this._cursor.direction;
  }

  get key(): IDBValidKey {
    return this._cursor.key;
  }

  get primaryKey(): IDBValidKey {
    return this._cursor.primaryKey;
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
    return new EIDBRequest(this._cursor.delete(), this._mapper);
  }

  update(value: any): IDBRequest<IDBValidKey> {
    return new EIDBRequest(this._cursor.update(value), this._mapper);
  }
}