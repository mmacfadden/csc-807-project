import {EIDBRequest} from "./EIDBRequest";
import {EIDBIndex} from "./EIDBIndex";
import {EIDBTransaction} from "./EIDBTransaction";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {EncryptionModule} from "../module";
import {IEncryptedDocument} from "./IEncryptedDocument";
import {MutableIDBRequest} from "./MutableIDBRequest";
import {KeyPathUtil, RequestUtils} from "../util/";
import {OpeEncryptor} from "../ope/OpeEncryptor";
import {EIDBKeyEncryptor} from "./EIDBKeyEncryptor";

export class EIDBObjectStore implements IDBObjectStore {
    private readonly _store: IDBObjectStore;
    private readonly _valueMapper: EIDBValueMapper;
    private readonly _encryptionModule: EncryptionModule;
    private readonly _keyEncryptor: EIDBKeyEncryptor;

    constructor(store: IDBObjectStore,
                encryptionModule: EncryptionModule,
                opeEncryptor: OpeEncryptor,
                valueMapper: EIDBValueMapper) {
        this._store = store;
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
        return KeyPathUtil.unwrapKeyPath(this._store.keyPath);
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

    public createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IDBIndex {
        const idx = this._store.createIndex(name, keyPath, options);
        return this._valueMapper.indexMapper.map(idx);
    }

    public delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
        const key = this._keyEncryptor.encryptKeyOrRange(query)!;
        return new EIDBRequest(this._store.delete(key), this._valueMapper);
    }

    public deleteIndex(name: string): void {
        this._store.deleteIndex(name);
    }

    public get(query: IDBValidKey | IDBKeyRange): IDBRequest {
        const result = new MutableIDBRequest(this, this.transaction);
        const encryptedQuery = this._keyEncryptor.encryptKeyOrRange(query)!;
        const getReq = this._store.get(encryptedQuery);

        getReq.onsuccess = () => {
            const encryptedDoc = <IEncryptedDocument>getReq.result;
            this._encryptionModule.decrypt(encryptedDoc.value)
                .then(v => {
                    result.succeed(v);
                })
                .catch(e => {
                    result.fail(e);
                });
        }

        return result;
    }

    public getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
        const result = new MutableIDBRequest<any[]>(this, this.transaction);

        const encryptedQuery = this._keyEncryptor.encryptKeyOrRange(query);

        const getReq = this._store.getAll(encryptedQuery);
        getReq.onsuccess = () => {
            const encryptedDocs = <IEncryptedDocument[]>getReq.result;
            const promises = encryptedDocs.map(encryptedDoc => {
                return this._decrypt(encryptedDoc);
            });
            Promise.all(promises)
                .then(docs => {
                    result.succeed(docs);
                })
                .catch(e => {
                    result.fail(e);
                });
        }

        return result;
    }

    public getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
        return new EIDBRequest(this._store.getAllKeys(query, count), this._valueMapper);
    }

    public getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
        return new EIDBRequest(this._store.getKey(query), this._valueMapper);
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

    private async _encrypt(value: any): Promise<IEncryptedDocument> {
        const key = this._extractAndEncryptKeys(value, this.keyPath);
        const encryptedValue = await this._encryptionModule.encrypt(value);
        return {
            key,
            indices: [],
            value: encryptedValue
        };
    }

    private async _decrypt(value: IEncryptedDocument): Promise<any> {
        return await this._encryptionModule.decrypt(value.value);
    }

    private _encryptAndStore(value: any, key: IDBValidKey | undefined, storeMethod: (value: any, key?: IDBValidKey) => IDBRequest): IDBRequest<IDBValidKey> {
        const result = new MutableIDBRequest<IDBValidKey>(this, this.transaction);
        this._encrypt(value)
            .then((v) => {
                return RequestUtils.requestToPromise(storeMethod(v, key));
            })
            .then(v => {
                result.succeed(v);
            })
            .catch(err => {
                result.fail(err);
            });

        return result;
    }

    private _extractAndEncryptKeys(source: any, path: string | string[]): any {
        if (!Array.isArray(path)) {
            path = [path];
        }

        const target: any = {};

        path.forEach(p => {
            const pathComponents = p.split(".");
            let curSourceVal = source;
            let curTargetVal = target;
            for (let i = 0; i < pathComponents.length; i++) {
                const prop = pathComponents[i];
                curSourceVal = source[prop];

                if (i === pathComponents.length - 1) {
                    target[prop] = this._keyEncryptor.encryptKey(curSourceVal);
                    break;
                } else if (target[prop] === undefined) {
                    target[prop] = {};
                }

                curTargetVal = target[prop];

                if (curSourceVal === undefined || curSourceVal === null) {
                    throw new Error("Unable to extract key from document");
                }
            }
        });

        return target;
    }
}