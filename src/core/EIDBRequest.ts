import {EIDBValueMapper, ValueMapper} from "./EIDBValueMapper";

export class EIDBRequest<T = any, R = any> implements IDBRequest<T> {
    private readonly _request: IDBRequest<R>;

    result: T = <any>null;
    transaction: IDBTransaction | null = null;
    source: IDBObjectStore | IDBIndex | IDBCursor;

    constructor(request: IDBRequest<R>,
                mapper: EIDBValueMapper,
                resultMapper?: ValueMapper<R, T>) {
        this._request = request;

        if (request.transaction) {
            this.transaction = mapper.transactionMapper.map(request.transaction);
        }

        // FIXME this is broken inside.
        this.source = mapper.mapSource(request.source);

        request.onerror = (event) => {
            this.onerror(event);
        };

        request.onsuccess = (event) => {
            if (request.result && resultMapper) {
                this.result = resultMapper(request.result);
            }

            this.onsuccess(event)
        };
    }

    get error(): DOMException | null {
        return this._request.error;
    };

    get readyState(): IDBRequestReadyState {
        return this._request.readyState;
    }

    onerror(_: Event): any {

    }

    onsuccess(_: Event): any {

    }

    addEventListener<K extends keyof IDBRequestEventMap>(type: K, listener: (this: IDBRequest, ev: IDBRequestEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: any, listener: any, options?: boolean | AddEventListenerOptions): void {
    }

    dispatchEvent(event: Event): boolean {
        return false;
    }

    removeEventListener<K extends keyof IDBRequestEventMap>(type: K, listener: (this: IDBRequest, ev: IDBRequestEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
    removeEventListener(type: any, listener: any, options?: boolean | EventListenerOptions): void {
    }
}