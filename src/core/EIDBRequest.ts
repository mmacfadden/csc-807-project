import {EIDBValueMapper, ValueMapper} from "./EIDBValueMapper";
import {wrapEventWithTarget} from "./EventWrapper";

export class EIDBRequest<T = any, R = any> implements IDBRequest<T> {
    private readonly _request: IDBRequest<R>;
    private readonly _resultMapper: ValueMapper<R, T> | undefined;

    transaction: IDBTransaction | null = null;
    source: IDBObjectStore | IDBIndex | IDBCursor;

    constructor(request: IDBRequest<R>,
                mapper: EIDBValueMapper,
                resultMapper?: ValueMapper<R, T>) {
        this._request = request;
        this._resultMapper = resultMapper;

        if (request.transaction) {
            this.transaction = mapper.transactionMapper.map(request.transaction);
        }

        this.source = mapper.mapSource(request.source);

        request.onerror = (event: Event) => {
            const proxy = wrapEventWithTarget(event, this);
            this.onerror(proxy);
        };

        request.onsuccess = (event: Event) => {
            const proxy = wrapEventWithTarget(event, this);
            this.onsuccess(proxy);
        };
    }

    get result(): T {
        if (this._request.result && this._resultMapper) {
            return this._resultMapper(this._request.result);
        } else {
            return <T><any>this._request.result;
        }
    }

    get error(): DOMException | null {
        return this._request.error;
    }

    get readyState(): IDBRequestReadyState {
        return this._request.readyState;
    }

    onerror(_: Event): any {

    }

    onsuccess(_: Event): any {

    }

    // TODO think about the event listener delegation. We may need to modify this
    //  to transform events and values.
    addEventListener<K extends keyof IDBRequestEventMap>(type: K, listener: (this: IDBRequest, ev: IDBRequestEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: any, listener: any, options?: boolean | AddEventListenerOptions): void {
        this._request.addEventListener(type, listener, options);
    }

    dispatchEvent(event: Event): boolean {
        return this._request.dispatchEvent(event);
    }

    removeEventListener<K extends keyof IDBRequestEventMap>(type: K, listener: (this: IDBRequest, ev: IDBRequestEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
    removeEventListener(type: any, listener: any, options?: boolean | EventListenerOptions): void {
        this._request.removeEventListener(type, listener, options);
    }
}