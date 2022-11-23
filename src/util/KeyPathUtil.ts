export type IDBKeyPath = string | string[];

export class KeyPathUtil {
    public static KEY_WRAPPER = "keys.";

    public static mapKeyPath(keyPath: IDBKeyPath | null): IDBKeyPath | null {
        if (keyPath === null || keyPath === undefined) {
          return null;
        } else if (Array.isArray(keyPath)) {
          return keyPath
              .map((k,i) => KeyPathUtil.getKey(i))
              .map(KeyPathUtil.wrapStringKeyPath);
        } else if (typeof keyPath === "string") {
          return KeyPathUtil.wrapStringKeyPath(KeyPathUtil.getKey(0));
        } else {
          throw Error("Invalid key path: " + keyPath)
        }
    }

    public static getKey(keyNum: number): string {
      return `k${keyNum}`;
    }

    public static wrapStringKeyPath(keyPath: string): string {
        return KeyPathUtil.KEY_WRAPPER + keyPath;
    }
}