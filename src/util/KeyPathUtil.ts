export type IDBKeyPath = string | string[];

export class KeyPathUtil {
    public static KEY_WRAPPER = "key.";

    public static wrapKeyPath(keyPath: IDBKeyPath): IDBKeyPath {
         if (Array.isArray(keyPath)) {
            return keyPath.map(KeyPathUtil.wrapStringKeyPath);
        } else if (typeof keyPath === "string") {
            return KeyPathUtil.wrapStringKeyPath(keyPath);
        } else {
            throw Error("Invalid key path: " + keyPath)
        }
    }

    public static unwrapKeyPath(keyPath: IDBKeyPath): IDBKeyPath {
       if (Array.isArray(keyPath)) {
            return keyPath.map(KeyPathUtil.unwrapStringKeyPath);
        } else if (typeof keyPath === "string") {
            return KeyPathUtil.unwrapStringKeyPath(keyPath);
        } else {
            throw Error("Invalid key path: " + keyPath)
        }
    }

    public static wrapStringKeyPath(keyPath: string): string {
        return KeyPathUtil.KEY_WRAPPER + keyPath;
    }

    public static unwrapStringKeyPath(keyPath: string): string {
        return keyPath.substring(KeyPathUtil.KEY_WRAPPER.length);
    }
}