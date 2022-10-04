import {EIDBObjectStore} from "./EIDBObjectStore";
import {EIDBIndex} from "./EIDBIndex";
import {EIDBRequest} from "./EIDBRequest";

export class EIDBCursor implements IDBCursor {
    protected readonly _cursor: IDBCursor;
    readonly request: IDBRequest;
    readonly source: IDBObjectStore | IDBIndex;

    constructor(cursor: IDBCursor, source: EIDBObjectStore | EIDBIndex) {
        this._cursor = cursor;
        this.request = new EIDBRequest(cursor.request)
        this.source = source;
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
        this.continuePrimaryKey(key, primaryKey);
    }

    delete(): IDBRequest<undefined> {
        return new EIDBRequest(this._cursor.delete());

    }

    update(value: any): IDBRequest<IDBValidKey> {
        return new EIDBRequest(this._cursor.update(value));
    }
}