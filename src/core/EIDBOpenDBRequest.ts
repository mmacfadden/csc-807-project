import {EIDBRequest} from "./EIDBRequest";
import {EIDBDatabase} from "./EIDBDatabase";
import {EIDBValueMapper, ValueMapper} from "./EIDBValueMapper";
import {wrapEventWithTarget} from "./EventWrapper";

export class EIDBOpenDBRequest extends EIDBRequest<EIDBDatabase, IDBDatabase> implements IDBOpenDBRequest {
    constructor(request: IDBOpenDBRequest,
                mapper: EIDBValueMapper,
                dbMapper: ValueMapper<IDBDatabase, EIDBDatabase>) {
        super(request, mapper, dbMapper);

        request.onblocked = (event: Event) => {
            const proxy = wrapEventWithTarget(event, this);
            this.onblocked(proxy);
        }

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const proxy = wrapEventWithTarget(event, this);
            this.onupgradeneeded(proxy);
        }
    }

    onblocked(_: Event): any {
    }

    onupgradeneeded(_: IDBVersionChangeEvent): any {
    }
}