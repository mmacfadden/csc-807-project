import {EIDBOpenDBRequest} from "./EIDBOpenDBRequest";

export class EIDBFactory implements IDBFactory {

    public cmp(first: any, second: any): number {
        return globalThis.indexedDB.cmp(first, second);

    }

    public databases(): Promise<IDBDatabaseInfo[]> {
        return globalThis.indexedDB.databases();
    }

    public deleteDatabase(name: string): EIDBOpenDBRequest {
        const request = indexedDB.deleteDatabase(name);
        return new EIDBOpenDBRequest(request);
    }

    public open(name: string, version?: number): EIDBOpenDBRequest {
        const request = globalThis.indexedDB.open(name, version)
        return new EIDBOpenDBRequest(request);
    }
}