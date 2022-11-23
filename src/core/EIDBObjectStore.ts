import {EIDBRequest} from "./EIDBRequest";
import {EIDBIndex} from "./EIDBIndex";
import {EIDBTransaction} from "./EIDBTransaction";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {EncryptionModule} from "../module";
import {IEncryptedDocument} from "./IEncryptedDocument";
import {MutableIDBRequest} from "./MutableIDBRequest";
import {OpeEncryptor} from "../ope/OpeEncryptor";
import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";
import {EIDBObjectStoreConfig} from "../config/EIDBObjectStoreConfig";

export class EIDBObjectStore implements IDBObjectStore {
    private readonly _store: IDBObjectStore;
    private readonly _valueMapper: EIDBValueMapper;
    private readonly _encryptionModule: EncryptionModule;
    private readonly _keyEncryptor: EIDBKeyEncryptor;
    private readonly _config: EIDBObjectStoreConfig;

    constructor(store: IDBObjectStore,
                config: EIDBObjectStoreConfig,
                encryptionModule: EncryptionModule,
                opeEncryptor: OpeEncryptor,
                valueMapper: EIDBValueMapper) {
        this._store = store;
        this._config = config;
        this._valueMapper = valueMapper;
        this._encryptionModule = encryptionModule;
        this._keyEncryptor = new EIDBKeyEncryptor(opeEncryptor);
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
        return this._encryptAndStore(value, key, (v, k ) => this._store.add(v, k));
    }

    public put(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey> {
        return this._encryptAndStore(value, key, (v, k ) =>  this._store.put(v, k));
    }

    public clear(): IDBRequest<undefined> {
        return new EIDBRequest(this._store.clear(), this._valueMapper);
    }

    public count(query?: IDBValidKey | IDBKeyRange): EIDBRequest<number> {
        return new EIDBRequest(this._store.count(query), this._valueMapper);
    }

    public delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
        const key = this._keyEncryptor.encryptKeyOrRange(query)!;
        return new EIDBRequest(this._store.delete(key), this._valueMapper);
    }

    public get(query: IDBValidKey | IDBKeyRange): IDBRequest {
        const result = new MutableIDBRequest(this, this.transaction);
        const encryptedQuery = this._keyEncryptor.encryptKeyOrRange(query)!;
        const getReq = this._store.get(encryptedQuery);
        getReq.onsuccess = () => {
            const encryptedDoc = <IEncryptedDocument>getReq.result;
            try {
                const v = this._encryptionModule.decrypt(encryptedDoc.value)
                result.succeed(v);
            } catch (e) {
                result.fail(e as DOMException);
            }
        }

        return result;
    }

    public getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
        const result = new MutableIDBRequest<any[]>(this, this.transaction);

        const encryptedQuery = this._keyEncryptor.encryptKeyOrRange(query);

        const getReq = this._store.getAll(encryptedQuery);
        getReq.onsuccess = () => {
            const encryptedDocs = <IEncryptedDocument[]>getReq.result;
            try {
                const docs = encryptedDocs.map(encryptedDoc => this._decrypt(encryptedDoc))
                result.succeed(docs);
            } catch (e) {
              result.fail(e as DOMException);
            }
        }

        return result;
    }

    public getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
        return new EIDBRequest(this._store.getAllKeys(query, count), this._valueMapper);
    }

    public getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
        return new EIDBRequest(this._store.getKey(query), this._valueMapper);
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
        const resultMapper = (c: any) => this._valueMapper.cursorWithValueMapper.mapNullable(c);
        return new EIDBRequest(
            this._store.openCursor(query, direction),
            this._valueMapper,
            resultMapper
        );
    }

    public openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null> {
        const resultMapper = (c: any) => this._valueMapper.cursorMapper.mapNullable(c);
        return new EIDBRequest(
            this._store.openKeyCursor(query, direction),
            this._valueMapper,
            resultMapper
        );
    }

    private _encrypt(value: any): IEncryptedDocument {

        const keys = this._extractAndEncryptKeys(value, this._config.getKeyPath());
        const encryptedValue = this._encryptionModule.encrypt(value);
        return {
            keys,
            indices: [],
            value: encryptedValue
        };
    }

    private _decrypt(value: IEncryptedDocument): any {
        return this._encryptionModule.decrypt(value.value);
    }

    private _encryptAndStore(value: any, key: IDBValidKey | undefined, storeMethod: (value: any, key?: IDBValidKey) => IDBRequest): IDBRequest<IDBValidKey> {
        const result = new MutableIDBRequest<IDBValidKey>(this, this.transaction);
        try {
            const v =  this._encrypt(value);
            const req = storeMethod(v, key);

            req.onsuccess = () => {
              result.succeed(req.result);
            }

            req.onerror = () => {
              result.fail(req.error!);
            }
        } catch (e) {
            // Need to do this async so that the event gets emitted
            // after the caller has a chance to bind to the events.
            setTimeout(() => {
              result.fail(e as DOMException);
            }, 0);
        }

        return result;
    }

    private _extractAndEncryptKeys(source: any, path: string | string[] | null): any {
        if (path === null) {
            return null;
        }

        if (!Array.isArray(path)) {
            path = [path];
        }

        const target: any = {};

        path.forEach((p, k) => {
            const pathComponents = p.split(".");
            let curSourceVal = source;

            for (let i = 0; i < pathComponents.length; i++) {
                const prop = pathComponents[i];
                curSourceVal = source[prop];

                if (i === pathComponents.length - 1) {
                    target[`k${k}`] = this._keyEncryptor.encryptKey(curSourceVal);
                    break;
                }

                if (curSourceVal === undefined || curSourceVal === null) {
                    throw new Error("Unable to extract key from document");
                }
            }
        });

        return target;
    }
}