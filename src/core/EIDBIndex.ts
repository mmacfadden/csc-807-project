import {EIDBRequest} from "./EIDBRequest";
import {EIDBObjectStore} from "./EIDBObjectStore";
import {CursorWrapper} from "./IValueMapper";

export class EIDBIndex implements IDBIndex {
    private readonly _index: IDBIndex;
    private readonly _cursorWrapper;
    readonly objectStore: IDBObjectStore;

    constructor(store: EIDBObjectStore, index: IDBIndex) {
        this._index = index;
        this.objectStore = store;
        this._cursorWrapper = new CursorWrapper(this);
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
        return new EIDBRequest(this._index.count(query));
    }

    get(query: IDBValidKey | IDBKeyRange): IDBRequest {
        return new EIDBRequest(this._index.get(query));
    }

    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
        return new EIDBRequest(this._index.getAll(query, count));
    }

    getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
        return new EIDBRequest(this._index.getAllKeys(query, count));
    }

    getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
        return new EIDBRequest(this._index.getKey(query));
    }

    openCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null> {
        const request = this._index.openCursor(query, direction);
        return new EIDBRequest(request, this._cursorWrapper.wrapCursorWithValue);
    }

    openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null> {
        const request = this._index.openKeyCursor(query, direction);
        return new EIDBRequest(request, this._cursorWrapper.wrapCursor);
    }
}