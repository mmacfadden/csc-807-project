export abstract class EIDBKeyEncryptor {

  public encryptKeyOrRange(query?: IDBValidKey | IDBKeyRange | null): IDBValidKey | IDBKeyRange | undefined {
    if (query === null || query === undefined) {
      return undefined;
    } else if (query instanceof IDBKeyRange) {
      return this.encryptKeyRange(query);
    } else {
      return this.encryptKey(query);
    }
  }

  public encryptKeyRange(keyRange: IDBKeyRange): IDBKeyRange {
    if (keyRange.lower !== undefined && keyRange.upper === undefined) {
      const lower = this.encryptKey(keyRange.lower);
      return IDBKeyRange.lowerBound(lower, keyRange.lowerOpen);
    } else if (keyRange.lower === undefined && keyRange.upper !== undefined) {
      const upper = this.encryptKey(keyRange.upper);
      return IDBKeyRange.upperBound(upper, keyRange.upperOpen);
    } else if (keyRange.lower !== undefined && keyRange.upper !== undefined) {
      const lower = this.encryptKey(keyRange.lower);
      const upper = this.encryptKey(keyRange.upper);
      return IDBKeyRange.bound(lower, upper, keyRange.lowerOpen, keyRange.upperOpen);
    } else {
      throw new Error("either the upper or lower bound must be set.");
    }
  }

  public encryptKey(key: IDBValidKey): IDBValidKey {
    if (Array.isArray(key)) {
      return key.map((k: IDBValidKey) => {
        return this.encryptKey(k);
      });
    } else {
      return this.encryptSingleKey(key);
    }
  }

  public abstract encryptSingleKey(key: number | string | Date | BufferSource): any;
}