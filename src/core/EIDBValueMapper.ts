import {EIDBCursorWithValue} from "./EIDBCursorWithValue";
import {EIDBObjectStore} from "./EIDBObjectStore";
import {EIDBIndex} from "./EIDBIndex";
import {EIDBDatabase} from "./EIDBDatabase";
import {EIDBCursor} from "./EIDBCursor";
import {EIDBTransaction} from "./EIDBTransaction";
import {IDBCursorWithValue} from "fake-indexeddb";
import {EncryptionModule} from "../module";

export type ValueMapper<S, D> = (source: S) => D;

export class EIDBValueMapper {
    public readonly dbMapper: DatabaseMapper;
    public readonly objectStoreMapper: ObjectStoreMapper;
    public readonly transactionMapper: TransactionMapper;
    public readonly cursorMapper: CursorMapper;
    public readonly cursorWithValueMapper: CursorWithValueMapper;
    public readonly indexMapper: IndexMapper;

    // TODO might want to move this to a subclass or intermediate class.
    //  the encryption module is not needed in all of these.
    constructor(encryptionModule: EncryptionModule) {
        this.dbMapper = new DatabaseMapper(this, encryptionModule);
        this.objectStoreMapper = new ObjectStoreMapper(this, encryptionModule);
        this.transactionMapper = new TransactionMapper(this, encryptionModule);
        this.cursorMapper = new CursorMapper(this, encryptionModule);
        this.cursorWithValueMapper = new CursorWithValueMapper(this, encryptionModule);
        this.indexMapper = new IndexMapper(this, encryptionModule);
    }

    public mapSource(source: IDBObjectStore | IDBIndex | IDBCursor): EIDBObjectStore | EIDBIndex | EIDBCursor {
        if (source instanceof IDBObjectStore) {
            return this.objectStoreMapper.map(source);
        } else if (source instanceof IDBIndex) {
            return this.indexMapper.map(source);
        } else if (source instanceof IDBCursorWithValue) {
            return this.cursorWithValueMapper.map(source);
        } else if (source instanceof IDBCursor) {
            return this.cursorMapper.map(source);
        } else {
            return <any>null;
        }
    }
}

export abstract class CachedValueMapper<From extends object, To> {

    private readonly _map: WeakMap<From, To>;
    protected readonly _mapper: EIDBValueMapper;
    protected readonly _encryptionModule: EncryptionModule;

    constructor(mapper: EIDBValueMapper, encryptionModule: EncryptionModule) {
        this._mapper = mapper;
        this._encryptionModule = encryptionModule;
        this._map = new WeakMap<From, To>()
    }

    public map(source: From ): To  {
        if (!source) {
            return source;
        }

        let result = this._map.get(source);
        if (!result) {
            result = this._createValue(source);
            this._map.set(source, result);
        }

        return result;
    }

    public mapNullable(source: From  | null): To | null  {
        if (source == null) {
            return null;
        } else {
            return this.map(source);
        }
    }

    protected abstract _createValue(source: From): To;
}

export class DatabaseMapper extends CachedValueMapper<IDBDatabase, EIDBDatabase>{
    protected _createValue(source: IDBDatabase): EIDBDatabase {
        return new EIDBDatabase(source, this._mapper);
    }
}

export class ObjectStoreMapper extends CachedValueMapper<IDBObjectStore, EIDBObjectStore>{
    protected _createValue(source: IDBObjectStore): EIDBObjectStore {
        return new EIDBObjectStore(source, this._encryptionModule, this._mapper);
    }
}

export class TransactionMapper extends CachedValueMapper<IDBTransaction, EIDBTransaction>{
    protected _createValue(source: IDBTransaction): EIDBTransaction {
        return new EIDBTransaction(source, this._mapper);
    }
}

export class CursorMapper extends CachedValueMapper<IDBCursor, EIDBCursor>{
    protected _createValue(source: IDBCursor): EIDBCursor {
        return new EIDBCursor(source, this._mapper);
    }
}

export class CursorWithValueMapper extends CachedValueMapper<IDBCursorWithValue, EIDBCursorWithValue>{
    protected _createValue(source: IDBCursorWithValue): EIDBCursorWithValue {
        return new EIDBCursorWithValue(source, this._mapper);
    }
}

export class IndexMapper extends CachedValueMapper<IDBIndex, EIDBIndex>{
    protected _createValue(source: IDBIndex): EIDBIndex {
        return new EIDBIndex(source, this._mapper);
    }
}
