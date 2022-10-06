import {IDBRequest} from "fake-indexeddb";

export class RequestUtils {
    public static requestToPromise<T>(idbRequest: IDBRequest<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            idbRequest.onsuccess = () => {
                resolve(idbRequest.result);
            }
            idbRequest.onerror = () => {
                reject(idbRequest.error);
            }
        });
    }
}