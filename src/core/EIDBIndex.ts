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
    const request = this._index.count(query);
    return this._valueMapper.requestMapper.map(request);
  }

  get(query: IDBValidKey | IDBKeyRange): IDBRequest {
    const request = this._index.get(query);
    return this._valueMapper.requestMapper.map(request);
  }

  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
    const request =this._index.getAll(query, count);
    return this._valueMapper.requestMapper.map(request);
  }

  getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
    const request = this._index.getAllKeys(query, count);
    return this._valueMapper.requestMapper.map(request);
  }

  getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
    const request = this._index.getKey(query);
    return this._valueMapper.requestMapper.map(request);
  }

  openCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null> {
    const request = this._index.openCursor(query, direction);
    return this._valueMapper.requestMapper
        .map(request, c => this._valueMapper.cursorWithValueMapper.mapNullable(c));
  }

  openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null> {
    const request = this._index.openKeyCursor(query, direction);
    return this._valueMapper.requestMapper
        .map(request, c => this._valueMapper.cursorMapper.mapNullable(c));
  }
}