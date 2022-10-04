import {EIDBRequest} from "./EIDBRequest";
import {EIDBIndex} from "./EIDBIndex";

export class EIDBObjectStore implements IDBObjectStore {
    private readonly _store: IDBObjectStore;

    constructor(store: IDBObjectStore) {
        this._store = store;
    }

    get autoIncrement(): boolean {
        return this._store.autoIncrement;
    }

    get indexNames(): DOMStringList {
        return this._store.indexNames;
    }

    get keyPath(): string | string[] {
        return this._store.keyPath;
    }

    get name(): string {
        return this._store.name
    }

    get transaction(): IDBTransaction {
        // TODO Wrap This;
        return this._store.transaction;
    }

    add(value: any, key?: IDBValidKey): EIDBRequest<IDBValidKey> {
        return new EIDBRequest(this._store.add(value, key));
    }

    clear(): IDBRequest<undefined> {
        return new EIDBRequest(this._store.clear());
    }

    count(query?: IDBValidKey | IDBKeyRange): EIDBRequest<number> {
        return new EIDBRequest(this._store.count(query));
    }

    createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IDBIndex {
        const idx = this._store.createIndex(name, keyPath, options);
        return new EIDBIndex(this, idx);
    }

    delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
        return new EIDBRequest(this._store.delete(query));
    }

    deleteIndex(name: string): void {
        this._store.deleteIndex(name);
    }

    get(query: IDBValidKey | IDBKeyRange): IDBRequest {
        return new EIDBRequest(this._store.get(query));
    }

    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
        return new EIDBRequest(this._store.getAll(query, count));
    }

    getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
        return new EIDBRequest(this._store.getAllKeys(query, count));
    }

    getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
        return new EIDBRequest(this._store.getKey(query));
    }

    index(name: string): EIDBIndex {
        const idx =  this._store.index(name);
        return new EIDBIndex(this, idx);
    }

    openCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null> {
        return new EIDBRequest(this._store.openCursor(query, direction));
    }

    openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null> {
        return new EIDBRequest(this._store.openKeyCursor(query, direction));
    }

    put(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey> {
        return new EIDBRequest(this._store.put(value, key));
    }
}