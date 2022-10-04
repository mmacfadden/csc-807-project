import {EIDBRequest} from "./EIDBRequest";
import {EIDBIndex} from "./EIDBIndex";
import {EIDBTransaction} from "./EIDBTransaction";
import {EIDBValueMapper} from "./EIDBValueMapper";

export class EIDBObjectStore implements IDBObjectStore {
    private readonly _store: IDBObjectStore;
    private readonly _valueMapper: EIDBValueMapper;

    constructor(store: IDBObjectStore, valueMapper: EIDBValueMapper) {
        this._store = store;
        this._valueMapper = valueMapper;
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

    get transaction(): EIDBTransaction {
        return this._valueMapper.transactionMapper.map(this._store.transaction);
    }

    add(value: any, key?: IDBValidKey): EIDBRequest<IDBValidKey> {
        return new EIDBRequest(this._store.add(value, key), this._valueMapper);
    }

    clear(): IDBRequest<undefined> {
        return new EIDBRequest(this._store.clear(), this._valueMapper);
    }

    count(query?: IDBValidKey | IDBKeyRange): EIDBRequest<number> {
        return new EIDBRequest(this._store.count(query), this._valueMapper);
    }

    createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IDBIndex {
        const idx = this._store.createIndex(name, keyPath, options);
        return this._valueMapper.indexMapper.map(idx);
    }

    delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
        return new EIDBRequest(this._store.delete(query), this._valueMapper);
    }

    deleteIndex(name: string): void {
        this._store.deleteIndex(name);
    }

    get(query: IDBValidKey | IDBKeyRange): IDBRequest {
        return new EIDBRequest(this._store.get(query), this._valueMapper);
    }

    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
        return new EIDBRequest(this._store.getAll(query, count), this._valueMapper);
    }

    getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
        return new EIDBRequest(this._store.getAllKeys(query, count), this._valueMapper);
    }

    getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
        return new EIDBRequest(this._store.getKey(query), this._valueMapper);
    }

    index(name: string): EIDBIndex {
        const idx =  this._store.index(name);
        return this._valueMapper.indexMapper.map(idx);
    }

    openCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null> {
        return new EIDBRequest(
            this._store.openCursor(query, direction),
            this._valueMapper,
                c => this._valueMapper.cursorWithValueMapper.mapNullable(c)
        );
    }

    openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null> {
        return new EIDBRequest(
            this._store.openKeyCursor(query, direction),
            this._valueMapper,
                c => this._valueMapper.cursorMapper.mapNullable(c)
        );
    }

    put(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey> {
        return new EIDBRequest(this._store.put(value, key), this._valueMapper);
    }
}