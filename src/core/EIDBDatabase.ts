import {EIDBObjectStore} from "./EIDBObjectStore";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {wrapEventWithTarget} from "./EventWrapper";
import {KeyPathUtil} from "../util";
import {DatabaseNameUtil} from "../util/DatabaseNameUtil";
import {EIDBDatabaseConfig} from "../config/EIDBDatabaseConfig";

export class EIDBDatabase extends EventTarget implements IDBDatabase {

  private readonly _db: IDBDatabase;
  private readonly _valueMapper: EIDBValueMapper;
  private readonly _config: EIDBDatabaseConfig;

  constructor(db: IDBDatabase, config: EIDBDatabaseConfig, valueMapper: EIDBValueMapper) {
    super();
    this._db = db;
    this._valueMapper = valueMapper;
    this._config = config;
    this._bindEvents();
  }

  public get name(): string {
    return DatabaseNameUtil.unprefixName(this._db.name);
  }

  public get objectStoreNames(): DOMStringList {
    return this._db.objectStoreNames;
  }

  public get version(): number {
    return this._db.version;
  }

  public onabort(_: Event): any {
  }

  public onclose(_: Event): any {
  }

  public onerror(_: Event): any {
  }

  public onversionchange(_: IDBVersionChangeEvent): any {
  }

  public close(): void {
    this._db.close();
  }

  public createObjectStore(name: string, options?: IDBObjectStoreParameters): EIDBObjectStore {
    const originalKeyPath = options?.keyPath;

    if (options?.keyPath) {
      options.keyPath = KeyPathUtil.mapKeyPath(options.keyPath);
    }

    this._config.addObjectStoreConfig(name, originalKeyPath || null);

    const store = this._db.createObjectStore(name, options);
    return this._valueMapper.objectStoreMapper.map(store, this);
  }

  public deleteObjectStore(name: string): void {
    this._config.deleteObjectStoreConfig(name);
    this._db.deleteObjectStore(name);
  }

  public transaction(storeNames: string | string[], mode?: IDBTransactionMode, options?: IDBTransactionOptions): IDBTransaction {
    const tx = this._db.transaction(storeNames, mode, options);
    return this._valueMapper.transactionMapper.map(tx);
  }

  private _bindEvents(): void {
    this._db.onversionchange = (ev: IDBVersionChangeEvent) => {
      this.onversionchange(wrapEventWithTarget(ev, this));
    };

    this._db.onabort = (ev: Event) => {
      this.onabort(wrapEventWithTarget(ev, this));
    };

    this._db.onclose = (ev: Event) => {
      this.onclose(wrapEventWithTarget(ev, this));
    };

    this._db.onerror = (ev: Event) => {
      this.onerror(wrapEventWithTarget(ev, this));
    };

    // TODO bind the general event listener stuff as well, we need to
    //  know what events can be thrown and listen to them.
  }
}