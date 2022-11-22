import * as CryptoJS from 'crypto-js';

export class NamespacedStorage {

  private readonly _storage: Storage;
  private readonly _storageKeyPrefix: string;
  private readonly _username: string;

  constructor(storage: Storage, storageKeyPrefix: string, username: string) {
    this._storage = storage;
    if (!storage) {
      throw new Error("The storage must be defined");
    }

    this._storageKeyPrefix = storageKeyPrefix;
    this._username = username;
  }

  public hasItem(key: string): boolean {
    const resolvedKey = this._resolveKey(this._username, key);
    return this._storage.getItem(resolvedKey) !== null;
  }

  public getItem(key: string): string | null {
    const resolvedKey = this._resolveKey(this._username, key);
    return this._storage.getItem(resolvedKey);
  }

  public setItem(key: string, value: string): void {
    const resolvedKey = this._resolveKey(this._username, key);
    this._storage.setItem(resolvedKey, value);
  }

  public removeItem(key: string): void {
    const resolvedKey = this._resolveKey(this._username, key);
    this._storage.removeItem(resolvedKey);
  }

  /**
   * A helper method to result the user scoped Storage key
   * with the key prefix.
   *
   * @param username
   *   The username to get the key for.
   * @param key
   *   The specific key to get the string for.
   *
   * @private
   */
  private _resolveKey(username: string, key: string): string {
    const hash = CryptoJS.enc.Base64.stringify(CryptoJS.SHA512(username));
    return `${this._storageKeyPrefix}_${key}_${hash}`;
  }
}