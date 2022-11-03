/**
 * An implementation of the HTML5 Storage API that
 * simply stores all values in memory.
 */
export class InMemoryStorage implements Storage {

  private _data: Map<string, string>;

  [name: string]: any;

  constructor() {
    this._data = new Map();

    return new Proxy(this, {
      set: (target: Storage, prop: string, value: any, _: any) => {

        if (target[prop] != null) {
          target[prop] = value;
        } else {
          target.setItem(prop, value);
        }
        return true;
      },
      get: (target: Storage, prop: string, _: any) => {
        if (target[prop] != null) {
          return target[prop];
        } else {
          return target.getItem(prop);
        }
      }
    }) as InMemoryStorage;
  }

  public get length(): number {
    return this._data.size;
  }

  public clear(): void {
    this._data.clear();
  }

  public setItem(key: string, value: string): void {
    this._data.set(key, value);
  }

  public getItem(key: string): string | null {
    return this._data.get(key) || null;
  }

  public key(index: number): string | null {
    return Array.from(this._data.keys())[index] || null;
  }

  public removeItem(key: string): void {
    this._data.delete(key);
  }
}