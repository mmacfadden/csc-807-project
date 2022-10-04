import {EIDBCursor} from "./EIDBCursor";
import {EIDBValueMapper} from "./EIDBValueMapper";

export class EIDBCursorWithValue extends EIDBCursor implements IDBCursorWithValue {

    constructor(cursor: IDBCursorWithValue, mapper: EIDBValueMapper) {
        super(cursor, mapper);
    }

    get value(): any {
        // FIXME decrypt?
        return (<IDBCursorWithValue>this._cursor).value;
    }

}