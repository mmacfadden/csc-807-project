import {EIDBCursorWithValue} from "./EIDBCursorWithValue";
import {EIDBObjectStore} from "./EIDBObjectStore";
import {EIDBIndex} from "./EIDBIndex";
import {EIDBDatabase} from "./EIDBDatabase";
import {EIDBCursor} from "./EIDBCursor";
import {EIDBTransaction} from "./EIDBTransaction";
import {IDBCursorWithValue} from "fake-indexeddb";
import {EncryptionModule} from "../module";
import {EncryptionConfig} from "../config";
import {DatabaseNameUtil} from "../util/DatabaseNameUtil";
import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";
import {EIDBEncryptor} from "./EIDBEncryptor";
import {EIDBRequest} from "./EIDBRequest";

export type ValueMapper<S, D> = (source: S) => D;

export class EIDBValueMapper {
  public readonly dbMapper: DatabaseMapper;
  public readonly objectStoreMapper: ObjectStoreMapper;
  public readonly transactionMapper: TransactionMapper;
  public readonly cursorMapper: CursorMapper;
  public readonly cursorWithValueMapper: CursorWithValueMapper;
  public readonly indexMapper: IndexMapper;
  public readonly encryptionConfig: EncryptionConfig;
  public readonly requestMapper: RequestMapper;

  // TODO might want to move this to a subclass or intermediate class.
  //  the encryption module is not needed in all of these.

  constructor(
      encryptionConfig: EncryptionConfig,
      encryptionModule: EncryptionModule,
      keyEncryptor: EIDBKeyEncryptor) {
    this.dbMapper = new DatabaseMapper(this, encryptionModule, keyEncryptor, encryptionConfig);
    this.objectStoreMapper = new ObjectStoreMapper(this, encryptionModule, keyEncryptor, encryptionConfig);
    this.transactionMapper = new TransactionMapper(this, encryptionModule, keyEncryptor, encryptionConfig);
    this.cursorMapper = new CursorMapper(this, encryptionModule, keyEncryptor, encryptionConfig);
    this.cursorWithValueMapper = new CursorWithValueMapper(this, encryptionModule, keyEncryptor, encryptionConfig);
    this.indexMapper = new IndexMapper(this, encryptionModule, keyEncryptor, encryptionConfig);
    this.requestMapper = new RequestMapper(this, encryptionModule, keyEncryptor, encryptionConfig);
    this.encryptionConfig = encryptionConfig;
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

export abstract class CachedValueMapper<From extends object, To, Options = undefined> {

  private readonly _map: WeakMap<From, To>;
  protected readonly _mapper: EIDBValueMapper;
  protected readonly _encryptionModule: EncryptionModule;
  protected readonly _keyEncryptor: EIDBKeyEncryptor;
  protected readonly _encryptionConfig: EncryptionConfig;

  constructor(mapper: EIDBValueMapper,
              encryptionModule: EncryptionModule,
              keyEncryptor: EIDBKeyEncryptor,
              encryptionConfig: EncryptionConfig) {
    this._mapper = mapper;
    this._encryptionModule = encryptionModule;
    this._map = new WeakMap<From, To>();
    this._keyEncryptor = keyEncryptor;
    this._encryptionConfig = encryptionConfig;
  }

  public map(source: From, options?: Options): To {
    if (!source) {
      return source;
    }

    let result = this._map.get(source);
    if (!result) {
      result = this._createValue(source, options);
      this._map.set(source, result);
    }

    return result;
  }

  public mapNullable(source: From | null, options?: Options): To | null {
    if (source == null) {
      return null;
    } else {
      return this.map(source, options);
    }
  }

  protected abstract _createValue(source: From, parent?: Options): To;
}

export class RequestMapper extends CachedValueMapper<IDBRequest, EIDBRequest, ValueMapper<any, any>> {
  protected _createValue(request: IDBRequest, valueMapper: ValueMapper<any, any>): EIDBRequest {
    return new EIDBRequest(request, this._mapper, valueMapper);
  }
}

export class DatabaseMapper extends CachedValueMapper<IDBDatabase, EIDBDatabase> {
  protected _createValue(source: IDBDatabase): EIDBDatabase {
    const name = DatabaseNameUtil.unprefixName(source.name);
    if (!this._encryptionConfig.databaseConfigExists(name)) {
      this._encryptionConfig.addDatabaseConfig(name);
    }

    const config = this._encryptionConfig.getDatabaseConfig(name);
    return new EIDBDatabase(source, config, this._mapper);
  }
}

export class ObjectStoreMapper extends CachedValueMapper<IDBObjectStore, EIDBObjectStore, EIDBDatabase> {
  protected _createValue(source: IDBObjectStore, parent: EIDBDatabase): EIDBObjectStore {
    const dbConfig = this._encryptionConfig.getDatabaseConfig(parent.name);
    const config = dbConfig.getObjectStoreConfig(source.name);
    const encryptor = new EIDBEncryptor(this._encryptionModule, config.getKeyPath(), this._keyEncryptor);
    return new EIDBObjectStore(source, config,  encryptor, this._mapper);
  }
}

export class TransactionMapper extends CachedValueMapper<IDBTransaction, EIDBTransaction> {
  protected _createValue(source: IDBTransaction): EIDBTransaction {
    return new EIDBTransaction(source, this._mapper);
  }
}

export class CursorMapper extends CachedValueMapper<IDBCursor, EIDBCursor, string | string[] | null> {
  protected _createValue(source: IDBCursor, keyPath: string | string[] | null): EIDBCursor {
    const encryptor = new EIDBEncryptor(this._encryptionModule, keyPath, this._keyEncryptor);
    return new EIDBCursor(source, encryptor, this._mapper);
  }
}

export class CursorWithValueMapper extends CachedValueMapper<IDBCursorWithValue, EIDBCursorWithValue, string | string[] | null> {
  protected _createValue(source: IDBCursorWithValue, keyPath: string | string[] | null): EIDBCursorWithValue {
    const encryptor = new EIDBEncryptor(this._encryptionModule, keyPath, this._keyEncryptor);
    return new EIDBCursorWithValue(source, this._mapper, encryptor);
  }
}

export class IndexMapper extends CachedValueMapper<IDBIndex, EIDBIndex> {
  protected _createValue(source: IDBIndex): EIDBIndex {
    return new EIDBIndex(source, this._mapper);
  }
}
