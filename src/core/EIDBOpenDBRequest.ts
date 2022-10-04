import {EIDBRequest} from "./EIDBRequest";
import {EIDBDatabase} from "./EIDBDatabase";
import {EIDBValueMapper, ValueMapper} from "./EIDBValueMapper";

export class EIDBOpenDBRequest extends EIDBRequest<EIDBDatabase, IDBDatabase> implements IDBOpenDBRequest {
    constructor(request: IDBOpenDBRequest, mapper: EIDBValueMapper, dbMapper: ValueMapper<IDBDatabase, EIDBDatabase>) {
        super(request, mapper, dbMapper);

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