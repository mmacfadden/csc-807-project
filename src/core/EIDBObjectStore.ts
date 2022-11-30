import {EIDBRequest} from "./EIDBRequest";
import {EIDBIndex} from "./EIDBIndex";
import {EIDBTransaction} from "./EIDBTransaction";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {IEncryptedObject} from "./IEncryptedObject";
import {MutableIDBRequest} from "./MutableIDBRequest";
import {EIDBObjectStoreConfig} from "../config/EIDBObjectStoreConfig";
import {EIDBEncryptor} from "./EIDBEncryptor";

export class EIDBObjectStore implements IDBObjectStore {
  private readonly _store: IDBObjectStore;
  private readonly _valueMapper: EIDBValueMapper;
  private readonly _encryptor: EIDBEncryptor;
  private readonly _config: EIDBObjectStoreConfig;

  constructor(store: IDBObjectStore,
              config: EIDBObjectStoreConfig,
              encryptor: EIDBEncryptor,
              valueMapper: EIDBValueMapper) {
    this._store = store;
    this._config = config;
    this._valueMapper = valueMapper;
    this._encryptor = encryptor;
  }

  public get autoIncrement(): boolean {
    return this._store.autoIncrement;
  }

  public get indexNames(): DOMStringList {
    return this._store.indexNames;
  }

  public get keyPath(): string | string[] {
    return this._config.getKeyPath()!;
  }

  public get name(): string {
    return this._store.name
  }

  public get transaction(): EIDBTransaction {
    return this._valueMapper.transactionMapper.map(this._store.transaction);
  }

  public add(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey> {
    return this._encryptAndStore(value, key, (v, k) => this._store.add(v, k));
  }

  public put(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey> {
    return this._encryptAndStore(value, key, (v, k) => this._store.put(v, k));
  }

  public clear(): IDBRequest<undefined> {
    const request = this._store.clear();
    return this._valueMapper.requestMapper.map(request);
  }

  public count(query?: IDBValidKey | IDBKeyRange): EIDBRequest<number> {
    const request = this._store.count(query);
    return this._valueMapper.requestMapper.map(request);
  }

  public delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
    const encryptedQuery = this._encryptor.encryptKeyOrRange(query)!;
    const request = this._store.delete(encryptedQuery);
    return this._valueMapper.requestMapper.map(request);
  }

  public get(query: IDBValidKey | IDBKeyRange): IDBRequest {
    const result = new MutableIDBRequest(this, this.transaction);
    const encryptedQuery = this._encryptor.encryptKeyOrRange(query)!;
    const getReq = this._store.get(encryptedQuery);
    getReq.onsuccess = () => {
      const encryptedDoc = <IEncryptedObject>getReq.result;
      try {
        if (encryptedDoc) {
          const v = this._encryptor.decrypt(encryptedDoc);
          result.succeed(v);
        } else {
          result.succeed(encryptedDoc);
        }
      } catch (e) {
        this._failLater(result, e as DOMException);
      }
    }

    return result;
  }

  public getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
    const result = new MutableIDBRequest<any[]>(this, this.transaction);

    const encryptedQuery = this._encryptor.encryptKeyOrRange(query);

    const getReq = this._store.getAll(encryptedQuery);
    getReq.onsuccess = () => {
      const encryptedDocs = getReq.result as IEncryptedObject[];
      try {
        const docs = encryptedDocs.map(encryptedDoc => this._encryptor.decrypt(encryptedDoc))
        result.succeed(docs);
      } catch (e) {
        this._failLater(result, e as DOMException);
      }
    }

    getReq.onerror = () => {
      result.fail(getReq.error!);
    }

    return result;
  }

  public getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
    const result = new MutableIDBRequest<any[]>(this, this.transaction);
    const encryptedQuery = this._encryptor.encryptKeyOrRange(query);
    const getReq = this._store.getAllKeys(encryptedQuery, count);
    getReq.onsuccess = () => {
      const encryptedKeys = getReq.result;
      try {
        const keys = encryptedKeys.map(encryptedKey => this._encryptor.decryptKey(encryptedKey));
        result.succeed(keys);
      } catch (e) {
        this._failLater(result, e as DOMException);
      }
    }

    getReq.onerror = () => {
      result.fail(getReq.error!);
    }

    return result;
  }

  public getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
    const result = new MutableIDBRequest<IDBValidKey | undefined>(this, this.transaction);
    const encryptedQuery = this._encryptor.encryptKeyOrRange(query);
    const getReq = this._store.getKey(encryptedQuery!)
    getReq.onsuccess = () => {
      const encryptedKey = getReq.result;
      try {
        const key = encryptedKey ? this._encryptor.decryptKey(encryptedKey) : undefined;
        result.succeed(key);
      } catch (e) {
        this._failLater(result, e as DOMException);
      }
    }

    getReq.onerror = () => {
      result.fail(getReq.error!);
    }

    return result;
  }

  public createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IDBIndex {
    this._config.createIndex(name, keyPath);
    const idx = this._store.createIndex(name, keyPath, options);
    return this._valueMapper.indexMapper.map(idx);
  }

  public deleteIndex(name: string): void {
    this._config.removeIndex(name);
    this._store.deleteIndex(name);
  }

  public index(name: string): EIDBIndex {
    const idx = this._store.index(name);
    return this._valueMapper.indexMapper.map(idx);
  }

  public openCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null> {
    const resultMapper = (c: any) => this._valueMapper.cursorWithValueMapper.mapNullable(c, this._config.getKeyPath());
    const encryptedQuery = this._encryptor.encryptKeyOrRange(query);
    const request = this._store.openCursor(encryptedQuery, direction);
    return this._valueMapper.requestMapper.map(request, resultMapper);
  }

  public openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null> {
    const encryptedQuery = this._encryptor.encryptKeyOrRange(query);
    const resultMapper = (c: any) => this._valueMapper.cursorMapper.mapNullable(c, this._config.getKeyPath());
    const request = this._store.openKeyCursor(encryptedQuery, direction);
    return this._valueMapper.requestMapper.map(request, resultMapper);
  }

  private _encryptAndStore(value: any, key: IDBValidKey | undefined, storeMethod: (value: any, key?: IDBValidKey) => IDBRequest): IDBRequest<IDBValidKey> {
    const result = new MutableIDBRequest<IDBValidKey>(this, this.transaction);
    try {
      const v = this._encryptor.encrypt(value);
      const req = storeMethod(v, key);

      req.onsuccess = () => {
        const key = this._encryptor.decryptKey(req.result);
        result.succeed(key);
      }

      req.onerror = () => {
        result.fail(req.error!);
      }
    } catch (e) {
      // Need to do this async so that the event gets emitted
      // after the caller has a chance to bind to the events.
      this._failLater(result, e as DOMException);
    }

    return result;
  }

  private _failLater(req: MutableIDBRequest<any>, error: DOMException) {
    setTimeout(() => {
      req.fail(error);
    }, 0);
  }
}