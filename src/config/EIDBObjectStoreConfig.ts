import {IObjectStoreConfigData} from "./IEncryptionConfigData";

export class EIDBObjectStoreConfig {
  private readonly _config: IObjectStoreConfigData;
  private readonly _update: () => void

  constructor(config: IObjectStoreConfigData, update: () => void) {
    this._config = config;
    this._update = update;
  }

  public getKeyPath(): string | string[] | null {
    return this._config.keyPath;
  }

  public createIndex(name: string, keyPath: string | string[]): void {
    if (this._config.indices[name]) {
      throw new Error("An index with the specified name already exists: " + name);
    }
    this._config.indices[name] = keyPath;
    this._update();
  }

  public removeIndex(name: string): void {
    if (!this._config.indices[name]) {
      throw new Error("An index with the specified name does not exist: " + name);
    }
    delete this._config.indices[name];
    this._update();
  }
}