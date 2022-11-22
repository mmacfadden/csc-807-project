import {EIDBObjectStore} from "./EIDBObjectStore";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {wrapEventWithTarget} from "./EventWrapper";
import {KeyPathUtil} from "../util";
import {DatabaseNameUtil} from "../util/DatabaseNameUtil";

export class EIDBDatabase extends EventTarget implements IDBDatabase {

    private readonly _db: IDBDatabase;
    private readonly _valueMapper: EIDBValueMapper;

    constructor(db: IDBDatabase, valueMapper: EIDBValueMapper) {
        super();
        this._db = db;
        this._valueMapper= valueMapper;
        this._bindEvents();
    }

    private _bindEvents(): void {
        this._db.onversionchange = (ev: IDBVersionChangeEvent) => {
            const proxy = wrapEventWithTarget(ev, this);
            this.onversionchange(proxy);
        };

        this._db.onabort = (ev: Event) => {
            const proxy = wrapEventWithTarget(ev, this);
            this.onabort(proxy);
        };

        this._db.onclose = (ev: Event) => {
            const proxy = wrapEventWithTarget(ev, this);
            this.onclose(proxy);
        };

        this._db.onerror = (ev: Event) => {
            const proxy = wrapEventWithTarget(ev, this);
            this.onerror(proxy);
        };

        // TODO bind the general event listener stuff as well, we need to
        //  know what events can be thrown and listen to them.
    }

    get name(): string {
        return DatabaseNameUtil.unprefixName(this._db.name);
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
        // TODO deep clone
        if (options?.keyPath) {
            options.keyPath = KeyPathUtil.wrapKeyPath(options.keyPath);
        }

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