import {EIDBCursor} from "./EIDBCursor";
import {EIDBObjectStore} from "./EIDBObjectStore";
import {EIDBIndex} from "./EIDBIndex";

export class EIDBCursorWithValue extends EIDBCursor implements IDBCursorWithValue {

    constructor(cursor: IDBCursorWithValue, source: EIDBObjectStore | EIDBIndex) {
        super(cursor, source);
    }

    get value(): any {
        // TODO decrypt?
        return (<IDBCursorWithValue>this._cursor).value;
    }

}