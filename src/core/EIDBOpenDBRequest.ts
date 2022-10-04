import {EIDBRequest} from "./EIDBRequest";
import {EIDBDatabase} from "./EIDBDatabase";
import {mapIDBDatabase} from "./IValueMapper";

export class EIDBOpenDBRequest extends EIDBRequest<EIDBDatabase, IDBDatabase> implements IDBOpenDBRequest {
    constructor(request: IDBOpenDBRequest) {
        super(request, mapIDBDatabase);

        request.onblocked = (event: Event) => {
            this.onblocked(event);
        }

        request.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
            this.onupgradeneeded(ev);
        }
    }

    onblocked(_: Event): any {
    }

    onupgradeneeded(_: IDBVersionChangeEvent): any {
    }
}