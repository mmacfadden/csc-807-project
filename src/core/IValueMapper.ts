import {EIDBCursorWithValue} from "./EIDBCursorWithValue";
import {EIDBObjectStore} from "./EIDBObjectStore";
import {EIDBIndex} from "./EIDBIndex";
import {EIDBDatabase} from "./EIDBDatabase";
import {EIDBCursor} from "./EIDBCursor";

export type ValueMapper<S, D> = (source: S) => D;

const databaseMap = new WeakMap<IDBDatabase, EIDBDatabase>();

export function mapIDBDatabase(database: IDBDatabase): EIDBDatabase {
    let result = databaseMap.get(database);
    if (!result) {
        result = new EIDBDatabase(database);
        databaseMap.set(database, result);
    }

    return result;
}

export class CursorWrapper {
    private readonly _source: EIDBObjectStore | EIDBIndex;

    constructor(source: EIDBObjectStore | EIDBIndex) {
        this._source = source;
    }

    public wrapCursor(cursor: IDBCursor | null): EIDBCursor | null {
        if (cursor == null) {
            return cursor
        } else {
            return new EIDBCursor(cursor, this._source);
        }
    }

    public wrapCursorWithValue(cursor: IDBCursorWithValue | null): EIDBCursorWithValue | null {
        if (cursor == null) {
            return cursor
        } else {
            return new EIDBCursorWithValue(cursor, this._source);
        }
    }
}
