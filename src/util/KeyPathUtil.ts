export type IDBKeyPath = string | string[];

export class KeyPathUtil {
  public static KEY_WRAPPER = "keys.";

  public static mapKeyPath(keyPath: IDBKeyPath | null): IDBKeyPath | null {
    if (keyPath === null || keyPath === undefined) {
      return null;
    } else if (Array.isArray(keyPath)) {
      return keyPath
          .map((k, i) => KeyPathUtil.getKey(i))
          .map(KeyPathUtil.wrapStringKeyPath);
    } else if (typeof keyPath === "string") {
      return KeyPathUtil.wrapStringKeyPath(KeyPathUtil.getKey(0));
    } else {
      throw Error("Invalid key path: " + keyPath)
    }
  }

  public static getKey(keyIndex: number): string {
    if (keyIndex < 0) {
      throw new Error("keyIndex must be >= 0");
    }

    return `k${keyIndex}`;
  }

  public static wrapStringKeyPath(keyPath: string): string {
    return KeyPathUtil.KEY_WRAPPER + keyPath;
  }
}