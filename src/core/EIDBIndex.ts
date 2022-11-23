import {EIDBRequest} from "./EIDBRequest";
import {EIDBValueMapper} from "./EIDBValueMapper";

export class EIDBIndex implements IDBIndex {
  private readonly _index: IDBIndex;

  private readonly _valueMapper: EIDBValueMapper;

  constructor(index: IDBIndex, valueMapper: EIDBValueMapper) {
    this._index = index;
    this._valueMapper = valueMapper;
  }

  get objectStore(): IDBObjectStore {
    return this._valueMapper.objectStoreMapper.map(this._index.objectStore);
  }

  get keyPath(): string | string[] {
    return this._index.keyPath;
  }

  get multiEntry(): boolean {
    return this._index.multiEntry;
  }

  get name(): string {
    return this._index.name;
  }

  get unique(): boolean {
    return this._index.unique;
  }

  count(query?: IDBValidKey | IDBKeyRange): IDBRequest<number> {
    return new EIDBRequest(this._index.count(query), this._valueMapper);
  }

  get(query: IDBValidKey | IDBKeyRange): IDBRequest {
    return new EIDBRequest(this._index.get(query), this._valueMapper);
  }

  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
    return new EIDBRequest(this._index.getAll(query, count), this._valueMapper);
  }

  getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
    return new EIDBRequest(this._index.getAllKeys(query, count), this._valueMapper);
  }

  getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
    return new EIDBRequest(this._index.getKey(query), this._valueMapper);
  }

  openCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null> {
    const request = this._index.openCursor(query, direction);
    return new EIDBRequest(request, this._valueMapper, c => this._valueMapper.cursorWithValueMapper.mapNullable(c));
  }

  openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null> {
    const request = this._index.openKeyCursor(query, direction);
    return new EIDBRequest(request, this._valueMapper, c => this._valueMapper.cursorMapper.mapNullable(c));
  }
}