import {EIDBOpenDBRequest} from "./EIDBOpenDBRequest";
import {EIDBValueMapper} from "./EIDBValueMapper";
import {IDBDatabase} from "fake-indexeddb";

export class EIDBFactory implements IDBFactory {

    private _valueMapper = new EIDBValueMapper();

    public cmp(first: any, second: any): number {
        return globalThis.indexedDB.cmp(first, second);

    }

    public databases(): Promise<IDBDatabaseInfo[]> {
        return globalThis.indexedDB.databases();
    }

    public deleteDatabase(name: string): EIDBOpenDBRequest {
        const request = indexedDB.deleteDatabase(name);
        return new EIDBOpenDBRequest(request, this._valueMapper, (d: IDBDatabase) => this._valueMapper.dbMapper.map(d));
    }

    public open(name: string, version?: number): EIDBOpenDBRequest {
        const request = globalThis.indexedDB.open(name, version);
        return new EIDBOpenDBRequest(request, this._valueMapper,(d: IDBDatabase) => this._valueMapper.dbMapper.map(d));
    }
}