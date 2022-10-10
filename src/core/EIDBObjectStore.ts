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

    get autoIncrement(): boolean {
        return this._store.autoIncrement;
    }

    get indexNames(): DOMStringList {
        return this._store.indexNames;
    }

    get keyPath(): string | string[] {
        return KeyPathUtil.unwrapKeyPath(this._store.keyPath);
    }

    get name(): string {
        return this._store.name
    }

    get transaction(): EIDBTransaction {
        return this._valueMapper.transactionMapper.map(this._store.transaction);
    }

    add(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey> {
        const result = new MutableIDBRequest<IDBValidKey>(this, this.transaction);
        this._encrypt(value)
            .then((v) => {
                return RequestUtils.requestToPromise(this._store.add(v, key));
            })
            .then(v => {
                result.succeed(v);
            })
            .catch(err => {
                result.fail(err);
            });

        return result;
    }

    put(value: any, key?: IDBValidKey): IDBRequest<IDBValidKey> {
        // TODO refactor since its basically the same as add.
        const result = new MutableIDBRequest<IDBValidKey>(this, this.transaction);
        this._encrypt(value)
            .then((v) => {
                return RequestUtils.requestToPromise(this._store.put(v, key));
            })
            .then(v => {
                result.succeed(v);
            })
            .catch(err => {
                result.fail(err);
            });

        return result;
    }

    clear(): IDBRequest<undefined> {
        return new EIDBRequest(this._store.clear(), this._valueMapper);
    }

    count(query?: IDBValidKey | IDBKeyRange): EIDBRequest<number> {
        return new EIDBRequest(this._store.count(query), this._valueMapper);
    }

    createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IDBIndex {
        const idx = this._store.createIndex(name, keyPath, options);
        return this._valueMapper.indexMapper.map(idx);
    }

    delete(query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
        const key = this._keyEncryptor.encryptKeyOrRange(query)!;
        return new EIDBRequest(this._store.delete(key), this._valueMapper);
    }

    deleteIndex(name: string): void {
        this._store.deleteIndex(name);
    }

    get(query: IDBValidKey | IDBKeyRange): IDBRequest {
        const result = new MutableIDBRequest(this, this.transaction);
        const encryptedQuery = this._keyEncryptor.encryptKeyOrRange(query)!;
        const getReq = this._store.get(encryptedQuery);

        getReq.onsuccess = () => {
            const encryptedDoc = <IEncryptedDocument>getReq.result;
            this._encryptionModule.decrypt(encryptedDoc.value).then(v => {
                const decryptedDoc = JSON.parse(v);
                result.succeed(decryptedDoc);
            }).catch(e => {
                result.fail(e);
            })
        }

        return result;
    }

    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<any[]> {
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
                }).catch(e => {
                result.fail(e);
            });
        }

        return result;
    }

    getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBValidKey[]> {
        return new EIDBRequest(this._store.getAllKeys(query, count), this._valueMapper);
    }

    getKey(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
        return new EIDBRequest(this._store.getKey(query), this._valueMapper);
    }

    index(name: string): EIDBIndex {
        const idx = this._store.index(name);
        return this._valueMapper.indexMapper.map(idx);
    }

    openCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursorWithValue | null> {
        return new EIDBRequest(
            this._store.openCursor(query, direction),
            this._valueMapper,
            c => this._valueMapper.cursorWithValueMapper.mapNullable(c)
        );
    }

    openKeyCursor(query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): IDBRequest<IDBCursor | null> {
        return new EIDBRequest(
            this._store.openKeyCursor(query, direction),
            this._valueMapper,
            c => this._valueMapper.cursorMapper.mapNullable(c)
        );
    }

    private async _encrypt(value: any): Promise<IEncryptedDocument> {

        const key = this.copyAndEncryptKeys(value, this.keyPath);

        // FIXME probably move the stringificaiton into the encryption modules.
        const encryptedValue = await this._encryptionModule.encrypt(JSON.stringify(value));

        const encryptedDoc: IEncryptedDocument = {
            key,
            indices: [],
            value: encryptedValue
        }

        return encryptedDoc;
    }

    private async _decrypt(value: IEncryptedDocument): Promise<any> {
        const decryptedValue = await this._encryptionModule.decrypt(value.value);
        return JSON.parse(decryptedValue);
    }

    // TODO change name to mention more about extracting and encrypting.
    private copyAndEncryptKeys(source: any, path: string | string[]): any {
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
                    const encryptedKey = this._keyEncryptor.encryptKey(curSourceVal);
                    target[prop] = encryptedKey;
                    break;
                } else if (target[prop] === undefined) {
                    target[prop] = {};
                }

                curTargetVal = target[prop];

                if (curSourceVal === undefined || curSourceVal === null) {
                    // TODO this seems like an error case.
                    break;
                }
            }
        });

        return target;

    }
}