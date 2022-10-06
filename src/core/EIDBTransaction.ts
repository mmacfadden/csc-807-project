import {AbstractEventTarget} from "./AbstractEventTarget";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {IDBTransaction} from "fake-indexeddb";

export class EIDBTransaction extends AbstractEventTarget implements IDBTransaction {
    private readonly _tx: IDBTransaction;
    private readonly _valueMapper: EIDBValueMapper;

    constructor(transaction: IDBTransaction, valueMapper: EIDBValueMapper) {
        super();
        this._tx = transaction;
        this._valueMapper = valueMapper;
    }

    get db(): IDBDatabase {
        return this._valueMapper.dbMapper.map(this._tx.db);
    }

    get durability(): IDBTransactionDurability {
        return this._tx.durability;
    }

    get error(): DOMException | null {
        return this._tx.error;
    }

    get mode(): IDBTransactionMode {
        return this._tx.mode;
    }

    get objectStoreNames(): DOMStringList {
        return this._tx.objectStoreNames;
    }

    abort(): void {
        this._tx.abort();
    }

    commit(): void {
        this._tx.commit();
    }

    objectStore(name: string): IDBObjectStore {
        const store = this._tx.objectStore(name);
        return this._valueMapper.objectStoreMapper.map(store);
    }

    onabort(_: Event): any {
    }

    oncomplete(_: Event): any {
    }

    onerror(_: Event): any {
    }

}