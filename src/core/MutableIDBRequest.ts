export class MutableIDBRequest<T> extends EventTarget implements IDBRequest<T> {
  private _error: DOMException | null;
  private _result: T | undefined;
  private _readyState: IDBRequestReadyState;

  readonly _source: IDBObjectStore | IDBIndex | IDBCursor;
  readonly _transaction: IDBTransaction | null;

  constructor(source: IDBObjectStore | IDBIndex | IDBCursor, transaction: IDBTransaction | null) {
    super();
    this._readyState = "pending";
    this._error = null;
    this._source = source;
    this._transaction = transaction;
  }

  fail(error: DOMException): void {
    this._readyState = "done";
    this._error = error;
    const evt = new Event("error");
    this.dispatchEvent(evt);
    this.onerror(evt);
  }

  succeed(result: T): void {
    this._readyState = "done";
    this._result = result;
    const evt = new Event("success");
    this.dispatchEvent(evt);
    this.onsuccess(evt);
  }

  get error(): DOMException | null {
    return this._error;
  }

  get readyState(): IDBRequestReadyState {
    return this._readyState;
  }

  get result(): T {
    return this._result!;
  }

  get source(): IDBObjectStore | IDBIndex | IDBCursor {
    return this._source;
  }

  get transaction(): IDBTransaction | null {
    return this._transaction;
  }

  onerror(ev: Event): any {
  }

  onsuccess(ev: Event): any {
  }
}