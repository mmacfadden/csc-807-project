import {EIDBCursor} from "./EIDBCursor";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {EncryptionModule} from "../module";
import {IEncryptedDocument} from "./IEncryptedDocument";

export class EIDBCursorWithValue extends EIDBCursor implements IDBCursorWithValue {
    private readonly _encryptionModule;
    constructor(cursor: IDBCursorWithValue, mapper: EIDBValueMapper, encryptionModule: EncryptionModule) {
        super(cursor, mapper);
        this._encryptionModule = encryptionModule;
    }

    get value(): Promise<any> {
        const doc = <IEncryptedDocument>(<IDBCursorWithValue>this._cursor).value
        return this._encryptionModule.decrypt(doc.value);
    }
}