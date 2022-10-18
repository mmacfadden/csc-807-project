export class RequestUtils {
    public static requestToPromise<T>(idbRequest: IDBRequest<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            idbRequest.onsuccess = () => {
                console.log("got an success", idbRequest.result);
                resolve(idbRequest.result);
            }
            idbRequest.onerror = () => {
                console.log("got an error", idbRequest.error);
                reject(idbRequest.error);
            }
        });
    }
}