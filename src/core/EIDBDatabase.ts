import {AbstractEventTarget} from "./AbstractEventTarget";
import {EIDBObjectStore} from "./EIDBObjectStore";
import {EIDBValueMapper} from "./EIDBValueMapper";

export class EIDBDatabase extends AbstractEventTarget implements IDBDatabase {

    private readonly _db: IDBDatabase;
    private readonly _valueMapper: EIDBValueMapper;

    constructor(db: IDBDatabase, valueMapper: EIDBValueMapper) {
        super();
        this._db = db;
        this._valueMapper= valueMapper;
        this._bindEvents();
    }

    private _bindEvents(): void {
        // TODO wrap / update events to make sure that the
        //  target references this object and not the original
        //  indexed db.

        this._db.onversionchange = (ev: IDBVersionChangeEvent) => {
            this.onversionchange(ev);
        };

        this._db.onabort = (ev: Event) => {
            this.onabort(ev);
        };

        this._db.onclose = (ev: Event) => {
            this.onclose(ev);
        };

        this._db.onerror = (ev: Event) => {
            this.onerror(ev);
        };

        // TODO bind the general event listener stuff as well, we need to
        //  know what events can be thrown and listen to them.
    }

    get name(): string {
        return this._db.name
    }
    get objectStoreNames(): DOMStringList {
        return this._db.objectStoreNames
    }

    get version(): number {
        return this._db.version;
    }

    onabort(_: Event): any {
    }

    onclose(_: Event): any {
    }

    onerror(_: Event): any {
    }

    onversionchange(_: IDBVersionChangeEvent): any {
    }

    close(): void {
        this._db.close();
    }

    createObjectStore(name: string, options?: IDBObjectStoreParameters): EIDBObjectStore {
        const store = this._db.createObjectStore(name, options);
        return this._valueMapper.objectStoreMapper.map(store);
    }

    deleteObjectStore(name: string): void {
        this._db.deleteObjectStore(name)
    }

    transaction(storeNames: string | string[], mode?: IDBTransactionMode, options?: IDBTransactionOptions): IDBTransaction {
        const tx = this._db.transaction(storeNames, mode, options);
        return this._valueMapper.transactionMapper.map(tx);
    }
}